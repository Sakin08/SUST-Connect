import Election from "../models/Election.js";
import ElectionPosition from "../models/ElectionPosition.js";
import Candidate from "../models/Candidate.js";
import ElectionVote from "../models/ElectionVote.js";
import User from "../models/User.js";

// Helper: Check if user is eligible to vote
const checkVoterEligibility = (user, election) => {
  console.log("=== ELIGIBILITY CHECK ===");
  console.log("User:", {
    name: user.name,
    dept: user.department,
    batch: user.batch,
  });
  console.log("Election:", {
    title: election.title,
    type: election.type,
    dept: election.department,
    year: election.year,
  });

  if (election.type === "society") {
    // Society election: all students from the department
    const isEligible = user.department === election.department;
    console.log(
      `Society: ${user.department} === ${election.department} = ${isEligible}`
    );
    return isEligible;
  } else if (election.type === "cr") {
    // CR election: specific department and batch (year)
    // user.batch can be: "2019" (4-digit), "19" (2-digit), or "N/A"
    // election.year is: 19, 20, 21 (2-digit number)

    if (!user.batch || user.batch === "N/A") {
      console.log("Batch is N/A - Not Eligible");
      return false;
    }

    const userBatchStr = user.batch.toString().trim();
    const electionYear = parseInt(election.year);

    // Extract 2-digit batch number
    let userBatchNumber;
    if (userBatchStr.length === 4) {
      // "2019" -> 19
      userBatchNumber = parseInt(userBatchStr.substring(2, 4));
    } else if (userBatchStr.length === 2) {
      // "19" -> 19
      userBatchNumber = parseInt(userBatchStr);
    } else {
      console.log("Invalid batch format - Not Eligible");
      return false;
    }

    const deptMatch = user.department === election.department;
    const batchMatch = userBatchNumber === electionYear;
    const isEligible = deptMatch && batchMatch;

    console.log(
      `CR: dept(${deptMatch}) batch(${userBatchNumber}===${electionYear}=${batchMatch}) = ${isEligible}`
    );
    return isEligible;
  }

  console.log("Unknown election type - Not Eligible");
  return false;
};

// Create Election (Admin only)
export const createElection = async (req, res) => {
  try {
    const {
      title,
      description,
      type,
      department,
      year,
      startTime,
      endTime,
      positions,
    } = req.body;

    // Validation
    if (!title || !type || !department || !startTime || !endTime) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    if (type === "cr" && !year) {
      return res
        .status(400)
        .json({ message: "CR elections require batch (year)" });
    }

    // Create election
    const election = await Election.create({
      title,
      description,
      type,
      department,
      year: type === "cr" ? year : undefined,
      startTime: new Date(startTime),
      endTime: new Date(endTime),
      createdBy: req.user._id,
    });

    // Create positions if provided
    if (positions && Array.isArray(positions)) {
      const positionDocs = positions.map((pos, index) => ({
        election: election._id,
        positionName: pos.positionName,
        description: pos.description,
        maxSelectable: pos.maxSelectable || 1,
        order: index,
      }));
      await ElectionPosition.insertMany(positionDocs);
    }

    res
      .status(201)
      .json({ message: "Election created successfully", election });
  } catch (error) {
    console.error("Create election error:", error);
    res
      .status(500)
      .json({ message: "Failed to create election", error: error.message });
  }
};

// Get all elections
export const getElections = async (req, res) => {
  try {
    const { status, type, department } = req.query;
    const filter = {};

    if (status) filter.status = status;
    if (type) filter.type = type;
    if (department) filter.department = department;

    const elections = await Election.find(filter)
      .populate("createdBy", "name email")
      .sort({ startTime: -1 });

    // Update status for each election
    for (let election of elections) {
      await election.updateStatus();
    }

    res.json(elections);
  } catch (error) {
    console.error("Get elections error:", error);
    res.status(500).json({ message: "Failed to fetch elections" });
  }
};

// Get elections for current user (based on eligibility)
export const getMyElections = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    // Find elections user is eligible for
    const allElections = await Election.find({
      status: { $in: ["upcoming", "ongoing"] },
    })
      .populate("createdBy", "name email")
      .sort({ startTime: 1 });

    const eligibleElections = allElections.filter((election) =>
      checkVoterEligibility(user, election)
    );

    res.json(eligibleElections);
  } catch (error) {
    console.error("Get my elections error:", error);
    res.status(500).json({ message: "Failed to fetch elections" });
  }
};

