const express = require('express');
const upload = require('../middlewares/uploadMiddleware');
const { protect } = require('../middlewares/authMiddleware');

const { uploadToCloudinary } = require('../utils/cloudinary');

const router = express.Router();

// @desc    Upload an image
// @route   POST /api/upload
// @access  Private
router.post('/', protect, upload.single('image'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'Please upload a file' });
  }

  try {
    const result = await uploadToCloudinary(req.file.buffer, 'stayzium_uploads');
    
    res.status(200).json({
      success: true,
      message: 'Image uploaded successfully to Cloudinary',
      data: {
        url: result.secure_url,
        public_id: result.public_id
      }
    });
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    res.status(500).json({ success: false, message: 'Failed to upload image to Cloudinary' });
  }
});

module.exports = router;
