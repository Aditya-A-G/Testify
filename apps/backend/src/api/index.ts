import express from "express";
import { v4 as uuidv4 } from "uuid";
import MessageResponse from "../interfaces/MessageResponse";
import { sendToRegionQueue } from "../config/queue";
import { redis } from "../config/redis";
import { JobModel } from "./models/jobModel";

const router = express.Router();

router.get<{}, MessageResponse>("/", (req, res) => {
  res.json({
    message: "API - 👋🌎🌍🌏",
  });
});

router.post("/tests", async (req, res) => {
  const { websiteUrl, region } = req.body;
  const jobId = uuidv4();

  const newJob = new JobModel({
    jobId,
    websiteUrl,
    region,
    status: "pending",
    testType: "performanceTest",
  });

  await newJob.save();

  await redis.set(jobId, "pending");

  await sendToRegionQueue(region, { jobId, websiteUrl });

  res.json({
    jobId: jobId,
    status: "pending",
  });
});

export default router;
