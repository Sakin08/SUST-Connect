import ElectionRequest from "../models/ElectionRequest.js";
import User from "../models/User.js";

// Create election request
export const createRequest = async (req, res) => {
  try {
    const {
      type,
      department,
      year,
      section,
      description,
      proposedStartDate,
      proposedEndDate,
      positions,
      candidates,
    } = req.body;

    // Validation
    if (!type || !department || !proposedStartDate || !proposedEndDate) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    if (type === "cr" && !year) {
      return res
        .status(400)
        .json({ message: "Batch is required for CR elections" });
    }

    // Get user details
    const user = await User.findById(req.user._id);

    // Prevent users from requesting elections for other departments
    if (user.department !== department) {
      return res.status(403).json({
        message: `You can only request elections for your own department (${user.department}), not for ${department}`,
      });
    }

    const request = await ElectionRequest.create({
      requestedBy: req.user._id,
      type,
      department,
      year: type === "cr" ? year : undefined,
      section,
      description,
      proposedStartDate: new Date(proposedStartDate),
      proposedEndDate: new Date(proposedEndDate),
      positions: positions || [],
      candidates: candidates || [],
    });

    await request.populate("requestedBy", "name email department");

    // Send notification to all admins
    try {
      const Notification = (await import("../models/Notification.js")).default;
      const admins = await User.find({ role: "admin" });

      const notificationPromises = admins.map(async (admin) => {
        const notification = await Notification.create({
          recipient: admin._id,
          type: "election_request_created",
          title: "New Election Request",
          message: `${user.name} has requested a ${
            type === "cr" ? "CR" : "Society"
          } election for ${department}${type === "cr" ? ` Batch ${year}` : ""}`,
          link: `/admin/elections/requests`,
          data: {
            requestId: request._id,
            requestedBy: user._id,
          },
        });

        // Send real-time notification via socket
        try {
          const io = req.app.get("io");
          const { emitNotification } = await import(
            "../socket/socketHandler.js"
          );
          if (io) {
            emitNotification(io, admin._id, notification);
          }
        } catch (socketError) {
          console.error("Failed to emit socket notification:", socketError);
        }

        return notification;
      });

      await Promise.all(notificationPromises);
      console.log(`Sent notifications to ${admins.length} admins`);
    } catch (notifError) {
      console.error("Failed to create admin notifications:", notifError);
    }

    // Send email notification to all admins
    try {
      const { sendEmail } = await import("../services/emailService.js");
      const admins = await User.find({ role: "admin" });
      const adminEmails = admins.map((admin) => admin.email).filter(Boolean);

      if (adminEmails.length > 0) {
        await sendEmail({
          to: adminEmails,
          subject: `New Election Request - ${department} ${
            type === "cr" ? `Batch ${year}` : "Society"
          }`,
          html: `
            <h2>New Election Request Submitted</h2>
            <p><strong>Requested by:</strong> ${user.name} (${user.email})</p>
            <p><strong>Department:</strong> ${department}</p>
            <p><strong>Type:</strong> ${
              type === "cr" ? `CR Election - Batch ${year}` : "Society Election"
            }</p>
            ${section ? `<p><strong>Section:</strong> ${section}</p>` : ""}
            ${
              description
                ? `<p><strong>Description:</strong> ${description}</p>`
                : ""
            }
            <p><strong>Proposed Start:</strong> ${new Date(
              proposedStartDate
            ).toLocaleString()}</p>
            <p><strong>Proposed End:</strong> ${new Date(
              proposedEndDate
            ).toLocaleString()}</p>
            <p><strong>Positions:</strong> ${positions?.length || 0}</p>
            <p><strong>Candidates:</strong> ${candidates?.length || 0}</p>
            <br>
            <p>Please review and approve/reject this request in the admin panel.</p>
          `,
        });
        console.log(`Email sent to ${adminEmails.length} admin(s)`);
      }
    } catch (emailError) {
      console.error("Failed to send email:", emailError);
    }

    res.status(201).json({
      message: "Election request submitted successfully",
      request,
    });
  } catch (error) {
    console.error("Create election request error:", error);
    res.status(500).json({ message: "Failed to create request" });
  }
};

