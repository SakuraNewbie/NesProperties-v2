const fs = require('fs');
const path = require('path');
const multer = require('multer');

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '../uploads');
const propertyImagesDir = path.join(uploadsDir, 'properties');
const virtualToursDir = path.join(uploadsDir, 'virtual-tours');

// Make sure directories exist
[uploadsDir, propertyImagesDir, virtualToursDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Configure storage
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    // Determine appropriate directory based on file type
    let uploadPath = propertyImagesDir;
    
    if (file.fieldname === 'virtualTour' || req.body.imageType === 'virtualTour' || req.body.imageType === 'panorama') {
      uploadPath = virtualToursDir;
    }
    
    cb(null, uploadPath);
  },
  filename: function(req, file, cb) {
    // Generate unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const fileExt = path.extname(file.originalname);
    cb(null, 'property-' + uniqueSuffix + fileExt);
  }
});

// Filter allowed file types
const fileFilter = (req, file, cb) => {
  // Accept only images
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

// Export multer configured instance
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10 MB
  },
  fileFilter: fileFilter
});

module.exports = {
  upload,
  propertyImagesDir,
  virtualToursDir
};
