import Contact from "../models/Contact.js";
import { sendEmail } from "../services/emailService.js";

// Submit contact form
export const submitContactForm = async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    // Validate required fields
    if (!name || !email || !subject || !message) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Create contact entry
    const contact = await Contact.create({
      name,
      email,
      subject,
      message,
      user: req.user?._id, // Optional - if user is logged in
    });

    // Send notification email to admin
    try {
      await sendEmail({
        to: process.env.ADMIN_EMAIL || "mdsrsakin2001@gmail.com",
        subject: `New Contact Form: ${subject}`,
        html: `
          <h2>New Contact Form Submission</h2>
          <p><strong>From:</strong> ${name} (${email})</p>
          <p><strong>Subject:</strong> ${subject}</p>
          <p><strong>Message:</strong></p>
          <p>${message}</p>
          <hr>
          <p><small>Submitted at: ${new Date().toLocaleString()}</small></p>
        `,
      });
    } catch (emailError) {
      console.error("Failed to send notification email:", emailError);
      // Don't fail the request if email fails
    }

    // Send confirmation email to user
    try {
      await sendEmail({
        to: email,
        subject: "We received your message - SUST Connect",
        html: `
          <h2>Thank you for contacting us!</h2>
          <p>Hi ${name},</p>
          <p>We have received your message and will get back to you as soon as possible.</p>
          <p><strong>Your message:</strong></p>
          <p>${message}</p>
          <hr>
          <p>Best regards,<br>SUST Connect Team</p>
        `,
      });
    } catch (emailError) {
      console.error("Failed to send confirmation email:", emailError);
    }

    res.status(201).json({
      message: "Your message has been sent successfully!",
      contact,
    });
  } catch (error) {
    console.error("Contact form error:", error);
    res.status(500).json({ message: "Failed to send message" });
  }
};

// Get all contact messages (Admin only)
export const getAllContacts = async (req, res) => {
  try {
    const { status } = req.query;
    const filter = status ? { status } : {};

    const contacts = await Contact.find(filter)
      .populate("user", "name email")
      .sort({ createdAt: -1 });

    res.json(contacts);
  } catch (error) {
    console.error("Get contacts error:", error);
    res.status(500).json({ message: "Failed to fetch contacts" });
  }
};

// Update contact status (Admin only)
export const updateContactStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!["new", "read", "replied"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const contact = await Contact.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!contact) {
      return res.status(404).json({ message: "Contact not found" });
    }

    res.json(contact);
  } catch (error) {
    console.error("Update contact status error:", error);
    res.status(500).json({ message: "Failed to update status" });
  }
};

// Delete contact message (Admin only)
export const deleteContact = async (req, res) => {
  try {
    const { id } = req.params;

    const contact = await Contact.findByIdAndDelete(id);

    if (!contact) {
      return res.status(404).json({ message: "Contact not found" });
    }

    res.json({ message: "Contact deleted successfully" });
  } catch (error) {
    console.error("Delete contact error:", error);
    res.status(500).json({ message: "Failed to delete contact" });
  }
};
