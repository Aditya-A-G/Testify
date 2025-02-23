import express from "express";
import { v4 as uuidv4 } from "uuid";
import MessageResponse from "../interfaces/MessageResponse";
import { sendToRegionQueue } from "../config/queue";
import { redis } from "../config/redis";
import { JobModel } from "./models/jobModel";
import { PerformanceTestResultModel } from "./models/performanceTestResultModel";
import { REDIS_EXPIRY_TIME } from "../config/config";

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

router.get("/tests/:id/results", async (req, res) => {
  const { id: jobId } = req.params;

  try {
    const jobStatus = await redis.get(jobId);

    if (!jobStatus) {
      return res.json({
        jobId,
        status: "not found",
        message: "no job with given id is present",
      });
    } else if (jobStatus === "completed") {
      const job = await JobModel.findOne({ jobId }).populate(
        "results.performanceTest"
      );

      if (!job) {
        return res.status(404).json({
          status: "not found",
          message: "Job not found",
        });
      }

      await redis.expire(jobId, REDIS_EXPIRY_TIME);
      return res.status(200).json({
        jobId,
        result: {
          ...job.results,
          region: job.region,
          websiteUrl: job.websiteUrl,
        },
        status: "completed",
        message: "Test completed successfully.",
      });
    } else if (jobStatus === "failed") {
      await redis.expire(jobId, REDIS_EXPIRY_TIME);

      return res.status(400).json({
        jobId,
        status: "failed",
        message: "The test has failed.",
      });
    } else if (jobStatus === "pending") {
      return res.status(202).json({
        jobId,
        status: "pending",
        message: "The test is still running. Please check back later.",
      });
    }
  } catch (error) {
    console.error("Error fetching job results:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to fetch job results",
      error: error,
    });
  }
});
export default router;

router.get("/recent-tests", async (req, res) => {
  const result = await JobModel.find(
    { status: "completed" },
    { results: 1, completedAt: 1, websiteUrl: 1, region: 1 }
  )
    .limit(3)
    .sort({ completedAt: -1 })
    .populate({
      path: "results.performanceTest",
      select: "loadTime",
      model: PerformanceTestResultModel,
    });

  const recentTests = result.map((job: any) => {
    return {
      loadTime: job.results?.performanceTest?.loadTime,
      completedAt: job.completedAt,
      id: job._id,
      websiteUrl: job.websiteUrl,
      region: job.region,
    };
  });
  res.json({
    recentTests: recentTests,
  });
});
