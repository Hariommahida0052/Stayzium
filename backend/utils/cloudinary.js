const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

/**
 * Uploads a file buffer to Cloudinary
 * @param {Buffer} fileBuffer - The file buffer from multer
 * @param {String} folder - The folder name in Cloudinary
 * @returns {Promise<Object>} - The Cloudinary upload result
 */
const uploadToCloudinary = (fileBuffer, folder = 'stayzium') => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { 
        folder,
        format: 'png', // Force all uploads to be stored as high-quality PNG
        transformation: [
          { quality: "100" } // Ensure maximum quality during conversion
        ]
      },
      (error, result) => {
        if (result) {
          resolve(result);
        } else {
          reject(error);
        }
      }
    );
    streamifier.createReadStream(fileBuffer).pipe(uploadStream);
  });
};

/**
 * Deletes a file from Cloudinary using its public_id
 * @param {String} publicId - The public ID of the image on Cloudinary
 * @returns {Promise<Object>} - The Cloudinary deletion result
 */
const deleteFromCloudinary = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    console.error('Error deleting from Cloudinary:', error);
    throw error;
  }
};

/**
 * Extracts the public_id from a Cloudinary URL
 * @param {String} url - The Cloudinary image URL
 * @returns {String|null} - The extracted public_id or null if not a cloudinary URL
 */
const getPublicIdFromUrl = (url) => {
  if (!url || !url.includes('cloudinary.com')) return null;
  // Example URL: https://res.cloudinary.com/demo/image/upload/v12345/stayzium/abcde123.jpg
  try {
    const splitUrl = url.split('/');
    // Get everything after the version number (e.g., v12345) and remove the extension
    const uploadIndex = splitUrl.findIndex(part => part === 'upload');
    if (uploadIndex === -1) return null;
    
    // The path starts after the 'upload' and 'vXXXX' parts
    // usually: .../upload/v1234/folder/file.ext
    // We want 'folder/file'
    const partsAfterUpload = splitUrl.slice(uploadIndex + 2);
    const fullPathWithExt = partsAfterUpload.join('/');
    const lastDotIndex = fullPathWithExt.lastIndexOf('.');
    
    if (lastDotIndex !== -1) {
      return fullPathWithExt.substring(0, lastDotIndex);
    }
    return fullPathWithExt;
  } catch (error) {
    console.error('Error extracting public ID:', error);
    return null;
  }
};

module.exports = {
  cloudinary,
  uploadToCloudinary,
  deleteFromCloudinary,
  getPublicIdFromUrl
};