// Get single election details
export const getElectionById = async (req, res) => {
  try {
    const election = await Election.findById(req.params.id)
      .populate("createdBy", "name email profilePicture department")
      .populate(
        "requestedBy",
        "name email profilePicture department batch registrationNumber"
      );

    if (!election) {
      return res.status(404).json({ message: "Election not found" });
    }

    await election.updateStatus();

    // Get positions
    const positions = await ElectionPosition.find({
      election: election._id,
    }).sort({ order: 1 });

    // Get candidates
    const candidates = await Candidate.find({
      election: election._id,
      status: "approved",
    })
      .populate(
        "user",
        "name email profilePicture department year batch registrationNumber"
      )
      .populate("position", "positionName")
      .sort({ order: 1 });

    // Check if user has voted
    let hasVoted = false;
    let userVotes = [];
    if (req.user) {
      const votes = await ElectionVote.find({
        election: election._id,
        voter: req.user._id,
      }).populate("position candidate");
      hasVoted = votes.length > 0;
      userVotes = votes;
    }

    // Check eligibility
    let isEligible = false;
    if (req.user) {
      const user = await User.findById(req.user._id);
      isEligible = checkVoterEligibility(user, election);
    }

    res.json({
      election,
      positions,
      candidates,
      hasVoted,
      userVotes,
      isEligible,
    });
  } catch (error) {
    console.error("Get election error:", error);
    res.status(500).json({ message: "Failed to fetch election details" });
  }
};

// Add position to election
export const addPosition = async (req, res) => {
  try {
    const { electionId } = req.params;
    const { positionName, description, maxSelectable } = req.body;

    const election = await Election.findById(electionId);
    if (!election) {
      return res.status(404).json({ message: "Election not found" });
    }

    const position = await ElectionPosition.create({
      election: electionId,
      positionName,
      description,
      maxSelectable: maxSelectable || 1,
    });

    res.status(201).json({ message: "Position added", position });
  } catch (error) {
    console.error("Add position error:", error);
    res.status(500).json({ message: "Failed to add position" });
  }
};

// Add candidate
export const addCandidate = async (req, res) => {
  try {
    const {
      electionId,
      positionId,
      userId,
      registrationNumber,
      manifesto,
      photoUrl,
    } = req.body;

    let candidateUserId = userId;

    // If registration number is provided instead of userId, look up the user
    if (!userId && registrationNumber) {
      const user = await User.findOne({ registrationNumber });
      if (!user) {
        return res.status(404).json({
          message: `No registered user found with registration number: ${registrationNumber}`,
          suggestion:
            "The candidate must create an account first before they can be added to the election. Ask them to register on the platform.",
        });
      }
      candidateUserId = user._id;
    }

    if (!candidateUserId) {
      return res
        .status(400)
        .json({ message: "Either userId or registrationNumber is required" });
    }

    const candidate = await Candidate.create({
      election: electionId,
      position: positionId,
      user: candidateUserId,
      manifesto,
      photoUrl,
    });

    await candidate.populate(
      "user",
      "name email profilePicture department year batch registrationNumber"
    );
    await candidate.populate("position", "positionName");

    res.status(201).json({ message: "Candidate added", candidate });
  } catch (error) {
    console.error("Add candidate error:", error);
    if (error.code === 11000) {
      // Extract which field caused the duplicate
      const field = error.keyPattern;
      const value = error.keyValue;
      console.error("Duplicate key error:", { field, value });

      return res.status(400).json({
        message: "Candidate already exists for this position",
        details: `Duplicate: ${JSON.stringify(value)}`,
      });
    }
    res
      .status(500)
      .json({ message: "Failed to add candidate", error: error.message });
  }
};

// Cast vote
export const castVote = async (req, res) => {
  try {
    const { electionId, votes } = req.body; // votes: [{ positionId, candidateId }]

    const election = await Election.findById(electionId);
    if (!election) {
      return res.status(404).json({ message: "Election not found" });
    }

    await election.updateStatus();

    if (election.status !== "ongoing") {
      return res
        .status(400)
        .json({ message: "Election is not currently ongoing" });
    }

    // Check eligibility
    const user = await User.findById(req.user._id);
    if (!checkVoterEligibility(user, election)) {
      return res
        .status(403)
        .json({ message: "You are not eligible to vote in this election" });
    }

    // Check if already voted
    const existingVote = await ElectionVote.findOne({
      election: electionId,
      voter: req.user._id,
    });

    if (existingVote && !election.allowChangeVote) {
      return res
        .status(400)
        .json({ message: "You have already voted in this election" });
    }

    // If changing vote, delete old votes
    if (existingVote && election.allowChangeVote) {
      await ElectionVote.deleteMany({
        election: electionId,
        voter: req.user._id,
      });
    }

    // Cast new votes
    const votePromises = votes.map((vote) =>
      ElectionVote.create({
        election: electionId,
        position: vote.positionId,
        candidate: vote.candidateId,
        voter: req.user._id,
      })
    );

    await Promise.all(votePromises);

    res.json({ message: "Vote cast successfully" });
  } catch (error) {
    console.error("Cast vote error:", error);
    if (error.code === 11000) {
      return res
        .status(400)
        .json({ message: "You have already voted for this position" });
    }
    res.status(500).json({ message: "Failed to cast vote" });
  }
};

