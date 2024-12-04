import dotenv from 'dotenv';
import { AtpAgent, BlobRef } from '@atproto/api';
import fs from 'fs/promises';
import { ids } from '../src/lexicon/lexicons';
import * as brooklyn from '../src/algos/brooklyn';
import * as bushwick from '../src/algos/bushwick';

const feeds = {
  [brooklyn.shortname]: {
    displayName: 'Brooklyn',
    avatar: '',
    description:
      '🌆⋆.˚𖤓˚⟡   Brooklyn, NY.   ⟡˚⏾˚.⋆🌃\n\nCurated feed for Brooklyn news, events, culture & more.\n\n#brooklynfeed\n\nMore info @ brooklyn.crowdedteeth.net',
  },
  [bushwick.shortname]: {
    displayName: 'Bushwick',
    avatar: '',
    description:
      '🌆⋆.˚𖤓˚⟡   Bushwick, Brooklyn.   ⟡˚⏾˚.⋆🌃\n\nCurated feed for Bushwick news, events, culture & more.\n\n#bushwickfeed\n\nMore info @ bushwick.crowdedteeth.net',
  },
};

const run = async () => {
  dotenv.config();

  const recordName = process.argv[2];
  if (!recordName || Object.keys(feeds).includes(recordName)) {
    throw new Error(
      `Please provide the record name of the feed to publish: (${Object.keys(feeds).join(', ')})`,
    );
  }

  if (!process.env.FEEDGEN_SERVICE_DID && !process.env.FEEDGEN_HOSTNAME) {
    throw new Error('Please provide a hostname in the .env file');
  }

  const handle = process.env.BSKY_APP_HANDLE!;
  const password = process.env.BSKY_APP_PASSWORD!;
  const displayName = feeds[recordName].displayName;
  const description = feeds[recordName].description;
  const avatar = feeds[recordName].avatar;
  const service = 'https://bsky.social';

  const feedGenDid = process.env.FEEDGEN_SERVICE_DID ?? `did:web:${process.env.FEEDGEN_HOSTNAME}`;

  // only update this if in a test environment
  const agent = new AtpAgent({ service: service ? service : 'https://bsky.social' });
  await agent.login({ identifier: handle, password });

  let avatarRef: BlobRef | undefined;
  if (avatar) {
    let encoding: string;
    if (avatar.endsWith('png')) {
      encoding = 'image/png';
    } else if (avatar.endsWith('jpg') || avatar.endsWith('jpeg')) {
      encoding = 'image/jpeg';
    } else {
      throw new Error('expected png or jpeg');
    }
    const img = await fs.readFile(avatar);
    const blobRes = await agent.api.com.atproto.repo.uploadBlob(img, {
      encoding,
    });
    avatarRef = blobRes.data.blob;
  }

  await agent.api.com.atproto.repo.putRecord({
    repo: agent.session?.did ?? '',
    collection: ids.AppBskyFeedGenerator,
    rkey: recordName,
    record: {
      did: feedGenDid,
      displayName: displayName,
      description: description,
      avatar: avatarRef,
      createdAt: new Date().toISOString(),
    },
  });

  console.log('All done 🎉');
};

run();
