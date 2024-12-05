import dotenv from 'dotenv';
import { AtpAgent } from '@atproto/api';
import { ids } from '../src/lexicon/lexicons';
import { feeds } from './publishFeedGen';

const run = async () => {
  dotenv.config();

  const recordName = process.argv[2];
  if (!recordName || !Object.keys(feeds).includes(recordName)) {
    throw new Error(
      `Please provide the record name of the feed to publish: (${Object.keys(feeds).join(', ')})`,
    );
  }

  const handle = process.env.BSKY_APP_HANDLE!;
  const password = process.env.BSKY_APP_PASSWORD!;
  const service = 'https://bsky.social';

  const agent = new AtpAgent({ service });
  await agent.login({ identifier: handle, password });

  let response = await agent.api.com.atproto.repo.listRecords({
    repo: agent.session!.did,
    collection: ids.AppBskyFeedGenerator,
  });
  console.log(response.data);

  response = await agent.api.com.atproto.repo.applyWrites({
    repo: agent.session?.did ?? '',
    writes: [{
      collection: ids.AppBskyFeedGenerator,
      rkey: recordName,
    }],
  });
  console.log(response);
  
  response = await agent.api.com.atproto.repo.listRecords({
    repo: agent.session!.did,
    collection: ids.AppBskyFeedGenerator,
  });
  console.log(response.data);
};

run();
