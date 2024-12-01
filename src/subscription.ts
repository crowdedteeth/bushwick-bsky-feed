import {
  OutputSchema as RepoEvent,
  isCommit,
} from './lexicon/types/com/atproto/sync/subscribeRepos'
import { FirehoseSubscriptionBase, getOpsByType } from './util/subscription'

export class FirehoseSubscription extends FirehoseSubscriptionBase {
  async handleEvent(evt: RepoEvent) {
    if (!isCommit(evt)) return

    const ops = await getOpsByType(evt)

    const postsToCreate = ops.posts.creates
      .filter((create) => {
        const include = create.record.facets?.some(facet => facet.features.some(feature => (feature.tag as string)?.toLowerCase().includes('bushwickfeed')))
        if (include) {
          console.log("========================================");
          console.log(create.record.text.replaceAll("\n", ""));
          console.log("createdAt: ", create.record.createdAt);
          console.log("========================================\n\n");
        }
        return include
      })
      .map((create) => {
        return {
          uri: create.uri,
          cid: create.cid,
          indexedAt: new Date().toISOString(),
        }
      })

    if (postsToCreate.length > 0) {
      await this.db
        .insertInto('post')
        .values(postsToCreate)
        .onConflict((oc) => oc.doNothing())
        .execute()
    }
  }
}
