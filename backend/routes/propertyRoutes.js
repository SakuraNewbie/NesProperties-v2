const express = require("express");
const router = express.Router();
const Property = require("../models/Property");
const Owner = require("../models/Owner");
const { protect, restrictTo } = require("../middleware/authMiddleware");
const { upload } = require("../utils/fileUpload");
const path = require("path");
const fs = require("fs");
const multer = require("multer");

// Configure storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "../uploads/properties"));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, "property-" + uniqueSuffix + path.extname(file.originalname));
  },
});
const uploadMiddleware = multer({
  storage: storage,
  limits: { fileSize: 20 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only images are allowed"));
    }
  },
});

// Get all properties
router.get("/", async (req, res) => {
  try {
    const filters = {};

    // Process query parameters for filtering
    if (req.query.type) filters.type = req.query.type;
    if (req.query.minPrice)
      filters.price = { $gte: parseInt(req.query.minPrice) };
    if (req.query.maxPrice) {
      filters.price = { ...filters.price, $lte: parseInt(req.query.maxPrice) };
    }
    if (req.query.bedrooms)
      filters.bedrooms = { $gte: parseInt(req.query.bedrooms) };
    if (req.query.genderRestriction && req.query.genderRestriction !== "none") {
      filters.genderRestriction = req.query.genderRestriction;
    }
    if (req.query.owner) filters.owner = req.query.owner;

    // Get properties
    const properties = await Property.find(filters)
      .populate("owner", "fullName phone email")
      .sort({ createdAt: -1 });

    res.json(properties);
  } catch (error) {
    console.error(`Error in endpoint: ${error.message}`);
    res.status(500).json({
      status: "error",
      message: error.message || "An unexpected error occurred",
    });
  }
});

// Search properties
router.get("/search", async (req, res) => {
  try {
    const { query, location } = req.query;

    const filters = {};

    if (query) {
      filters.$text = { $search: query };
    }

    // Improved location search with case-insensitive regex
    if (location) {
      // Handle both string locations and location objects
      filters.$or = [
        { location: { $regex: location, $options: "i" } },
        { "location.area": { $regex: location, $options: "i" } },
        { "location.fullAddress": { $regex: location, $options: "i" } },
      ];
    }

    // Process other query parameters for filtering
    if (req.query.type) filters.type = req.query.type;
    if (req.query.minPrice)
      filters.price = { $gte: parseInt(req.query.minPrice) };
    if (req.query.maxPrice) {
      filters.price = { ...filters.price, $lte: parseInt(req.query.maxPrice) };
    }
    if (req.query.bedrooms)
      filters.bedrooms = { $gte: parseInt(req.query.bedrooms) };
    if (req.query.genderRestriction && req.query.genderRestriction !== "none") {
      filters.genderRestriction = req.query.genderRestriction;
    }

    // Get properties
    const properties = await Property.find(filters)
      .populate("owner", "fullName phone email")
      .sort({ createdAt: -1 });

    res.json(properties);
  } catch (error) {
    console.error(`Error in endpoint: ${error.message}`);
    res.status(500).json({
      status: "error",
      message: error.message || "An unexpected error occurred",
    });
  }
});

// Get featured properties
router.get("/featured", async (req, res) => {
  try {
    const properties = await Property.find({ featured: true })
      .populate("owner", "fullName phone email")
      .sort({ createdAt: -1 });

    res.json(properties);
  } catch (error) {
    console.error(`Error in endpoint: ${error.message}`);
    res.status(500).json({
      status: "error",
      message: error.message || "An unexpected error occurred",
    });
  }
});

// Get a single property
router.get("/:id", async (req, res) => {
  try {
    const property = await Property.findById(req.params.id).populate(
      "owner",
      "fullName phone email"
    );

    if (!property) {
      return res.status(404).json({ message: "Property not found" });
    }

    res.json(property);
  } catch (error) {
    console.error(`Error in endpoint: ${error.message}`);
    res.status(500).json({
      status: "error",
      message: error.message || "An unexpected error occurred",
    });
  }
});

