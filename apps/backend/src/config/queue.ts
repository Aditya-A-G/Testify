import amqp from 'amqplib';
import {AMQP} from './config'

let connection: amqp.Connection;
let channel: amqp.Channel;

const regionQueues = {
  us: 'us_queue',
  eu: 'eu_queue',
  asia: 'asia_queue',
  india: 'india_queue',
};

async function connectRabbitMQ() {
  if (!connection) {
    connection = await amqp.connect(AMQP);
    console.log('RabbitMQ connection established');
  }

  if (!channel) {
    channel = await connection.createChannel();
    console.log('RabbitMQ channel created');
  }

  return { connection, channel };
}

export async function sendToRegionQueue(region: keyof typeof regionQueues, payload: {jobId: string, websiteUrl: string}) {
  const { channel } = await connectRabbitMQ();

  const queueName = regionQueues[region];

  await channel.assertQueue(queueName, { durable: true });

  channel.sendToQueue(queueName, Buffer.from(JSON.stringify(payload)), { persistent: true });

  console.log(`Sent message to ${queueName}: ${payload}`);
}

