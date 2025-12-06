import Poll from "../models/Poll.js";
import Vote from "../models/Vote.js";

// Create poll
export const createPoll = async (req, res) => {
  try {
    const {
      title,
      description,
      type,
      pollType,
      category,
      options,
      endDate,
      isAnonymous,
      allowedVoters,
      restrictions,
      showLiveResults,
      allowChangeVote,
      clubId,
    } = req.body;

    // Permission check - flexible based on poll type
    const isAdmin =
      req.user.role === "admin" || req.user.role === "super_admin";
    const isClubModerator = req.user.isClubModerator;

    // Elections and official categories require admin
    if (
      (type === "election" ||
        category === "union" ||
        category === "department") &&
      !isAdmin
    ) {
      return res.status(403).json({
        message: "Only admins can create elections and official polls",
      });
    }

    // Club polls require club moderator or admin
    if (category === "club" && !isClubModerator && !isAdmin) {
      return res.status(403).json({
        message: "Only club moderators or admins can create club polls",
      });
    }

    // Opinion, feedback, and survey polls are open to all students

    // Validate options
    if (!options || options.length < 2) {
      return res
        .status(400)
        .json({ message: "Poll must have at least 2 options" });
    }

    const poll = new Poll({
      title,
      description,
      type,
      pollType,
      category,
      options: options.map((opt) => ({
        text: opt.text,
        candidateInfo: opt.candidateInfo,
      })),
      endDate,
      isAnonymous,
      allowedVoters,
      restrictions,
      showLiveResults,
      allowChangeVote,
      clubId,
      createdBy: req.user._id,
    });

    await poll.save();
    await poll.populate("createdBy", "name department batch profilePicture");

    res.status(201).json(poll);
  } catch (error) {
    console.error("Create poll error:", error);
    res
      .status(500)
      .json({ message: "Failed to create poll", error: error.message });
  }
};

// Get all polls
export const getAllPolls = async (req, res) => {
  try {
    const { type, category, status } = req.query;

    const filter = {};
    if (type) filter.type = type;
    if (category) filter.category = category;
    if (status) filter.status = status;
    else filter.status = { $in: ["active", "ended"] };

    const polls = await Poll.find(filter)
      .populate("createdBy", "name department batch profilePicture")
      .sort({ createdAt: -1 })
      .lean();

    // Check if user has voted on each poll
    if (req.user) {
      const pollIds = polls.map((p) => p._id);
      const userVotes = await Vote.find({
        poll: { $in: pollIds },
        voter: req.user._id,
      }).select("poll");

      const votedPollIds = new Set(userVotes.map((v) => v.poll.toString()));

      polls.forEach((poll) => {
        poll.hasVoted = votedPollIds.has(poll._id.toString());
      });
    }

    res.json(polls);
  } catch (error) {
    console.error("Get polls error:", error);
    res.status(500).json({ message: "Failed to fetch polls" });
  }
};

// Get single poll
export const getPollById = async (req, res) => {
  try {
    const poll = await Poll.findById(req.params.id).populate(
      "createdBy",
      "name department batch profilePicture"
    );

    if (!poll) {
      return res.status(404).json({ message: "Poll not found" });
    }

    // Check if user has voted
    let hasVoted = false;
    let userVote = null;

    if (req.user) {
      const vote = await Vote.findOne({
        poll: poll._id,
        voter: req.user._id,
      }).select("selectedOptions textResponse");

      if (vote) {
        hasVoted = true;
        userVote = vote;
      }
    }

    const pollData = poll.toObject();
    pollData.hasVoted = hasVoted;
    pollData.userVote = userVote;

    res.json(pollData);
  } catch (error) {
    console.error("Get poll error:", error);
    res.status(500).json({ message: "Failed to fetch poll" });
  }
};

// Submit vote
export const submitVote = async (req, res) => {
  try {
    const { pollId } = req.params;
    const { selectedOptions, textResponse } = req.body;

    const poll = await Poll.findById(pollId);
    if (!poll) {
      return res.status(404).json({ message: "Poll not found" });
    }

    // Check if poll is active
    if (!poll.isActive()) {
      return res.status(400).json({ message: "Poll is not active" });
    }

    // Check voter eligibility (for elections with restrictions)
    if (poll.electionInfo && poll.electionInfo.eligibleVoters) {
      const { departments, batches, halls } = poll.electionInfo.eligibleVoters;

      // Check department restriction
      if (departments && departments.length > 0) {
        if (!departments.includes(req.user.department)) {
          return res.status(403).json({
            message: `This election is only for ${departments.join(
              ", "
            )} department(s)`,
          });
        }
      }

      // Check batch restriction
      if (batches && batches.length > 0) {
        if (!batches.includes(req.user.batch)) {
          return res.status(403).json({
            message: `This election is only for batch ${batches.join(", ")}`,
          });
        }
      }

      // Check hall restriction (if applicable)
      if (halls && halls.length > 0 && req.user.hall) {
        if (!halls.includes(req.user.hall)) {
          return res.status(403).json({
            message: `This election is only for ${halls.join(", ")} hall(s)`,
          });
        }
      }
    }

    // Validate selected options
    if (!selectedOptions || selectedOptions.length === 0) {
      return res
        .status(400)
        .json({ message: "Please select at least one option" });
    }

    // Check single vs multiple choice
    if (poll.pollType === "single" && selectedOptions.length > 1) {
      return res
        .status(400)
        .json({ message: "Only one option allowed for this poll" });
    }

    // Check if user already voted
    const existingVote = await Vote.findOne({
      poll: pollId,
      voter: req.user._id,
    });

    if (existingVote) {
      if (!poll.allowChangeVote) {
        return res.status(400).json({ message: "You have already voted" });
      }

      // Update existing vote - decrease old option counts
      existingVote.selectedOptions.forEach((optionId) => {
        const option = poll.options.id(optionId);
        if (option) option.voteCount = Math.max(0, option.voteCount - 1);
      });

      existingVote.selectedOptions = selectedOptions;
      existingVote.textResponse = textResponse;
      await existingVote.save();
    } else {
      // Create new vote
      const vote = new Vote({
        poll: pollId,
        voter: req.user._id,
        selectedOptions,
        textResponse,
        isAnonymous: poll.isAnonymous,
      });
      await vote.save();
      poll.totalVotes += 1;
    }

    // Update option vote counts
    selectedOptions.forEach((optionId) => {
      const option = poll.options.id(optionId);
      if (option) {
        option.voteCount += 1;
      }
    });

    await poll.save();

    res.json({ message: "Vote submitted successfully", poll });
  } catch (error) {
    console.error("Submit vote error:", error);
    res
      .status(500)
      .json({ message: "Failed to submit vote", error: error.message });
  }
};

