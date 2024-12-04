import dotenv from 'dotenv';
import { createDb } from '../src/db';
import { Post } from '../src/db/schema';
import { BskyAgent } from '@atproto/api';
import { Record as PostRecord, ReplyRef } from '../src/lexicon/types/app/bsky/feed/post';
import { shouldAddPostParent } from '../src/subscription';

const BATCH_SIZE = 10;

const run = async () => {
  dotenv.config();
  const db = createDb(process.env.FEEDGEN_SQLITE_LOCATION!);
  const agent = new BskyAgent({
    service: 'https://public.api.bsky.app/',
  });

  const postsToUpdate: Record<string, ReplyRef> = {};
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
    for (const post of response.data.posts) {
      const record = post.record as PostRecord;
      if (shouldAddPostParent(record)) {
        postsToUpdate[post.cid] = record.reply!;
      }
    }

    cursor = new Date(batch.at(-1)!.indexedAt).getTime().toString(10);
  }

  for (const [cid, reply] of Object.entries(postsToUpdate)) {
    await db
      .updateTable('post')
      .set({ uri: reply.parent.uri, cid: reply.parent.cid })
      .where('cid', '==', cid)
      .executeTakeFirstOrThrow();
  }

  console.log(`Done! Updated ${Object.keys(postsToUpdate).length} posts.`);
};

run();
