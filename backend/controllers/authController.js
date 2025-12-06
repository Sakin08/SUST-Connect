import bcrypt from "bcryptjs";
import User from "../models/User.js";
import PendingUser from "../models/PendingUser.js";
import { generateTokens } from "../services/tokenService.js";
import { validateEmail, validatePassword } from "../utils/validators.js";
import { uploadImage } from "../services/cloudinaryService.js";
import { sendOTPEmail, sendWelcomeEmail } from "../services/emailService.js";
import {
  parseStudentEmail,
  parseRegistrationNumber,
} from "../utils/sustParser.js";

// Helper function to generate 6-digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Helper function to extract batch and department from registration number or email
const extractStudentInfo = (email, registrationNumber) => {
  let parsed = null;

  // Try to parse from registration number first
  if (registrationNumber) {
    parsed = parseRegistrationNumber(registrationNumber);
  }

  // If not valid, try to parse from email
  if (!parsed || !parsed.isValid) {
    parsed = parseStudentEmail(email);
  }

  if (parsed && parsed.isValid) {
    return {
      batch: parsed.batch,
      department: parsed.department,
      registrationNumber: parsed.fullRegNumber,
    };
  }

  // Fallback to old method
  return {
    batch: registrationNumber ? registrationNumber.substring(0, 4) : "N/A",
    department: null,
    registrationNumber: registrationNumber || "N/A",
  };
};