// Get election results
export const getResults = async (req, res) => {
  try {
    const { electionId } = req.params;

    const election = await Election.findById(electionId);
    if (!election) {
      return res.status(404).json({ message: "Election not found" });
    }

    await election.updateStatus();

    // Check if results should be shown
    if (election.status !== "ended" && !election.showLiveResults) {
      return res.status(403).json({ message: "Results are not available yet" });
    }

    // Get positions
    const positions = await ElectionPosition.find({
      election: electionId,
    }).sort({ order: 1 });

    const results = [];

    for (let position of positions) {
      // Get all candidates for this position
      const candidates = await Candidate.find({
        election: electionId,
        position: position._id,
        status: "approved",
      }).populate(
        "user",
        "name email profilePicture department year batch registrationNumber"
      );

      // Count votes for each candidate
      const candidateResults = await Promise.all(
        candidates.map(async (candidate) => {
          const voteCount = await ElectionVote.countDocuments({
            election: electionId,
            position: position._id,
            candidate: candidate._id,
          });

          return {
            candidate,
            voteCount,
          };
        })
      );

      // Sort by vote count
      candidateResults.sort((a, b) => b.voteCount - a.voteCount);

      // Total votes for this position
      const totalVotes = candidateResults.reduce(
        (sum, c) => sum + c.voteCount,
        0
      );

      results.push({
        position,
        candidates: candidateResults,
        totalVotes,
        winner: candidateResults[0] || null,
      });
    }

    res.json({ election, results });
  } catch (error) {
    console.error("Get results error:", error);
    res.status(500).json({ message: "Failed to fetch results" });
  }
};

// Publish results (Admin only)
export const publishResults = async (req, res) => {
  try {
    const { electionId } = req.params;

    const election = await Election.findById(electionId);
    if (!election) {
      return res.status(404).json({ message: "Election not found" });
    }

    election.resultsPublished = true;
    await election.save();

    res.json({ message: "Results published successfully" });
  } catch (error) {
    console.error("Publish results error:", error);
    res.status(500).json({ message: "Failed to publish results" });
  }
};

// Update election
export const updateElection = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const election = await Election.findByIdAndUpdate(id, updates, {
      new: true,
    });
    if (!election) {
      return res.status(404).json({ message: "Election not found" });
    }

    res.json({ message: "Election updated", election });
  } catch (error) {
    console.error("Update election error:", error);
    res.status(500).json({ message: "Failed to update election" });
  }
};

// Delete election
export const deleteElection = async (req, res) => {
  try {
    const { id } = req.params;

    // Delete election and related data
    await Election.findByIdAndDelete(id);
    await ElectionPosition.deleteMany({ election: id });
    await Candidate.deleteMany({ election: id });
    await ElectionVote.deleteMany({ election: id });

    res.json({ message: "Election deleted successfully" });
  } catch (error) {
    console.error("Delete election error:", error);
    res.status(500).json({ message: "Failed to delete election" });
  }
};

// Request to be a candidate (User)
export const requestCandidacy = async (req, res) => {
  try {
    const { electionId, positionId, manifesto } = req.body;

    // Check if election exists
    const election = await Election.findById(electionId);
    if (!election) {
      return res.status(404).json({ message: "Election not found" });
    }

    // Check if position exists
    const position = await ElectionPosition.findById(positionId);
    if (!position) {
      return res.status(404).json({ message: "Position not found" });
    }

    // Check if user is eligible for this election
    const user = await User.findById(req.user._id);
    if (!checkVoterEligibility(user, election)) {
      return res.status(403).json({
        message: "You are not eligible for this election",
      });
    }

    // Check if already applied
    const existingCandidate = await Candidate.findOne({
      election: electionId,
      position: positionId,
      user: req.user._id,
    });

    if (existingCandidate) {
      return res.status(400).json({
        message: `You have already applied for this position. Status: ${existingCandidate.status}`,
      });
    }

    // Create candidate request
    const candidate = await Candidate.create({
      election: electionId,
      position: positionId,
      user: req.user._id,
      manifesto,
      status: "pending",
    });

    await candidate.populate(
      "user",
      "name email profilePicture department year batch registrationNumber"
    );
    await candidate.populate("position", "positionName");
    await candidate.populate("election", "title type department");

    // Create notification for admin
    const Notification = (await import("../models/Notification.js")).default;
    await Notification.create({
      recipient: election.createdBy,
      type: "candidate_request",
      title: "New Candidate Request",
      message: `${user.name} has requested to be a candidate for ${position.positionName} in ${election.title}`,
      link: `/admin/elections/${electionId}/approve-candidates`,
      metadata: {
        candidateId: candidate._id,
        electionId: electionId,
        positionId: positionId,
      },
    });

    res.status(201).json({
      message: "Candidacy request submitted successfully",
      candidate,
    });
  } catch (error) {
    console.error("Request candidacy error:", error);
    if (error.code === 11000) {
      return res.status(400).json({
        message: "You have already applied for this position",
      });
    }
    res.status(500).json({
      message: "Failed to submit candidacy request",
      error: error.message,
    });
  }
};

