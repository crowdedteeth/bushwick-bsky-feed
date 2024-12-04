import { Record as PostRecord } from './lexicon/types/app/bsky/feed/post';
import {
  OutputSchema as RepoEvent,
  isCommit,
} from './lexicon/types/com/atproto/sync/subscribeRepos';
import { CreateOp, FirehoseSubscriptionBase, getOpsByType } from './util/subscription';
import * as brooklyn from './algos/brooklyn';
import * as bushwick from './algos/bushwick';
import { algos } from './algos';
import { Post } from './db/schema';

export class FirehoseSubscription extends FirehoseSubscriptionBase {
  async handleEvent(evt: RepoEvent) {
    if (!isCommit(evt)) return;

    const ops = await getOpsByType(evt);

    const postsToCreate = ops.posts.creates
      .reduce((acc, create) => {
        const feeds = create.record.facets
          ?.flatMap((facet) =>
            facet.features
              .filter((feature) => !!feature.tag)
              .map((feature) => feature.tag as string),
          )
          .filter((tag) => !!tagsToFind[tag])
          .map((tag) => tagsToFind[tag]);
        if (feeds && feeds.length) {
          acc.push({ create, feeds });
        }
        return acc;
      }, [] as { create: CreateOp<PostRecord>; feeds: (keyof typeof algos)[] }[])
      .flatMap(({ create, feeds }) =>
        feeds.map(
          (feed) =>
            ({
              uri: create.uri,
              cid: create.cid,
              indexedAt: new Date().toISOString(),
              feed,
            } as Post),
        ),
      );
    if (postsToCreate.length > 0) {
      await this.db
        .insertInto('post')
        .values(postsToCreate)
        .onConflict((oc) => oc.doNothing())
        .execute();
    }
  }
}

const tagsToFind: Record<string, keyof typeof algos> = {
  brooklynfeed: brooklyn.shortname,
  bushwickfeed: bushwick.shortname,
};
