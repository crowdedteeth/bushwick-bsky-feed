import dotenv from 'dotenv';
import FeedGenerator from './server';

const run = async () => {
  dotenv.config();
  const server = FeedGenerator.create({
    port: parseInt(process.env.FEEDGEN_PORT!, 10),
    listenhost: process.env.FEEDGEN_LISTENHOST!,
    sqliteLocation: process.env.FEEDGEN_SQLITE_LOCATION!,
    subscriptionEndpoint: process.env.FEEDGEN_SUBSCRIPTION_ENDPOINT!,
    publisherDid: process.env.FEEDGEN_PUBLISHER_DID!,
    subscriptionReconnectDelay: parseInt(process.env.FEEDGEN_SUBSCRIPTION_RECONNECT_DELAY!, 10),
    hostname: process.env.FEEDGEN_HOSTNAME!,
    serviceDid: process.env.FEEDGEN_SERVICE_DID ?? `did:web:${process.env.FEEDGEN_HOSTNAME!}`,
  });
  await server.start();
  console.log(`🤖 running feed generator at http://${server.cfg.listenhost}:${server.cfg.port}`);
};

run();
