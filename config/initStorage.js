const supabase = require('./supabase');

/**
 * Initialize Supabase Storage bucket for images
 * This will create the bucket if it doesn't exist
 */
async function initializeStorage() {
    try {
        const bucketName = 'braindocs-images';

        // Check if bucket exists
        const { data: buckets, error: listError } = await supabase.storage.listBuckets();

        if (listError) {
            console.error('Error listing buckets:', listError);
            return false;
        }

        const bucketExists = buckets.some(bucket => bucket.name === bucketName);

        if (bucketExists) {
            console.log(`✅ Storage bucket '${bucketName}' already exists`);
            return true;
        }

        // Create bucket if it doesn't exist
        console.log(`Creating storage bucket '${bucketName}'...`);
        const { data, error } = await supabase.storage.createBucket(bucketName, {
            public: true,
            fileSizeLimit: 5242880, // 5MB in bytes
            allowedMimeTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
        });

        if (error) {
            console.error('❌ Error creating bucket:', error);
            console.error('Please create the bucket manually in Supabase Dashboard');
            return false;
        }

        console.log(`✅ Storage bucket '${bucketName}' created successfully`);
        return true;

    } catch (error) {
        console.error('❌ Storage initialization error:', error);
        return false;
    }
}

module.exports = { initializeStorage };
