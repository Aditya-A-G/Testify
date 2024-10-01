import mongoose from "mongoose";

const { Schema, model } = mongoose;

const jobSchema = new Schema({
  jobId: { type: String, required: true, unique: true },
  websiteUrl: { type: String, required: true },
  status: { type: String, default: "pending", required: true, enum: ["pending", "completed", "failed"] },
  region: {type: String, required: true, enum: ["us", "eu", "asia", "india"]},
  testType: { type: String, required: true, enum: ["performanceTest"] },
  completedAt: { type: Date },
  results: {
    performanceTest: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PerformanceTestResult",
    }, 
  },
});

export const JobModel = model("Job", jobSchema);
