import BookRequest from "../models/BookRequest.js";
import { uploadImage } from "../services/cloudinaryService.js";
import multer from "multer";

const upload = multer({ dest: "uploads/" });

// Create a new book request
export const createBookRequest = [
  upload.array("images", 3),
  async (req, res) => {
    try {
      const { bookTitle, author, course, requestType, description, urgency } =
        req.body;

      if (!bookTitle) {
        return res.status(400).json({ message: "Book title is required" });
      }

      let imageUrls = [];
      if (req.files && req.files.length > 0) {
        imageUrls = await Promise.all(
          req.files.map((file) => uploadImage(file))
        );
      }

      const bookRequest = await BookRequest.create({
        requester: req.user._id,
        bookTitle,
        author,
        course,
        requestType: requestType || "borrow",
        description,
        urgency: urgency || "normal",
        images: imageUrls,
      });

      await bookRequest.populate(
        "requester",
        "name email profilePicture department batch"
      );

      res.status(201).json(bookRequest);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },
];

// Get all book requests
export const getBookRequests = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      status,
      course,
      requestType,
      search,
    } = req.query;
    const skip = (page - 1) * limit;

    let query = {};

    if (status) {
      query.status = status;
    }

    if (course) {
      query.course = new RegExp(course, "i");
    }

    if (requestType) {
      query.requestType = requestType;
    }

    if (search) {
      query.$or = [
        { bookTitle: new RegExp(search, "i") },
        { author: new RegExp(search, "i") },
        { course: new RegExp(search, "i") },
      ];
    }

    const bookRequests = await BookRequest.find(query)
      .populate("requester", "name email phone profilePicture department batch")
      .populate("responses.user", "name profilePicture department")
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip);

    const total = await BookRequest.countDocuments(query);

    res.json({
      bookRequests,
      currentPage: parseInt(page),
      totalPages: Math.ceil(total / limit),
      total,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get single book request
export const getBookRequest = async (req, res) => {
  try {
    const bookRequest = await BookRequest.findById(req.params.id)
      .populate("requester", "name email phone profilePicture department batch")
      .populate("responses.user", "name profilePicture department batch");

    if (!bookRequest) {
      return res.status(404).json({ message: "Book request not found" });
    }

    res.json(bookRequest);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update book request
export const updateBookRequest = async (req, res) => {
  try {
    const { bookTitle, author, course, requestType, description, urgency } =
      req.body;

    const bookRequest = await BookRequest.findById(req.params.id);

    if (!bookRequest) {
      return res.status(404).json({ message: "Book request not found" });
    }

    if (bookRequest.requester.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    if (bookTitle) bookRequest.bookTitle = bookTitle;
    if (author !== undefined) bookRequest.author = author;
    if (course !== undefined) bookRequest.course = course;
    if (requestType) bookRequest.requestType = requestType;
    if (description !== undefined) bookRequest.description = description;
    if (urgency) bookRequest.urgency = urgency;

    await bookRequest.save();
    await bookRequest.populate(
      "requester",
      "name email profilePicture department batch"
    );

    res.json(bookRequest);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update status
export const updateStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!["open", "fulfilled", "closed"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const bookRequest = await BookRequest.findById(req.params.id);

    if (!bookRequest) {
      return res.status(404).json({ message: "Book request not found" });
    }

    if (bookRequest.requester.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    bookRequest.status = status;
    await bookRequest.save();
    await bookRequest.populate(
      "requester",
      "name email profilePicture department batch"
    );

    res.json(bookRequest);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete book request
export const deleteBookRequest = async (req, res) => {
  try {
    const bookRequest = await BookRequest.findById(req.params.id);

    if (!bookRequest) {
      return res.status(404).json({ message: "Book request not found" });
    }

    const isOwner =
      bookRequest.requester.toString() === req.user._id.toString();
    const isAdmin = req.user.role === "admin";

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: "Not authorized" });
    }

    await bookRequest.deleteOne();
    res.json({ message: "Book request deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Add response to book request
export const addResponse = async (req, res) => {
  try {
    const { message, offerType } = req.body;

    if (!message) {
      return res.status(400).json({ message: "Message is required" });
    }

    const bookRequest = await BookRequest.findById(req.params.id);

    if (!bookRequest) {
      return res.status(404).json({ message: "Book request not found" });
    }

    bookRequest.responses.push({
      user: req.user._id,
      message,
      offerType: offerType || "other",
    });

    await bookRequest.save();
    await bookRequest.populate(
      "responses.user",
      "name profilePicture department batch"
    );

    // Notify requester
    if (bookRequest.requester.toString() !== req.user._id.toString()) {
      const { notifyContentOwner } = await import(
        "./notificationController.js"
      );
      await notifyContentOwner(
        bookRequest.requester,
        req.user._id,
        "response",
        `your book request: ${bookRequest.bookTitle}`,
        `/books/${bookRequest._id}`
      );
    }

    res.json(bookRequest);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete response
export const deleteResponse = async (req, res) => {
  try {
    const { responseId } = req.params;

    const bookRequest = await BookRequest.findById(req.params.id);

    if (!bookRequest) {
      return res.status(404).json({ message: "Book request not found" });
    }

    const response = bookRequest.responses.id(responseId);

    if (!response) {
      return res.status(404).json({ message: "Response not found" });
    }

    const isOwner = response.user.toString() === req.user._id.toString();
    const isAdmin = req.user.role === "admin";

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: "Not authorized" });
    }

    bookRequest.responses.pull(responseId);
    await bookRequest.save();
    await bookRequest.populate(
      "responses.user",
      "name profilePicture department batch"
    );

    res.json(bookRequest);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get user's book requests
export const getUserBookRequests = async (req, res) => {
  try {
    const bookRequests = await BookRequest.find({
      requester: req.params.userId,
    })
      .populate("requester", "name email profilePicture department batch")
      .populate("responses.user", "name profilePicture department")
      .sort({ createdAt: -1 });

    res.json(bookRequests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
