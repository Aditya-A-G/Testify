import amqp from "amqplib";
import * as dotenv from "dotenv";
import puppeteer, { Browser, PredefinedNetworkConditions } from "puppeteer";

dotenv.config();

let connection: amqp.Connection;
let channel: amqp.Channel;
let browser: Browser;
let REGION_QUEUE = process.argv[2];
const prefetchCount = 1;
const backendUrl = process.env.BACKEND_URL;
const AMQP = process.env.AMQP as string;

if (!REGION_QUEUE) {
  console.error(
    "No region queue name as an argument provided. using india_queue"
  );
  REGION_QUEUE = "india_queue";
}

interface PaintMetrics {
  firstPaintTime: number;
  firstContentfulPaintTime: number;
}

async function initBrowser() {
  if (!browser) {
    browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox"]
    });
    console.log("Browser instance initialized");
  }
}

async function closeBrowser() {
  if (browser) {
    await browser.close();
    console.log("Browser instance closed");
  }
}

async function connectRabbitMQ() {
  if (!connection) {
    connection = await amqp.connect(AMQP, {
      heartbeat: 10,
    });
    console.log("RabbitMQ connection established");
  }

  if (!channel) {
    channel = await connection.createChannel();
    console.log("RabbitMQ channel created");
  }

  return { connection, channel };
}

async function testWebsitePerformance(websiteUrl: string) {
  console.log(`Performing test for ${websiteUrl}...`);

  await initBrowser();

  const page = await browser.newPage();

  await page.emulateNetworkConditions(PredefinedNetworkConditions["Slow 4G"]);

  try {
    let requestCount = 0;
    page.on("request", (request) => {
      requestCount++;
    });

    let totalSize = 0;
    page.on("response", async (response) => {
      try {
        const request = response.request();

        if (request.method() !== "GET") return;

        const status = response.status();
        if (status >= 300 && status < 400) {
          console.log(`Redirect response: ${status} to ${response.url()}`);
          return;
        }

        if (response.headers()["content-length"] === "0") {
          console.log(
            `Skipping zero-content-length response for ${response.url()}`
          );
          return;
        }

        const buffer = await response.buffer();
        totalSize += buffer.length;
      } catch (error) {
        console.error("Something went wrong", error);
      }
    });

    await page.goto(websiteUrl, { waitUntil: "networkidle0", timeout: 300000 });

    const performanceTiming = await page.evaluate(() =>
      JSON.stringify(window.performance.timing)
    );

    const metrics = JSON.parse(performanceTiming);

    const loadTime = metrics.loadEventEnd - metrics.navigationStart;
    const ttfb = metrics.responseStart - metrics.navigationStart;
    const domContentLoaded =
      metrics.domContentLoadedEventEnd - metrics.navigationStart;
    const timeToInteractive = metrics.domComplete - metrics.navigationStart;

    const paintMetrics = await page.evaluate(() => {
      return new Promise<PaintMetrics>((resolve) => {
        let firstPaintTime = 0;
        let firstContentfulPaintTime = 0;

        const observer = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry) => {
            if (entry.name === "first-paint") {
              firstPaintTime = entry.startTime;
            } else if (entry.name === "first-contentful-paint") {
              firstContentfulPaintTime = entry.startTime;
            }
          });
        });

        observer.observe({ type: "paint", buffered: true });

        setTimeout(() => {
          resolve({ firstPaintTime, firstContentfulPaintTime });
        }, 1000);
      });
    });

    const result = {
      status: "success",
      loadTime,
      ttfb,
      domContentLoaded,
      timeToInteractive,
      firstPaintTime: paintMetrics.firstPaintTime,
      firstContentfulPaintTime: paintMetrics.firstContentfulPaintTime,
      numberOfRequests: requestCount,
      pageSize: totalSize,
      testedAt: new Date(),
    };

    return result;
  } catch (error) {
    console.error("Error testing site performance:", error);
    return {
      status: "failed",
      error: "Failed to load the website",
    };
  } finally {
    await page.close();
  }
}

async function sendResultsToBackend(result: any) {
  try {
    const response = await fetch(`${backendUrl}/api/v1/results`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(result),
    });

    if (response.ok) {
      console.log("Results sent successfully to the backend.");
    } else {
      console.error(
        "Failed to send results to the backend:",
        response.statusText
      );
    }
  } catch (error) {
    console.error("Error sending results to backend:", error);
  }
}

async function startWorker() {
  try {
    const { channel } = await connectRabbitMQ();

    await channel.prefetch(prefetchCount);
    await channel.assertQueue(REGION_QUEUE, { durable: true });
    console.log(`Waiting for messages in queue: ${REGION_QUEUE}`);

    channel.consume(
      REGION_QUEUE,
      async (msg) => {
        if (msg !== null) {
          let jobId, websiteUrl;

          try {
            const data = JSON.parse(msg.content.toString());
            jobId = data.jobId;
            websiteUrl = data.websiteUrl;

            console.log(`Received message from ${REGION_QUEUE}: ${websiteUrl}`);
            const result = await testWebsitePerformance(websiteUrl);

            channel.ack(msg);
            console.log(`Test result for ${websiteUrl}:`, result);

            const resultPayload = {
              jobId,
              ...result,
            };

            await sendResultsToBackend(resultPayload);
          } catch (error) {
            console.error("Error processing message:", error);

            const errorPayload = {
              jobId,
              status: "failed",
              error: "Unknown error occurred while testing.",
            };

            await sendResultsToBackend(errorPayload);

            channel.ack(msg);
          }
        }
      },
      { noAck: false }
    );
  } catch (error) {
    console.error("Error starting worker:", error);
  } finally {
    await closeBrowser();
  }
}

startWorker();
