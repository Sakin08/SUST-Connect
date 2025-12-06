import Report from "../models/Report.js";
import User from "../models/User.js";
import Notification from "../models/Notification.js";
import { emitNotification } from "../socket/socketHandler.js";

// Create report
export const createReport = async (req, res) => {
  try {
    const { reportedUser, reportedItem, itemType, reason, description } =
      req.body;

    // Prevent self-reporting
    if (reportedUser && reportedUser.toString() === req.user._id.toString()) {
      return res
        .status(400)
        .json({ message: "You cannot report your own content" });
    }

    const report = await Report.create({
      reporter: req.user._id,
      reportedUser,
      reportedItem,
      itemType,
      reason,
      description,
    });

    // Increment reported count
    if (reportedUser) {
      await User.findByIdAndUpdate(reportedUser, {
        $inc: { reportedCount: 1 },
      });
    }

    // Notify all admins about the new report
    const admins = await User.find({ role: "admin" }).select("_id");
    const reasonLabels = {
      spam: "Spam",
      inappropriate: "Inappropriate Content",
      scam: "Scam or Fraud",
      harassment: "Harassment",
      fake: "Fake Information",
      other: "Other",
    };

    const itemTypeLabels = {
      user: "User",
      buysell: "Marketplace Post",
      housing: "Housing Post",
      event: "Event",
      message: "Message",
      job: "Job Post",
      lostfound: "Lost & Found Post",
      studygroup: "Study Group",
      blooddonor: "Blood Donor",
      bookrequest: "Book Request",
      comment: "Comment",
      post: "Post",
    };

    // Generate link to reported content
    const getContentLink = (type, itemId) => {
      const links = {
        buysell: `/buysell/${itemId}`,
        housing: `/housing/${itemId}`,
        event: `/events/${itemId}`,
        job: `/jobs/${itemId}`,
        lostfound: `/lost-found/${itemId}`,
        studygroup: `/study-groups/${itemId}`,
        bookrequest: `/books/${itemId}`,
        post: `/posts/${itemId}`,
        user: `/profile/${itemId}`,
      };
      return links[type] || "/admin/reports";
    };

    const adminNotifications = admins.map((admin) => ({
      recipient: admin._id,
      sender: req.user._id,
      type: "report_submitted",
      title: "🚨 New Report Submitted",
      message: `${reasonLabels[reason] || reason} - ${
        itemTypeLabels[itemType] || itemType
      }`,
      link: getContentLink(itemType, reportedItem),
      data: { reportId: report._id, reason, itemType },
    }));

    if (adminNotifications.length > 0) {
      const createdNotifications = await Notification.insertMany(
        adminNotifications
      );

      // Emit real-time notifications to online admins
      const io = req.app.get("io");
      if (io) {
        createdNotifications.forEach((notification, index) => {
          emitNotification(io, admins[index]._id, notification);
        });
      }
    }

    res.status(201).json({ message: "Report submitted successfully", report });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get user's reports
export const getMyReports = async (req, res) => {
  try {
    const reports = await Report.find({ reporter: req.user._id })
      .populate("reportedUser", "name email")
      .sort({ createdAt: -1 });

    res.json(reports);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Admin: Get all reports
export const getAllReports = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Admin access required" });
    }

    const reports = await Report.find()
      .populate("reporter", "name email profilePicture department batch")
      .populate("reportedUser", "name email profilePicture department batch")
      .populate("resolvedBy", "name email")
      .sort({ createdAt: -1 });

    res.json(reports);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Admin: Update report status
export const updateReportStatus = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Admin access required" });
    }

    const { status, adminNotes } = req.body;

    const report = await Report.findByIdAndUpdate(
      req.params.id,
      {
        status,
        adminNotes,
        resolvedBy: req.user._id,
        resolvedAt:
          status === "resolved" || status === "dismissed"
            ? new Date()
            : undefined,
      },
      { new: true }
    ).populate("reporter", "name");

    // Notify the reporter about the review
    if (report && report.reporter) {
      const statusMessages = {
        reviewed: "Your report has been reviewed by our team",
        resolved:
          "Your report has been resolved. Thank you for helping keep our community safe",
        dismissed: "Your report has been reviewed and dismissed",
      };

      const statusEmojis = {
        reviewed: "👀",
        resolved: "✅",
        dismissed: "ℹ️",
      };

      // Generate link to reported content
      const getContentLink = (type, itemId) => {
        const links = {
          buysell: `/buysell/${itemId}`,
          housing: `/housing/${itemId}`,
          event: `/events/${itemId}`,
          job: `/jobs/${itemId}`,
          lostfound: `/lost-found/${itemId}`,
          studygroup: `/study-groups/${itemId}`,
          bookrequest: `/books/${itemId}`,
          post: `/posts/${itemId}`,
          user: `/profile/${itemId}`,
        };
        return links[type] || "/";
      };

      const notification = await Notification.create({
        recipient: report.reporter._id,
        type: "report_reviewed",
        title: `${statusEmojis[status] || "📋"} Report ${
          status.charAt(0).toUpperCase() + status.slice(1)
        }`,
        message:
          statusMessages[status] ||
          `Your report status has been updated to ${status}`,
        link: null,
        data: {
          reportId: report._id,
          status,
          adminNotes: adminNotes || null,
          itemType: report.itemType,
          itemId: report.reportedItem,
        },
      });

      // Emit real-time notification to the reporter
      const io = req.app.get("io");
      if (io) {
        emitNotification(io, report.reporter._id, notification);
      }
    }

    res.json(report);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Admin: Ban user
export const banUser = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Admin access required" });
    }

    const { banReason } = req.body;

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isBanned: true, banReason },
      { new: true }
    ).select("-password");

    res.json({ message: "User banned successfully", user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
