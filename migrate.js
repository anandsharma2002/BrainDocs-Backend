const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Topic = require('./models/Topic');

dotenv.config();

const migrateTopics = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        // Check if Admin user exists by email
        let superAdmin = await User.findOne({ email: 'admin@braindocs.com' });

        if (!superAdmin) {
            // Create default SuperAdmin
            console.log('Creating default SuperAdmin...');
            superAdmin = await User.create({
                name: 'Super Admin',
                email: 'admin@braindocs.com',
                password: 'admin123',
                role: 'SuperAdmin'
            });
            console.log('SuperAdmin created:', superAdmin.email);
        } else {
            console.log('SuperAdmin found. Updating credentials...');
            // Force reset password and role to ensure access
            superAdmin.password = 'admin123';
            superAdmin.role = 'SuperAdmin';
            await superAdmin.save();
            console.log('SuperAdmin credentials updated/verified:', superAdmin.email);
        }

        // Find all topics without an owner
        const topicsWithoutOwner = await Topic.find({ owner: { $exists: false } });
        console.log(`Found ${topicsWithoutOwner.length} topics without owner`);

        if (topicsWithoutOwner.length > 0) {
            // Update all topics to have the SuperAdmin as owner and set isPublic to true
            const result = await Topic.updateMany(
                { owner: { $exists: false } },
                {
                    $set: {
                        owner: superAdmin._id,
                        isPublic: true,
                        sharedWith: []
                    }
                }
            );

            console.log(`Updated ${result.modifiedCount} topics`);
            console.log('Migration completed successfully!');
        } else {
            console.log('No topics need migration');
        }

        // Display summary
        const totalTopics = await Topic.countDocuments();
        const publicTopics = await Topic.countDocuments({ isPublic: true });
        const privateTopics = await Topic.countDocuments({ isPublic: false });

        console.log('\n=== Migration Summary ===');
        console.log(`Total Topics: ${totalTopics}`);
        console.log(`Public Topics: ${publicTopics}`);
        console.log(`Private Topics: ${privateTopics}`);
        console.log(`SuperAdmin: ${superAdmin.email}`);
        console.log('========================\n');

        process.exit(0);
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
};

migrateTopics();
