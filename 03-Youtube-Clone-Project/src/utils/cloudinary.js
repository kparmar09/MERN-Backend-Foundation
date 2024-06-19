import { v2 as cloudinary } from "cloudinary";
import fs from "fs"; // File System

// Configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) {
      console.log("File path not found");
      return null;
    }
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
    });
    fs.unlinkSync(localFilePath);
    return response;
  } catch (error) {
    fs.unlinkSync(localFilePath); // Removes the locally saved temporary file as the upload method fails
    return null;
  }
};

const deleteFromCloudinary = async (fileId) => {
  try {
    await cloudinary
      .delete_resources([fileId], {
        type: "upload",
        resource_type: "auto",
      })
      .then(console.log);
  } catch (error) {
    console.log("Error while deleting from cloudinary: ", error);
  }
};

export { uploadOnCloudinary, deleteFromCloudinary };