// Step 1: Send OTP
export const sendOTP = async (req, res) => {
  try {
    const { name, email, role, registrationNumber, department, phone } =
      req.body;

    // Validation
    if (!name || !email || !role) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Validate email format
    if (!validateEmail(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    // For students, validate SUST email and auto-extract info
    if (role === "student") {
      try {
        const parsed = parseStudentEmail(email);
        if (!parsed || !parsed.isValid) {
          return res.status(400).json({
            message:
              "Please use your SUST student email (e.g., 2019331008@student.sust.edu)",
          });
        }
      } catch (parseError) {
        console.error("Error parsing student email:", parseError);
        return res.status(400).json({
          message: "Invalid email format for student registration",
        });
      }
    }

    // For teachers, department is required
    if (role === "teacher" && !department) {
      return res.status(400).json({
        message: "Department is required for teachers",
      });
    }

    // Check if user already exists in main User collection
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(400)
        .json({ message: "User already registered with this email" });
    }

    // Auto-detect batch and department from registration number or email (for students)
    let detectedBatch = "N/A";
    let detectedDepartment = department || "N/A";
    let finalRegNumber = registrationNumber || "N/A";

    if (role === "student") {
      try {
        const studentInfo = extractStudentInfo(email, registrationNumber);
        detectedBatch = studentInfo.batch || "N/A";
        detectedDepartment = studentInfo.department || "N/A";
        finalRegNumber = studentInfo.registrationNumber || "N/A";
      } catch (extractError) {
        console.error("Error extracting student info:", extractError);
        // Use fallback values
        detectedBatch = "N/A";
        detectedDepartment = "N/A";
        finalRegNumber = "N/A";
      }
    } else if (role === "teacher") {
      // Teachers don't have batch or registration number
      detectedBatch = "N/A";
      finalRegNumber = "N/A";
    }

    // Generate OTP
    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Check if there's a pending registration
    const pendingUser = await PendingUser.findOne({ email });

    if (pendingUser) {
      // Update existing pending user with auto-detected values
      pendingUser.name = name;
      pendingUser.role = role;
      pendingUser.registrationNumber = finalRegNumber;
      pendingUser.department = detectedDepartment || "N/A";
      pendingUser.batch = detectedBatch;
      pendingUser.phone = phone || "";
      pendingUser.otp = otp;
      pendingUser.otpExpiry = otpExpiry;
      await pendingUser.save();
    } else {
      // Create new pending user with auto-detected values
      await PendingUser.create({
        name,
        email,
        role,
        registrationNumber: finalRegNumber,
        department: detectedDepartment || "N/A",
        batch: detectedBatch,
        phone: phone || "",
        password: "temp", // Temporary, will be replaced
        otp,
        otpExpiry,
      });
    }

    // Send OTP email
    await sendOTPEmail(email, otp, name);

    // Log OTP prominently in development
    if (process.env.NODE_ENV !== "production") {
      console.log("\n" + "🔐".repeat(35));
      console.log(`🔐 OTP FOR ${email}: ${otp}`);
      console.log("🔐".repeat(35) + "\n");
    }

    res.status(200).json({
      message: "OTP sent to your email",
      batch: detectedBatch,
      email,
    });
  } catch (error) {
    console.error("Send OTP error:", error);
    res.status(500).json({ message: error.message });
  }
};

// Step 2: Verify OTP and Complete Registration
export const verifyOTPAndRegister = async (req, res) => {
  try {
    const { email, otp, password } = req.body;

    if (!email || !otp || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (!validatePassword(password)) {
      return res.status(400).json({
        message: "Password must be at least 6 characters",
      });
    }

    // Check if user already exists in main collection
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(400)
        .json({ message: "Email already verified. Please login." });
    }

    // Find pending user
    const pendingUser = await PendingUser.findOne({ email });
    if (!pendingUser) {
      return res
        .status(404)
        .json({ message: "Registration not found. Please request OTP again." });
    }

    // Verify OTP
    if (pendingUser.otp !== otp) {
      return res.status(400).json({ message: "Invalid OTP code" });
    }

    // Check OTP expiry
    if (new Date() > pendingUser.otpExpiry) {
      return res
        .status(400)
        .json({ message: "OTP has expired. Please request a new one." });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Auto-approve only @student.sust.edu and @teacher.sust.edu emails
    const isAutoApproved =
      email.endsWith("@student.sust.edu") ||
      email.endsWith("@teacher.sust.edu");

    // Create actual user in main User collection (ONLY after OTP verification)
    const user = await User.create({
      name: pendingUser.name,
      email: pendingUser.email,
      role: pendingUser.role,
      registrationNumber: pendingUser.registrationNumber || "N/A",
      department: pendingUser.department,
      batch: pendingUser.batch,
      phone: pendingUser.phone || "",
      password: hashedPassword,
      otpVerified: true,
      isStudentVerified: email.endsWith("@student.sust.edu"),
      emailVerified: true,
      isApproved: isAutoApproved,
      approvedAt: isAutoApproved ? new Date() : null,
      accountCreatedAt: new Date(),
    });

    // Delete pending user
    await PendingUser.deleteOne({ email });

    // Send welcome email
    await sendWelcomeEmail(email, user.name);

    // Only generate tokens for auto-approved users
    if (isAutoApproved) {
      const { accessToken, refreshToken } = generateTokens(user._id);

      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        department: user.department,
        batch: user.batch,
        registrationNumber: user.registrationNumber,
        role: user.role,
        isStudentVerified: user.isStudentVerified,
        isApproved: user.isApproved,
        accessToken,
        message: "Registration successful! Welcome to SUST Connect.",
      });
    } else {
      // For unapproved users, don't give tokens
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        isApproved: false,
        requiresApproval: true,
        message:
          "Registration successful! Your account is pending admin approval. You will receive an email once approved.",
      });
    }
  } catch (error) {
    console.error("Verify OTP error:", error);
    res.status(500).json({ message: error.message });
  }
};

