const cloudinary = require("../config/cloudinary");
const fs = require("fs");
const path = require("path");

/**
 * Helper function to handle Cloudinary file upload logic with fallback simulation
 */
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
    if (fs.existsSync(localFilePath)) {
      fs.unlinkSync(localFilePath);
    }
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

module.exports = {
  uploadToCloudinary
};
