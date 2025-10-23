const fs = require('fs');
const path = require('path');

// Define directories to create
const directories = [
  'uploads',
  'uploads/properties',
  'uploads/virtual-tours',
  'uploads/profile-images'
];

// Create directories if they don't exist
directories.forEach(dir => {
  const dirPath = path.join(__dirname, dir);
  if (!fs.existsSync(dirPath)) {
    try {
      fs.mkdirSync(dirPath, { recursive: true });
      console.log(`Created directory: ${dirPath}`);
    } catch (err) {
      console.error(`Error creating directory ${dirPath}:`, err);
    }
  } else {
    console.log(`Directory already exists: ${dirPath}`);
  }
});

console.log('Folder setup completed.');