// Get all requests (admin only)
export const getAllRequests = async (req, res) => {
  try {
    const { status } = req.query;
    const filter = status ? { status } : {};

    const requests = await ElectionRequest.find(filter)
      .populate("requestedBy", "name email department batch")
      .populate("reviewedBy", "name email")
      .sort({ createdAt: -1 });

    res.json(requests);
  } catch (error) {
    console.error("Get requests error:", error);
    res.status(500).json({ message: "Failed to fetch requests" });
  }
};

// Get user's own requests
export const getMyRequests = async (req, res) => {
  try {
    const requests = await ElectionRequest.find({
      requestedBy: req.user._id,
    })
      .populate("reviewedBy", "name email")
      .sort({ createdAt: -1 });

    res.json(requests);
  } catch (error) {
    console.error("Get my requests error:", error);
    res.status(500).json({ message: "Failed to fetch requests" });
  }
};

// Get single request
export const getRequestById = async (req, res) => {
  try {
    const request = await ElectionRequest.findById(req.params.id)
      .populate("requestedBy", "name email department batch")
      .populate("reviewedBy", "name email");

    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    }

    res.json(request);
  } catch (error) {
    console.error("Get request error:", error);
    res.status(500).json({ message: "Failed to fetch request" });
  }
};

// Update request status (admin only)
export const updateRequestStatus = async (req, res) => {
  try {
    const { status, adminNotes } = req.body;

    const request = await ElectionRequest.findById(req.params.id);

    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    }

    request.status = status;
    request.adminNotes = adminNotes;
    request.reviewedBy = req.user._id;
    request.reviewedAt = new Date();

    await request.save();
    await request.populate("requestedBy", "name email department batch");
    await request.populate("reviewedBy", "name email");

    res.json({
      message: `Request ${status}`,
      request,
    });
  } catch (error) {
    console.error("Update request status error:", error);
    res.status(500).json({ message: "Failed to update request" });
  }
};

// Delete request
export const deleteRequest = async (req, res) => {
  try {
    const request = await ElectionRequest.findById(req.params.id);

    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    }

    // Only requester or admin can delete
    if (
      request.requestedBy.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({ message: "Not authorized" });
    }

    await request.deleteOne();

    res.json({ message: "Request deleted successfully" });
  } catch (error) {
    console.error("Delete request error:", error);
    res.status(500).json({ message: "Failed to delete request" });
  }
};