// Legacy register endpoint (kept for backward compatibility)
export const register = async (req, res) => {
  const { name, email, department, password } = req.body;

  if (!name || !email || !department || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  if (!validateEmail(email))
    return res
      .status(400)
      .json({ message: "Only @student.sust.edu emails are allowed" });
  if (!validatePassword(password))
    return res
      .status(400)
      .json({ message: "Password must be at least 6 characters" });

  const userExists = await User.findOne({ email });
  if (userExists)
    return res.status(400).json({ message: "User already exists" });

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await User.create({
    name,
    email,
    department,
    password: hashedPassword,
    registrationNumber: "N/A",
    batch: "N/A",
  });

  const { accessToken, refreshToken } = generateTokens(user._id);

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  res.status(201).json({
    _id: user._id,
    name: user.name,
    email: user.email,
    department: user.department,
    role: user.role,
    accessToken,
  });
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Check if user is banned
    if (user.isBanned) {
      return res.status(403).json({
        message: user.banReason
          ? `Your account has been banned. Reason: ${user.banReason}`
          : "Your account has been banned. Please contact support.",
        banned: true,
      });
    }

    // Check if user is approved
    if (!user.isApproved) {
      return res.status(403).json({
        message:
          "Your account is pending admin approval. Please wait for verification.",
        pending: true,
      });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    const { accessToken, refreshToken } = generateTokens(user._id);

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      department: user.department,
      batch: user.batch,
      registrationNumber: user.registrationNumber,
      phone: user.phone,
      bio: user.bio,
      interests: user.interests,
      role: user.role,
      isStudentVerified: user.isStudentVerified,
      profilePicture: user.profilePicture,
      accessToken,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const logout = (req, res) => {
  res.clearCookie("refreshToken");
  res.json({ message: "Logged out" });
};

export const getProfile = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(200).json(null); // No user → return null
    }
    const user = await User.findById(req.user._id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  } catch (error) {
    console.error("Get profile error:", error);
    res.status(500).json({ message: error.message });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const {
      name,
      bio,
      interests,
      phone,
      department,
      username,
      gender,
      dateOfBirth,
      socialLinks,
      address,
      dormInfo,
      coursesEnrolled,
      coursesTaught,
    } = req.body;

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update fields if provided
    if (name) user.name = name;
    if (bio !== undefined) user.bio = bio;
    if (interests) user.interests = interests;
    if (phone !== undefined) user.phone = phone;
    if (department) user.department = department;

    // Handle username specially - empty string should be null to avoid unique constraint issues
    if (username !== undefined) {
      user.username = username.trim() === "" ? null : username.trim();
    }

    if (gender !== undefined) user.gender = gender;
    if (dateOfBirth !== undefined) user.dateOfBirth = dateOfBirth;
    if (socialLinks) user.socialLinks = socialLinks;
    if (address) user.address = address;
    if (dormInfo) user.dormInfo = dormInfo;
    if (coursesEnrolled) user.coursesEnrolled = coursesEnrolled;
    if (coursesTaught) user.coursesTaught = coursesTaught;

    await user.save();

    const userResponse = user.toObject();
    delete userResponse.password;
    res.json(userResponse);
  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).json({ message: error.message });
  }
};

export const uploadProfilePicture = async (req, res) => {
  try {
    console.log("Upload profile picture request received");
    console.log("File:", req.file);
    console.log("User:", req.user?._id);

    if (!req.file) {
      console.log("No file in request");
      return res.status(400).json({ message: "No image provided" });
    }

    console.log("Uploading to Cloudinary...");
    const imageUrl = await uploadImage(req.file);
    console.log("Image uploaded:", imageUrl);

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.profilePicture = imageUrl;
    await user.save();
    console.log("User updated successfully");

    const userResponse = user.toObject();
    delete userResponse.password;
    res.json(userResponse);
  } catch (error) {
    console.error("Profile picture upload error:", error);
    console.error("Error stack:", error.stack);
    res.status(500).json({ message: error.message });
  }
};

export const changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const user = await User.findById(req.user._id);

  const isMatch = await bcrypt.compare(currentPassword, user.password);
  if (!isMatch)
    return res.status(400).json({ message: "Current password incorrect" });

  user.password = await bcrypt.hash(newPassword, 10);
  await user.save();
  res.json({ message: "Password changed" });
};
