import mongoose from 'mongoose'

const {Schema, model} = mongoose

const performanceTestResultSchema = new Schema({
  jobId: { type: Schema.Types.ObjectId, ref: "Job", required: true },
  region: { type: String, required: true, enum: ["INDIA", "US", "EU", "SINGAPORE"] }, 
  loadTime: { type: Number, required: true }, 
  domContentLoaded: { type: Number }, 
  firstByteTime: { type: Number }, 
  firstPaintTime: { type: Number }, 
  firstContentfulPaintTime: { type: Number },
  timeToInteractive: { type: Number }, 
  numberOfRequests: { type: Number }, 
  pageSize: { type: Number }, 
  testedAt: { type: Date, default: Date.now }, 
});

export const PerformanceTestResultModel = model("PerformanceTestResult", performanceTestResultSchema)