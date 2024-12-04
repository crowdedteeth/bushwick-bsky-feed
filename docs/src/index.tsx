import { render } from 'preact';

import bskyLogo from './assets/bsky.png';
import firehose from './assets/firehose.svg';
import { FeedIcon } from './components/feed_icon';
import { feeds as bskyFeeds } from '../../scripts/publishFeedGen';
import './style.css';

const USER_LINK = 'https://bsky.app/profile/crowdedteeth.bsky.social';

const feeds: Record<keyof typeof bskyFeeds, Record<string, string>> = {
  brooklyn: {
    headline: '🌆⋆.˚𖤓˚⟡&nbsp;&nbsp;&nbsp;Brooklyn, NY.&nbsp;&nbsp;&nbsp;⟡˚⏾˚.⋆🌃',
    description: 'Curated feed for Brooklyn news, events, culture & more.\n#brooklynfeed',
    name: 'Brooklyn',
    tag: '#brooklynfeed',
    link: 'https://bsky.app/profile/crowdedteeth.bsky.social/feed/bushwick',
  },
  bushwick: {
    headline: '🌆⋆.˚𖤓˚⟡&nbsp;&nbsp;&nbsp;Bushwick, Brooklyn.&nbsp;&nbsp;&nbsp;⟡˚⏾˚.⋆🌃',
    description: 'Curated feed for Bushwick news, events, culture & more.\n#bushwickfeed',
    name: 'Bushwick',
    tag: '#bushwickfeed',
    fixtureExample: 'Bushwick Daily',
    link: 'https://bsky.app/profile/crowdedteeth.bsky.social/feed/brooklyn',
  },
};

const host = window.location.host;
const feedName = host.includes('localhost') ? 'brooklyn' : host.substring(0, host.indexOf('.'));
if (!Object.keys(feeds).includes(feedName)) {
  throw new Error('Not a valid feed name');
}
const feed = feeds[feedName as keyof typeof feeds];

export function App(props) {
  const { feed } = props;
  return (
    <div>
      <div class="bsky-logo-container">
        <a href={feed.link}>
          <img
            src={bskyLogo}
            height="48"
          />
        </a>
      </div>
      <a
        target="_blank"
        href={feed.link}>
        <div class="feed-info-container">
          <div class="feed-icon-container">
            <FeedIcon />
          </div>
          <div class="feed-description">
            <h1 dangerouslySetInnerHTML={{ __html: feed.headline }}></h1>
            {feed.description.split('\n').map((line) => (
              <p>{line}</p>
            ))}
          </div>
        </div>
      </a>
      <br />
      <br />
      <Philosophy feed={feed} />
      <br />
      <Algorithm feed={feed} />
      <br />
      <br />
      <FAQ feed={feed} />
    </div>
  );
}

function Philosophy(props) {
  const { feed } = props;

  return (
    <>
      <h1>Philosophy</h1>
      <p>
        This feed is curated with an eye toward community building and real-world engagement. For
        example, posts which promote local events, community-owned businesses, or {feed.name}
        -related news are of principal interest. Secondarily, we aim to cultivate conversation among
        members of our community by highlighting "hot"/"trending" posts pertaining to any aspect of{' '}
        {feed.name}'s diverse culture.
        <br />
        <br />
        Practically, this means that posts are often added ad hoc by replying with the&nbsp;
        <code>{feed.tag}</code>&nbsp;tag when they meet the criteria. Subscribers of the feed are
        encouraged to use this tag to promote their own posts as well as applicable content they
        encounter in the wild!
        <br />
        <br />
        Certain fixtures of the {feed.name} community{' '}
        {feed.fixtureExample ? `(e.g., ${feed.fixtureExample})` : ''} are allowlisted to include all
        their posts in the feed. If you have a suggestion for a new allowlisted account, please
        suggest it below!
        <br />
        <br />
        Do reach out to{' '}
        <a
          target="_blank"
          href={USER_LINK}>
          @crowdedteeth
        </a>{' '}
        with any suggestions or concerns :)
      </p>
    </>
  );
}

function Algorithm(props) {
  const { feed } = props;

  return (
    <>
      <h1>Algorithm</h1>
      <p>
        In the interest of clarity and transparency, the algorithm used by this feed's generator is
        reproduced diagrammatically below.
        <br />
        <br />
        The source code for this feed is also available on GitHub!&nbsp;
        <code>
          <a
            target="_blank"
            href="https://github.com/crowdedteeth/bushwick-bsky-feed">
            crowdedteeth-bsky-feeds
          </a>
        </code>
        &nbsp;PRs are welcome :)
        <br />
        <br />
        <br />
      </p>
      <div class="algo-viz-container">
        <img
          id="firehose"
          src={firehose}
          height="48"
        />
        <div class="algo-linefeed">
          <code style={{ background: '#db7d09' }}>WIP</code>&nbsp;
          <code>Accept</code>
          &nbsp;any&nbsp;
          <a>post</a>
          &nbsp;with&nbsp;
          <a>author</a>
          &nbsp;in&nbsp;&nbsp;&nbsp;
          <UserCardList users={[{}, {}, {}, {}]} />
        </div>
        <div class="algo-linefeed">
          <code>Accept</code>
          &nbsp;any&nbsp;
          <a>post</a>
          &nbsp;with&nbsp;
          <a>tag</a>
          &nbsp;equal to&nbsp;
          <code>{feed.tag}</code>
        </div>
        <div class="algo-linefeed">
          <code style={{ background: '#db7d09' }}>WIP</code>&nbsp;
          <code>Accept</code>
          &nbsp;any&nbsp;
          <a>post</a>
          &nbsp;with&nbsp;
          <i style={{ opacity: '0.6' }}>[TBD for "hot"/"trending" criteria]</i>
        </div>
        <div
          class="algo-linefeed"
          style={{ visibility: 'hidden' }}
        />
        <div class="feed-container">
          <FeedIcon />
        </div>
      </div>
    </>
  );
}

function FAQ(props) {
  const { feed } = props;

  return (
    <>
      <h1>FAQ</h1>
      <h2>
        Why didn't my <code>{feed.tag}</code>
        -tagged post show up in the feed?
      </h2>
      <p>
        There appear to be some issues with the Bluesky firehose or my (see:{' '}
        <a
          target="_blank"
          href={USER_LINK}>
          @crowdedteeth
        </a>
        ) server occasionally missing some posts. For now, the easiest thing may be to delete the
        tag and post it again.
      </p>
    </>
  );
}

function UserCardList(props) {
  const { users } = props;

  return (
    <div class="user-card-list">
      {users.map((user, index) => (
        <UserCard
          user={user}
          style={{ left: `${48 * (users.length - index - 1)}px` }}
        />
      ))}
    </div>
  );
}

function UserCard(props) {
  const {
    user: { name, icon, handle },
    style,
  } = props;

  return (
    <div
      class={`user-card ${name && icon && handle ? '' : 'user-card-skeleton'}`}
      style={style}>
      <div class="user-card-icon">
        <img src={icon} />
      </div>
      <div class="user-card-info">
        <span>{name}</span>
        <span>{handle}</span>
      </div>
    </div>
  );
}

render(<App feed={feed} />, document.getElementById('app'));