// Create a new property (requires authentication as owner)
router.post("/", protect, restrictTo("owner", "admin"), async (req, res) => {
  try {
    const propertyData = req.body;

    // If owner is not provided, use the logged in owner
    if (!propertyData.owner && req.user.role === "owner") {
      const owner = await Owner.findOne({ userId: req.user._id });
      if (!owner) {
        return res.status(400).json({ message: "Owner profile not found" });
      }
      propertyData.owner = owner._id;
    }

    // Create property
    const property = await Property.create(propertyData);

    // Add property to owner's properties list
    await Owner.findByIdAndUpdate(propertyData.owner, {
      $push: { properties: property._id },
    });

    res.status(201).json(property);
  } catch (error) {
    console.error(`Error in endpoint: ${error.message}`);
    res.status(400).json({
      status: "error",
      message: error.message || "An unexpected error occurred",
    });
  }
});

// Update a property (requires authentication, owner can update their own properties)
router.put("/:id", protect, restrictTo("owner", "admin"), async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);

    if (!property) {
      return res.status(404).json({ message: "Property not found" });
    }

    // Check ownership - allow owners to update only their properties but admins can update any
    if (req.user.role === "owner") {
      const owner = await Owner.findOne({ userId: req.user._id });

      if (!owner || property.owner.toString() !== owner._id.toString()) {
        return res
          .status(403)
          .json({ message: "Not authorized to update this property" });
      }
    }

    // Update property
    const updatedProperty = await Property.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.json(updatedProperty);
  } catch (error) {
    console.error(`Error in endpoint: ${error.message}`);
    res.status(400).json({
      status: "error",
      message: error.message || "An unexpected error occurred",
    });
  }
});

// Delete a property (requires authentication, owner can delete their own properties)
router.delete(
  "/:id",
  protect,
  restrictTo("owner", "admin"),
  async (req, res) => {
    try {
      const property = await Property.findById(req.params.id);

      if (!property) {
        return res.status(404).json({ message: "Property not found" });
      }

      // Check ownership - allow owners to delete only their properties but admins can delete any
      if (req.user.role === "owner") {
        const owner = await Owner.findOne({ userId: req.user._id });

        if (!owner || property.owner.toString() !== owner._id.toString()) {
          return res
            .status(403)
            .json({ message: "Not authorized to delete this property" });
        }

        // Remove property from owner's properties list
        await Owner.findByIdAndUpdate(owner._id, {
          $pull: { properties: property._id },
        });
      }

      // Delete property images if they exist
      if (property.images && property.images.length > 0) {
        property.images.forEach((image) => {
          try {
            if (image.imagePath) {
              const imagePath = path.resolve(
                __dirname,
                "..",
                "uploads",
                image.imagePath
              );
              if (fs.existsSync(imagePath)) {
                fs.unlinkSync(imagePath);
              }
            }
          } catch (err) {
            console.error(`Error deleting image: ${err.message}`);
          }
        });
      }

      // Delete property
      await Property.findByIdAndDelete(req.params.id);

      res.json({ message: "Property deleted successfully" });
    } catch (error) {
      console.error(`Error in endpoint: ${error.message}`);
      res.status(500).json({
        status: "error",
        message: error.message || "An unexpected error occurred",
      });
    }
  }
);

// Upload property images
router.post(
  "/:id/images",
  protect,
  restrictTo("owner", "admin"),
  uploadMiddleware.single("image"),
  async (req, res) => {
    try {
      const property = await Property.findById(req.params.id);

      if (!property) {
        return res.status(404).json({ message: "Property not found" });
      }

      // Check ownership
      if (req.user.role === "owner") {
        const owner = await Owner.findOne({ userId: req.user._id });

        if (!owner || property.owner.toString() !== owner._id.toString()) {
          return res
            .status(403)
            .json({ message: "Not authorized to update this property" });
        }
      }

      if (!req.file) {
        return res.status(400).json({ message: "No image file provided" });
      }

      const imagePath = `/uploads/properties/${req.file.filename}`;
      const isPrimary = req.body.isPrimary === "true";
      const imageType = req.body.imageType || "regular";
      const altText = req.body.altText || property.title;

      // If this is set as primary, unset any existing primary image
      if (isPrimary) {
        property.images.forEach((img) => {
          if (img.imageType === imageType) {
            img.isPrimary = false;
          }
        });
      }

      // Add new image
      const newImage = {
        imagePath,
        isPrimary: isPrimary,
        imageType: imageType,
        altText: altText,
        createdAt: new Date(),
      };

      property.images.push(newImage);
      await property.save();

      res.status(201).json(newImage);
    } catch (error) {
      console.error(`Error in endpoint: ${error.message}`);
      res.status(400).json({
        status: "error",
        message: error.message || "An unexpected error occurred",
      });
    }
  }
);

