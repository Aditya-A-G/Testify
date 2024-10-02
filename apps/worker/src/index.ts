import amqp from "amqplib";
import * as dotenv from "dotenv";

dotenv.config();

let connection: amqp.Connection;
let channel: amqp.Channel;
const prefetchCount = 1;
const REGION_QUEUE = process.argv[2];

if (!REGION_QUEUE) {
  console.error("Please provide a region queue name as an argument.");
  process.exit(1);
}

async function connectRabbitMQ() {
  if (!connection) {
    connection = await amqp.connect(process.env.AMQP as string);
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

  const loadTime = Math.floor(Math.random() * 5000); // Random load time between 0-5000ms
  const domContentLoaded = Math.floor(Math.random() * 3000); // Random DOMContentLoaded time

  const result = {
    website_url: websiteUrl,
    load_time: loadTime,
    dom_content_loaded: domContentLoaded,
    status: "completed",
  };

  return result;
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
          const websiteUrl = msg.content.toString();
          console.log(`Received message from ${REGION_QUEUE}: ${websiteUrl}`);

          const result = await testWebsitePerformance(websiteUrl);

          channel.ack(msg);

          console.log(`Test result for ${websiteUrl}:`, result);
        }
      },
      { noAck: false }
    );
  } catch (error) {
    console.error("Error starting worker:", error);
  }
}

startWorker();
