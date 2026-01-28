const express = require('express');
const multer = require('multer');
const path = require('path');
const supabase = require('../config/supabaseClient');
const router = express.Router();

// Use Memory Storage for Supabase Upload (we need the buffer)
const storage = multer.memoryStorage();

// Init Upload
const upload = multer({
    storage: storage,
    limits: { fileSize: 5000000 }, // 5MB limit
    fileFilter: function (req, file, cb) {
        checkFileType(file, cb);
    }
}).single('image');

// Check File Type
function checkFileType(file, cb) {
    const filetypes = /jpeg|jpg|png|gif|webp/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);

    if (mimetype && extname) {
        return cb(null, true);
    } else {
        cb('Error: Images Only!');
    }
}

// Upload Route
router.post('/', (req, res) => {
    upload(req, res, async (err) => {
        if (err) {
            return res.status(400).json({ message: err });
        }

        if (!req.file) {
            return res.status(400).json({ message: 'No file selected!' });
        }

        try {
            if (!supabase) {
                throw new Error('Supabase client is not initialized. Check server logs for .env config.');
            }

            // Upload to Supabase
            // Bucket: 'Image' (Case sensitive!)

            // Generate filename unique with timestamp
            const fileName = `img-${Date.now()}${path.extname(req.file.originalname)}`;

            const { data, error } = await supabase.storage
                .from('Image') // Use 'Image' bucket
                .upload(fileName, req.file.buffer, {
                    contentType: req.file.mimetype,
                    upsert: false
                });

            if (error) {
                console.error('Supabase Upload Error:', error);
                throw error;
            }

            // Get Public URL
            const { data: publicData } = supabase.storage
                .from('Image')
                .getPublicUrl(fileName);

            res.json({
                message: 'File Uploaded to Supabase!',
                filePath: publicData.publicUrl
            });

        } catch (uploadErr) {
            console.error(uploadErr);
            res.status(500).json({ message: 'Upload failed', error: uploadErr.message });
        }
    });
});

module.exports = router;
