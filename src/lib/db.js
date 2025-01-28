import mongoose from 'mongoose';

const connectToDatabase = async () => {
    if (mongoose.connection.readyState === 1) {
        console.log("Database already connected");
        return;
    }

    try {
        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log("Connected to MongoDB");
    } catch (error) {
        console.error("Error connecting to MongoDB:", error);
        process.exit(1);
    }
};

export default connectToDatabase;
