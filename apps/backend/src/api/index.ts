import express from "express";
import { v4 as uuidv4 } from "uuid";
import MessageResponse from "../interfaces/MessageResponse";
import { sendToRegionQueue } from "../config/queue";
import { redis } from "../config/redis";
import { JobModel } from "./models/jobModel";
import { PerformanceTestResultModel } from "./models/performanceTestResultModel";

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

router.post("/results", async (req, res) => {
  const {
    jobId,
    region,
    loadTime,
    domContentLoaded,
    ttfb,
    firstPaintTime,
    firstContentfulPaintTime,
    timeToInteractive,
    numberOfRequests,
    pageSize,
    status,
    error,
  } = req.body;

  try {
    if (status === "failed") {
      await JobModel.findOneAndUpdate(
        { jobId },
        {
          $set: {
            status: "failed",
            completedAt: new Date(),
          },
        }
      );

      await redis.set(jobId, "failed");

      return res.status(400).json({
        message: "Test failed",
        jobId,
        status: "failed",
        error,
      });
    }

    const performanceTestResult = new PerformanceTestResultModel({
      jobId,
      region,
      loadTime,
      domContentLoaded,
      firstByteTime: ttfb,
      firstPaintTime,
      firstContentfulPaintTime,
      timeToInteractive,
      numberOfRequests,
      pageSize,
    });

    await performanceTestResult.save();

    await JobModel.findOneAndUpdate(
      { jobId },
      {
        $set: {
          status: "completed",
          completedAt: new Date(),
          results: { performanceTest: performanceTestResult._id },
        },
      }
    );

    await redis.set(jobId, "completed");

    res.status(200).json({
      message: "Results saved successfully",
      jobId,
      status: "completed",
    });
  } catch (error) {
    console.error("Error saving results:", error);
    res.status(500).json({
      message: "Failed to save results",
      error: error,
    });
  }
});

export default router;