// Delete property image
router.delete(
  "/:id/images/:imageId",
  protect,
  restrictTo("owner", "admin"),
  async (req, res) => {
    try {
      const property = await Property.findById(req.params.id);

      if (!property) {
        return res.status(404).json({ message: "Property not found" });
      }

      // Check ownership
      if (req.user.role === "owner") {
        const owner = await Owner.findOne({ userId: req.user._id });

        if (!owner || property.owner.toString() !== owner._id.toString()) {
          return res
            .status(403)
            .json({ message: "Not authorized to update this property" });
        }
      }

      // Find the image
      const imageIndex = property.images.findIndex(
        (img) => img._id.toString() === req.params.imageId
      );

      if (imageIndex === -1) {
        return res.status(404).json({ message: "Image not found" });
      }

      // Delete the file if it exists
      try {
        const imagePath = property.images[imageIndex].imagePath;
        if (imagePath) {
          const fullPath = path.resolve(
            __dirname,
            "..",
            imagePath.replace(/^\/uploads/, "uploads")
          );
          if (fs.existsSync(fullPath)) {
            fs.unlinkSync(fullPath);
          }
        }
      } catch (err) {
        console.error(`Error deleting image file: ${err.message}`);
        // Continue even if file deletion fails
      }

      // Remove from database
      property.images.splice(imageIndex, 1);
      await property.save();

      res.json({ message: "Image deleted successfully" });
    } catch (error) {
      console.error(`Error in endpoint: ${error.message}`);
      res.status(500).json({
        status: "error",
        message: error.message || "An unexpected error occurred",
      });
    }
  }
);

// Get all property images
router.get("/:id/images", async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) {
      return res.status(404).json({ message: "Property not found" });
    }
    res.json(property.images || []);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Virtual tour related endpoints
router.post(
  "/:id/virtual-tour",
  protect,
  restrictTo("owner", "admin"),
  upload.single("image"),
  async (req, res) => {
    try {
      const property = await Property.findById(req.params.id);

      if (!property) {
        return res.status(404).json({ message: "Property not found" });
      }

      // Check ownership
      if (req.user.role === "owner") {
        const owner = await Owner.findOne({ userId: req.user._id });

        if (!owner || property.owner.toString() !== owner._id.toString()) {
          return res
            .status(403)
            .json({ message: "Not authorized to update this property" });
        }
      }

      if (!req.file) {
        return res.status(400).json({ message: "No image file provided" });
      }

      const imagePath = `/uploads/virtual-tours/${req.file.filename}`;
      const isPrimary = req.body.isPrimary === "true";
      const hotspots = req.body.hotspots ? JSON.parse(req.body.hotspots) : [];

      // If this is set as primary, unset any existing primary virtual tour
      if (isPrimary) {
        property.images.forEach((img) => {
          if (img.imageType === "panorama" || img.imageType === "virtualTour") {
            img.isPrimary = false;
          }
        });
      }

      // Add new virtual tour image
      const newImage = {
        imagePath,
        isPrimary,
        imageType: "panorama",
        altText: `360° view of ${property.title}`,
        hotspots,
        createdAt: new Date(),
      };

      property.images.push(newImage);
      await property.save();

      res.status(201).json(newImage);
    } catch (error) {
      console.error(`Error in endpoint: ${error.message}`);
      res.status(400).json({
        status: "error",
        message: error.message || "An unexpected error occurred",
      });
    }
  }
);

router.get("/:id/virtual-tour", async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);

    if (!property) {
      return res.status(404).json({ message: "Property not found" });
    }

    const virtualTourImages = property.images.filter(
      (img) => img.imageType === "panorama" || img.imageType === "virtualTour"
    );

    res.json(virtualTourImages);
  } catch (error) {
    console.error(`Error in endpoint: ${error.message}`);
    res.status(500).json({
      status: "error",
      message: error.message || "An unexpected error occurred",
    });
  }
});

// Add a new endpoint to map between display IDs and MongoDB IDs
router.get("/mapping/:displayId", async (req, res) => {
  try {
    const displayId = req.params.displayId;

    // Find the property with the given display ID
    const property = await Property.findOne({ displayId: displayId });

    if (!property) {
      return res.status(404).json({
        error: "Property not found with this display ID",
      });
    }

    // Return the mapping between display ID and MongoDB ID
    res.json({
      displayId: displayId,
      mongoId: property._id.toString(),
    });
  } catch (error) {
    console.error("Error in ID mapping endpoint:", error);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