// Get pending candidate requests (Admin)
export const getPendingCandidates = async (req, res) => {
  try {
    const { electionId } = req.params;

    const candidates = await Candidate.find({
      election: electionId,
      status: "pending",
    })
      .populate(
        "user",
        "name email profilePicture department year batch registrationNumber"
      )
      .populate("position", "positionName")
      .populate("election", "title type department")
      .sort({ createdAt: -1 });

    res.json(candidates);
  } catch (error) {
    console.error("Get pending candidates error:", error);
    res.status(500).json({ message: "Failed to fetch pending candidates" });
  }
};

// Get all candidate requests for an election (Admin)
export const getAllCandidates = async (req, res) => {
  try {
    const { electionId } = req.params;

    const candidates = await Candidate.find({
      election: electionId,
    })
      .populate(
        "user",
        "name email profilePicture department year batch registrationNumber"
      )
      .populate("position", "positionName")
      .sort({ status: 1, createdAt: -1 });

    res.json(candidates);
  } catch (error) {
    console.error("Get all candidates error:", error);
    res.status(500).json({ message: "Failed to fetch candidates" });
  }
};

// Approve candidate request (Admin)
export const approveCandidateRequest = async (req, res) => {
  try {
    const { candidateId } = req.params;

    const candidate = await Candidate.findById(candidateId)
      .populate("user", "name email")
      .populate("position", "positionName")
      .populate("election", "title");

    if (!candidate) {
      return res.status(404).json({ message: "Candidate not found" });
    }

    candidate.status = "approved";
    await candidate.save();

    // Create notification for user
    const Notification = (await import("../models/Notification.js")).default;
    await Notification.create({
      recipient: candidate.user._id,
      type: "candidate_approved",
      title: "Candidacy Approved",
      message: `Your candidacy request for ${candidate.position.positionName} in ${candidate.election.title} has been approved!`,
      link: `/elections/${candidate.election._id}`,
      metadata: {
        candidateId: candidate._id,
        electionId: candidate.election._id,
      },
    });

    res.json({ message: "Candidate approved successfully", candidate });
  } catch (error) {
    console.error("Approve candidate error:", error);
    res.status(500).json({ message: "Failed to approve candidate" });
  }
};

// Reject candidate request (Admin)
export const rejectCandidateRequest = async (req, res) => {
  try {
    const { candidateId } = req.params;
    const { reason } = req.body;

    const candidate = await Candidate.findById(candidateId)
      .populate("user", "name email")
      .populate("position", "positionName")
      .populate("election", "title");

    if (!candidate) {
      return res.status(404).json({ message: "Candidate not found" });
    }

    candidate.status = "rejected";
    candidate.rejectionReason = reason || "No reason provided";
    await candidate.save();

    // Create notification for user
    const Notification = (await import("../models/Notification.js")).default;
    await Notification.create({
      recipient: candidate.user._id,
      type: "candidate_rejected",
      title: "Candidacy Rejected",
      message: `Your candidacy request for ${candidate.position.positionName} in ${candidate.election.title} has been rejected. Reason: ${candidate.rejectionReason}`,
      link: `/elections/${candidate.election._id}`,
      metadata: {
        candidateId: candidate._id,
        electionId: candidate.election._id,
      },
    });

    res.json({ message: "Candidate rejected", candidate });
  } catch (error) {
    console.error("Reject candidate error:", error);
    res.status(500).json({ message: "Failed to reject candidate" });
  }
};

// Get my candidacy requests (User)
export const getMyCandidacyRequests = async (req, res) => {
  try {
    const candidates = await Candidate.find({
      user: req.user._id,
    })
      .populate("position", "positionName")
      .populate("election", "title type department startTime endTime status")
      .sort({ createdAt: -1 });

    res.json(candidates);
  } catch (error) {
    console.error("Get my candidacy requests error:", error);
    res.status(500).json({ message: "Failed to fetch candidacy requests" });
  }
};
