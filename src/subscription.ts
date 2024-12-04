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
          .filter((tag) => !!TAGS_TO_FIND[tag])
          .map((tag) => TAGS_TO_FIND[tag]);
        if (feeds && feeds.length) {
          acc.push({ create, feeds });
        }
        return acc;
      }, [] as { create: CreateOp<PostRecord>; feeds: (keyof typeof algos)[] }[])
      .flatMap(({ create, feeds }) => {
        let uri = create.uri;
        let cid = create.cid;
        const textWithoutTags = Object.keys(TAGS_TO_FIND)
          .reduce((text, tag) => text.replaceAll(`#${tag}`, ''), create.record.text)
          .trim();
        if ((!textWithoutTags || GO_TO_PARENT_REGEX.test(textWithoutTags)) && create.record.reply) {
          uri = create.record.reply.parent.uri;
          cid = create.record.reply.parent.cid;
        }
        return feeds.map(
          (feed) =>
            ({
              uri,
              cid,
              indexedAt: new Date().toISOString(),
              feed,
            } as Post),
        );
      });
    if (postsToCreate.length > 0) {
      await this.db
        .insertInto('post')
        .values(postsToCreate)
        .onConflict((oc) => oc.doNothing())
        .execute();
    }
  }
}

const GO_TO_PARENT_REGEX = /(https:\/\/)?bsky.app\/profile\//;

const TAGS_TO_FIND: Record<string, keyof typeof algos> = {
  brooklynfeed: brooklyn.shortname,
  bushwickfeed: bushwick.shortname,
};
