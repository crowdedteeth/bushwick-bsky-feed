import dotenv from 'dotenv';
import { createDb } from '../src/db';
import { Post } from '../src/db/schema';
import { BskyAgent } from '@atproto/api';

const BATCH_SIZE = 10;

const run = async () => {
  dotenv.config();
  const db = createDb(process.env.FEEDGEN_SQLITE_LOCATION!);
  const agent = new BskyAgent({
    service: 'https://public.api.bsky.app/',
  });

  let postsToDelete: string[] = [];
  let cursor: string | undefined = undefined;
  let batch: Post[] | undefined = undefined;
  while (!batch || batch.length) {
    let builder = db
      .selectFrom('post')
      .selectAll()
      .orderBy('indexedAt', 'desc')
      .orderBy('cid', 'desc')
      .limit(BATCH_SIZE);
    if (cursor) {
      const timeStr = new Date(parseInt(cursor, 10)).toISOString();
      builder = builder.where('post.indexedAt', '<', timeStr);
    }
    batch = await builder.execute();
    if (!batch.length) {
      break;
    }

    const response = await agent.getPosts({ uris: batch.map((post) => post.uri) });
    for (const post of batch) {
        if (!response.data.posts.some(livePost => livePost.uri === post.uri)) {
            postsToDelete.push(post.uri);
        }
    }

    cursor = new Date(batch.at(-1)!.indexedAt).getTime().toString(10);
  }

  await db.deleteFrom("post").where('uri', 'in', postsToDelete).execute();
  console.log(`Done! Deleted ${postsToDelete.length} posts.`)
};

run();
