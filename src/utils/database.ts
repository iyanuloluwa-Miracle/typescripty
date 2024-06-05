import mongoose from "mongoose";

const connectToDb = async () => {
  const dbUrl: any = process.env.MONGODB_URL;
  try {
    await mongoose.connect(dbUrl);
    console.log(`Connected to MongoDb successfully at 🎉`);
  } catch (error) {
    console.error(`An error occured while connecting to MongoDb 👾 ${error}`);
  }
};

export default connectToDb;
