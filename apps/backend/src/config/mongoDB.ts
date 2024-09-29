import mongoose from "mongoose";
import { MONGO_DB } from "./config";

export const connectWithRetry = () => {
  console.log({MONGO_DB});
  
  mongoose
    .connect(MONGO_DB as string, { dbName: "testify" })
    .then(() => console.log("successfully connected to DB"))
    .catch((e: Error) => {
      console.log(e);
      console.log("will try connect to DB after 5s");

      setTimeout(connectWithRetry, 5000);
    });
};