// Approve request and create election (admin only)
export const approveRequest = async (req, res) => {
  try {
    const request = await ElectionRequest.findById(req.params.id);

    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    }

    if (request.status !== "pending") {
      return res
        .status(400)
        .json({ message: "Request has already been reviewed" });
    }

    // Import Election models
    const Election = (await import("../models/Election.js")).default;
    const ElectionPosition = (await import("../models/ElectionPosition.js"))
      .default;

    // Log request data for debugging
    console.log("Request data:", {
      proposedStartDate: request.proposedStartDate,
      proposedEndDate: request.proposedEndDate,
      type: request.type,
      department: request.department,
    });

    // Create the election
    const election = await Election.create({
      title:
        request.title ||
        `${request.type === "cr" ? "CR Election" : "Society Election"} - ${
          request.department
        }${request.type === "cr" ? ` Batch ${request.year}` : ""}`,
      description: request.description || "",
      type: request.type,
      department: request.department,
      year: request.type === "cr" ? request.year : undefined,
      startTime: new Date(request.proposedStartDate),
      endTime: new Date(request.proposedEndDate),
      createdBy: req.user._id,
      requestedBy: request.requestedBy, // Track who originally requested the election
    });

    // Create positions if provided
    let createdPositions = [];
    if (request.positions && request.positions.length > 0) {
      const positionDocs = request.positions.map((pos, index) => ({
        election: election._id,
        positionName: pos.positionName,
        description: pos.description,
        maxSelectable: pos.maxSelectable || 1,
        order: index,
      }));
      createdPositions = await ElectionPosition.insertMany(positionDocs);
    }

    // Add candidates if provided
    console.log("Request candidates:", request.candidates);
    console.log("Created positions:", createdPositions.length);

    if (request.candidates && request.candidates.length > 0) {
      const Candidate = (await import("../models/Candidate.js")).default;

      for (const candidateData of request.candidates) {
        try {
          console.log(
            `Looking for user with registration number: ${candidateData.registrationNumber}`
          );

          // Find user by registration number
          const candidateUser = await User.findOne({
            registrationNumber: candidateData.registrationNumber,
          });

          console.log(
            "Found user:",
            candidateUser ? candidateUser.name : "NOT FOUND"
          );

          if (candidateUser) {
            // Find the correct position for this candidate
            let position = null;

            if (request.type === "cr") {
              // For CR elections, use the first (and only) position
              position =
                createdPositions.length > 0 ? createdPositions[0] : null;
            } else {
              // For society elections, match by position name
              if (candidateData.positionName) {
                position = createdPositions.find(
                  (p) =>
                    p.positionName.trim() === candidateData.positionName.trim()
                );
                console.log(
                  `Matching position for ${candidateData.positionName}:`,
                  position ? position.positionName : "NOT FOUND"
                );
              } else {
                // Fallback to first position if no position name specified
                position =
                  createdPositions.length > 0 ? createdPositions[0] : null;
                console.log(
                  "⚠️ No positionName in candidate data, using first position"
                );
              }
            }

            if (position) {
              const newCandidate = await Candidate.create({
                election: election._id,
                position: position._id,
                user: candidateUser._id,
                manifesto: candidateData.manifesto || "",
                status: "approved", // Auto-approve candidates from request
              });
              console.log(
                `✅ Successfully added candidate: ${candidateUser.name} (${candidateData.registrationNumber}) to position: ${position.positionName}`
              );
            } else {
              console.log(
                `❌ No position found to assign candidate to (looking for: ${candidateData.positionName})`
              );
            }
          } else {
            console.log(
              `❌ User not found for registration number: ${candidateData.registrationNumber}`
            );
          }
        } catch (candidateError) {
          console.error("❌ Error adding candidate:", candidateError);
          // Continue with other candidates even if one fails
        }
      }
    } else {
      console.log("No candidates in request to add");
    }

    // Update request status
    request.status = "approved";
    request.reviewedBy = req.user._id;
    request.reviewedAt = new Date();
    request.createdElection = election._id;
    await request.save();

    // Create notification for requester (non-blocking)
    try {
      const Notification = (await import("../models/Notification.js")).default;
      await Notification.create({
        recipient: request.requestedBy,
        type: "election_request_approved",
        title: "Election Request Approved",
        message: `Your election request has been approved and the election has been created!`,
        link: `/elections/${election._id}`,
        data: {
          requestId: request._id,
          electionId: election._id,
        },
      });
    } catch (notifError) {
      console.error("Failed to create notification:", notifError);
      // Don't fail the whole operation if notification fails
    }

    console.log("Approval successful, sending response");
    res.status(200).json({
      message: "Request approved and election created successfully",
      request,
      election,
    });
  } catch (error) {
    console.error("Approve request error:", error);
    res.status(500).json({
      message: "Failed to approve request",
      error: error.message,
    });
  }
};

// Reject request (admin only)
export const rejectRequest = async (req, res) => {
  try {
    const { reason } = req.body;

    if (!reason) {
      return res.status(400).json({ message: "Rejection reason is required" });
    }

    const request = await ElectionRequest.findById(req.params.id);

    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    }

    if (request.status !== "pending") {
      return res
        .status(400)
        .json({ message: "Request has already been reviewed" });
    }

    // Update request status
    request.status = "rejected";
    request.rejectionReason = reason;
    request.reviewedBy = req.user._id;
    request.reviewedAt = new Date();
    await request.save();

    // Create notification for requester (non-blocking)
    try {
      const Notification = (await import("../models/Notification.js")).default;
      await Notification.create({
        recipient: request.requestedBy,
        type: "election_request_rejected",
        title: "Election Request Rejected",
        message: `Your election request has been rejected. Reason: ${reason}`,
        link: `/elections`,
        data: {
          requestId: request._id,
        },
      });
    } catch (notifError) {
      console.error("Failed to create notification:", notifError);
      // Don't fail the whole operation if notification fails
    }

    res.status(200).json({
      message: "Request rejected",
      request,
    });
  } catch (error) {
    console.error("Reject request error:", error);
    res.status(500).json({ message: "Failed to reject request" });
  }
};
