const supabase = require('../config/supabase');

// Upload image to Supabase Storage
exports.uploadImage = async (req, res) => {
    try {
        // Check if file exists
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        const file = req.file;

        // Validate file type
        const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
        if (!allowedMimeTypes.includes(file.mimetype)) {
            return res.status(400).json({ message: 'Invalid file type. Only JPEG, PNG, GIF, and WebP images are allowed.' });
        }

        // Validate file size (5MB max)
        const maxSize = 5 * 1024 * 1024; // 5MB in bytes
        if (file.size > maxSize) {
            return res.status(400).json({ message: 'File size exceeds 5MB limit' });
        }

        // Generate unique filename
        const timestamp = Date.now();
        const originalName = file.originalname.replace(/\s+/g, '_'); // Replace spaces with underscores
        const fileName = `${timestamp}_${originalName}`;

        // Upload to Supabase Storage
        const { data, error } = await supabase.storage
            .from('braindocs-images')
            .upload(fileName, file.buffer, {
                contentType: file.mimetype,
                cacheControl: '3600',
                upsert: false
            });

        if (error) {
            console.error('Supabase upload error:', error);
            console.error('Error details:', JSON.stringify(error, null, 2));
            console.error('Bucket name:', 'braindocs-images');
            console.error('File name:', fileName);
            return res.status(500).json({
                message: 'Failed to upload image to storage',
                error: error.message,
                details: error.hint || error.details || 'No additional details'
            });
        }

        // Get public URL
        const { data: publicUrlData } = supabase.storage
            .from('braindocs-images')
            .getPublicUrl(fileName);

        if (!publicUrlData || !publicUrlData.publicUrl) {
            return res.status(500).json({ message: 'Failed to get public URL for uploaded image' });
        }

        res.status(200).json({
            message: 'Image uploaded successfully',
            url: publicUrlData.publicUrl,
            fileName: fileName
        });

    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ message: 'Server error during upload', error: error.message });
    }
};
