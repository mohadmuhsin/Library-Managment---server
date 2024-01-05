const cloudinary = require("cloudinary");

cloudinary.config({
    cloud_name: process.env.CLD_NAME,
    api_key: process.env.CLD_KEY,
    api_secret: process.env.CLD_SCRT,
  });

  
const uploadToCloudinaryImage = async (path, folder) => {
    try {
        // Set the parameters for compression and resizing
        const transformationParams = {
            width: 640, // Set the desired width
            height: 480, // Set the desired height
            quality: "auto:low", // Use auto quality setting (lower quality for smaller file size)
            fetch_format: "auto", // Use 'auto' to maintain the original format
            // Other optional parameters can be added here
        };

        // Upload the image with the specified parameters
        const data = await cloudinary.v2.uploader.upload(path, {
            folder,
            transformation: transformationParams,
        });

        const secureUrl = data.secure_url;
        return { url: secureUrl, public_id: data.public_id };
    } catch (error) {
        console.log(error);
    }
};

const removeFromCloudinary = async (public_id) => {
    await cloudinary.v2.uploader.destroy(public_id, (error, result) => {
      console.log(result, error);
    });
  };


module.exports = { 
    uploadToCloudinaryImage,
    removeFromCloudinary
}