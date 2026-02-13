const fs = require('fs');
const path = require('path');
const multer = require('multer');

const uploadDir = path.join(__dirname, '..', '..', 'uploads', 'videos');
fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const safeName = file.originalname.replace(/\s+/g, '-').toLowerCase();
    cb(null, `${Date.now()}-${safeName}`);
  },
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype !== 'video/mp4') {
    cb(new Error('Only MP4 video uploads are allowed.'));
    return;
  }
  cb(null, true);
};

const videoUpload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 1024 * 1024 * 500,
  },
});

module.exports = { videoUpload, uploadDir };