// Get poll results (public)
export const getPollResults = async (req, res) => {
  try {
    const poll = await Poll.findById(req.params.id).populate(
      "createdBy",
      "name department batch"
    );

    if (!poll) {
      return res.status(404).json({ message: "Poll not found" });
    }

    // Check if results should be shown
    if (!poll.showLiveResults && poll.status === "active") {
      return res
        .status(403)
        .json({ message: "Results will be shown after poll ends" });
    }

    const results = {
      poll: {
        title: poll.title,
        description: poll.description,
        type: poll.type,
        totalVotes: poll.totalVotes,
        status: poll.status,
        endDate: poll.endDate,
      },
      options: poll.options.map((opt) => ({
        _id: opt._id,
        text: opt.text,
        candidateInfo: opt.candidateInfo,
        voteCount: opt.voteCount,
        percentage:
          poll.totalVotes > 0
            ? ((opt.voteCount / poll.totalVotes) * 100).toFixed(1)
            : 0,
      })),
    };

    res.json(results);
  } catch (error) {
    console.error("Get results error:", error);
    res.status(500).json({ message: "Failed to fetch results" });
  }
};

// Get voter details (SUPER ADMIN ONLY)
export const getVoterDetails = async (req, res) => {
  try {
    // Only super admin can access
    if (req.user.role !== "super_admin") {
      return res
        .status(403)
        .json({ message: "Access denied. Super admin only." });
    }

    const { pollId } = req.params;

    const votes = await Vote.find({ poll: pollId })
      .select("+voter") // Explicitly include voter field
      .populate("voter", "name email department batch registrationNumber")
      .populate("poll", "title type");

    res.json(votes);
  } catch (error) {
    console.error("Get voter details error:", error);
    res.status(500).json({ message: "Failed to fetch voter details" });
  }
};

// Update poll (creator or admin only)
export const updatePoll = async (req, res) => {
  try {
    const poll = await Poll.findById(req.params.id);

    if (!poll) {
      return res.status(404).json({ message: "Poll not found" });
    }

    // Check permissions
    const isCreator = poll.createdBy.toString() === req.user._id.toString();
    const isAdmin =
      req.user.role === "admin" || req.user.role === "super_admin";

    if (!isCreator && !isAdmin) {
      return res.status(403).json({ message: "Not authorized" });
    }

    // Don't allow editing if votes exist
    if (poll.totalVotes > 0) {
      return res
        .status(400)
        .json({ message: "Cannot edit poll after votes are cast" });
    }

    const { title, description, endDate, showLiveResults, allowChangeVote } =
      req.body;

    if (title) poll.title = title;
    if (description) poll.description = description;
    if (endDate) poll.endDate = endDate;
    if (showLiveResults !== undefined) poll.showLiveResults = showLiveResults;
    if (allowChangeVote !== undefined) poll.allowChangeVote = allowChangeVote;

    await poll.save();
    res.json(poll);
  } catch (error) {
    console.error("Update poll error:", error);
    res.status(500).json({ message: "Failed to update poll" });
  }
};

// Delete poll
export const deletePoll = async (req, res) => {
  try {
    const poll = await Poll.findById(req.params.id);

    if (!poll) {
      return res.status(404).json({ message: "Poll not found" });
    }

    const isCreator = poll.createdBy.toString() === req.user._id.toString();
    const isAdmin =
      req.user.role === "admin" || req.user.role === "super_admin";

    if (!isCreator && !isAdmin) {
      return res.status(403).json({ message: "Not authorized" });
    }

    // Delete all votes
    await Vote.deleteMany({ poll: poll._id });
    await poll.deleteOne();

    res.json({ message: "Poll deleted successfully" });
  } catch (error) {
    console.error("Delete poll error:", error);
    res.status(500).json({ message: "Failed to delete poll" });
  }
};
