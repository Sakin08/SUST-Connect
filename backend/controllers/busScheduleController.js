import BusSchedule from "../models/BusSchedule.js";
import { uploadImage } from "../services/cloudinaryService.js";
import { deleteCachePattern } from "../services/cacheService.js";

// Get active bus schedule
export const getActiveSchedule = async (req, res) => {
  try {
    const schedule = await BusSchedule.findOne({ isActive: true }).sort({
      createdAt: -1,
    });
    res.json(schedule);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Upload new bus schedule (admin only)
export const uploadSchedule = async (req, res) => {
  try {
    const { title, description } = req.body;

    if (!req.files || req.files.length === 0) {
      if (!req.file) {
        return res
          .status(400)
          .json({ message: "Please upload at least one image" });
      }
    }

    // Handle multiple images or single image
    let images = [];
    let imageUrl = null;

    if (req.files && req.files.length > 0) {
      // Multiple images
      for (const file of req.files) {
        const url = await uploadImage(file);
        images.push(url);
      }
      imageUrl = images[0]; // Set first image as primary for backward compatibility
    } else if (req.file) {
      // Single image (backward compatibility)
      imageUrl = await uploadImage(req.file);
      images = [imageUrl];
    }

    // Deactivate all previous schedules
    await BusSchedule.updateMany({}, { isActive: false });

    // Create new schedule
    const schedule = await BusSchedule.create({
      title: title || "SUST Bus Schedule",
      description,
      imageUrl,
      images,
      isActive: true,
      uploadedBy: req.user._id,
    });

    // Invalidate bus schedule cache
    deleteCachePattern("route_/api/bus-schedule");

    res.status(201).json(schedule);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete schedule (admin only)
export const deleteSchedule = async (req, res) => {
  try {
    const schedule = await BusSchedule.findByIdAndDelete(req.params.id);
    if (!schedule) {
      return res.status(404).json({ message: "Schedule not found" });
    }

    // Invalidate bus schedule cache
    deleteCachePattern("route_/api/bus-schedule");

    res.json({ message: "Schedule deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
