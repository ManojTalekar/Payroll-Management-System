const multer = require("multer");
const path = require("path");
const fs = require("fs");
const cloudinary = require("../config/cloudinary");

// Ensure upload directory exists
const uploadDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer disk storage setup configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname));
  }
});

// File validation filter logic
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|webp|pdf|doc|docx/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb(new Error("Only images, PDFs, and Word documents are allowed"));
  }
};

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: fileFilter
});

// Helper function to handle Cloudinary upload upload logic
const uploadToCloudinary = async (localFilePath, folderName = "hrms_files") => {
  // Check if Cloudinary credentials are mock/default settings
  const isMock = !process.env.CLOUDINARY_CLOUD_NAME || 
                 process.env.CLOUDINARY_CLOUD_NAME === "dummy_cloud" || 
                 !process.env.CLOUDINARY_API_KEY || 
                 process.env.CLOUDINARY_API_KEY === "123456789";

  if (isMock) {
    // If mock, simulate Cloudinary upload by returning local server path
    const fileBase = path.basename(localFilePath);
    return {
      secure_url: `/uploads/${fileBase}`,
      public_id: `mock_${fileBase}`
    };
  }

  try {
    const result = await cloudinary.uploader.upload(localFilePath, {
      folder: folderName,
      resource_type: "auto"
    });
    // Remove the file locally after uploading to Cloudinary
    fs.unlinkSync(localFilePath);
    return {
      secure_url: result.secure_url,
      public_id: result.public_id
    };
  } catch (error) {
    console.error("Cloudinary upload failed, falling back to local storage URL:", error.message);
    const fileBase = path.basename(localFilePath);
    return {
      secure_url: `/uploads/${fileBase}`,
      public_id: `fallback_${fileBase}`
    };
  }
};

module.exports = { upload, uploadToCloudinary };
