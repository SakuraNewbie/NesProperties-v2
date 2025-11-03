const fs = require('fs');
const path = require('path');
const os = require('os');
const multer = require('multer');

// Allow overriding uploads directory via env (helps serverless platforms)
let uploadsDir = process.env.UPLOADS_DIR || path.join(__dirname, '../uploads');
let diskUploadsEnabled = true;

// Define directories
let propertyImagesDir = path.join(uploadsDir, 'properties');
let virtualToursDir = path.join(uploadsDir, 'virtual-tours');

// Make sure directories exist; if not possible, fall back to tmpdir
try {
  [uploadsDir, propertyImagesDir, virtualToursDir].forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });
} catch (err) {
  console.error('FileUpload: cannot create upload directories at', uploadsDir, '-', err.message);
  // Fall back to tmpdir
  try {
    uploadsDir = path.join(os.tmpdir(), 'nes-properties-uploads');
    propertyImagesDir = path.join(uploadsDir, 'properties');
    virtualToursDir = path.join(uploadsDir, 'virtual-tours');
    [uploadsDir, propertyImagesDir, virtualToursDir].forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });
    console.warn('FileUpload: falling back to tmpdir for uploads:', uploadsDir);
  } catch (err2) {
    console.error('FileUpload: tmpdir fallback failed - using memory storage for uploads:', err2.message);
    diskUploadsEnabled = false;
  }
}

// Configure storage
let storage;
if (diskUploadsEnabled) {
  storage = multer.diskStorage({
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
} else {
  // Fall back to memory storage for serverless
  storage = multer.memoryStorage();
}

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
    fileSize: 20 * 1024 * 1024
  },
  fileFilter: fileFilter
});

module.exports = {
  upload,
  propertyImagesDir,
  virtualToursDir,
  diskUploadsEnabled,
  uploadsDir
};
