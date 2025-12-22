import mongoose from 'mongoose';

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log(`MongoDB Connected: ${conn.connection.host}`);

        // --- FIX FOR DUPLICATE KEY ERROR ---
        // Explicitly drop the old index that causes issues with subject-wise attendance
        try {
            // Check if collection exists first to avoid error on fresh DB
            const collections = await conn.connection.db.listCollections({ name: 'attendances' }).toArray();
            
            if (collections.length > 0) {
                const attendanceColl = conn.connection.db.collection('attendances');
                const indexExists = await attendanceColl.indexExists('student_1_date_1');
                
                if (indexExists) {
                    console.log("Found legacy index 'student_1_date_1'. Removing it to enable Subject-wise Attendance...");
                    await attendanceColl.dropIndex('student_1_date_1');
                    console.log("Legacy index removed successfully.");
                }
            }
        } catch (err) {
            // Ignore errors if index doesn't exist or DB is fresh
            console.log("Index check passed (No legacy index found or DB is new).");
        }
        // -----------------------------------

    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

export default connectDB;