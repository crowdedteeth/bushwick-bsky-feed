import { InvalidRequestError } from '@atproto/xrpc-server';
import { Server } from '../lexicon';
import { AppContext } from '../config';
import { algos } from '../algos';
import { AtUri } from '@atproto/syntax';

export function getFeedSkeleton(server: Server, ctx: AppContext) {
  server.app.bsky.feed.getFeedSkeleton(async ({ params }) => {
    const feedUri = new AtUri(params.feed);
    const algo = algos[feedUri.rkey];
    if (
      feedUri.hostname !== ctx.cfg.publisherDid ||
      feedUri.collection !== 'app.bsky.feed.generator' ||
      !algo
    ) {
      throw new InvalidRequestError('Unsupported algorithm', 'UnsupportedAlgorithm');
    }

    const body = await algo(ctx, params);
    return {
      encoding: 'application/json',
      body: body,
    };
  });
}
