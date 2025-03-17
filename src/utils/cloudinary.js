import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs'; // fs is file system which allows to upload, modify and delete files

(async function() {

    // Configuration
    cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET // Click 'View API Keys' above to copy your API secret
    });

    const uploadOnCloudinary = async (localFilePath) => {
        try {
            if (!localFilePath) return null;

            // Upload on Cloudinary
            const response = await cloudinary.uploader.upload(localFilePath, {
                resource_type: "auto"
            });

            // File has been uploaded successfully
            console.log("File is uploaded on Cloudinary", response.secure_url);
            return response;
        } catch (error) {
            fs.unlinkSync(localFilePath); // Remove the locally saved temporary file as the upload operation failed
            return null;
        }
    };

    // Example usage of the uploadOnCloudinary function
    const localFilePath = 'path_to_your_local_file';
    const uploadResult = await uploadOnCloudinary(localFilePath);
    if (uploadResult) {
        console.log('Upload successful:', uploadResult.secure_url);
    } else {
        console.log('Upload failed');
    }

})();

export {uploadOnCloudinary}