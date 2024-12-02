import {render} from 'preact';

import bskyLogo from './assets/bsky.png';
import firehose from './assets/firehose.svg';
import {FeedIcon} from './components/feed_icon';
import './style.css';

const FEED_LINK =
  'https://bsky.app/profile/crowdedteeth.bsky.social/feed/bushwick';
const USER_LINK = 'https://bsky.app/profile/crowdedteeth.bsky.social';

/** */
export function App() {
  return (
    <div>
      <div class="bsky-logo-container">
        <a href={FEED_LINK}>
          <img src={bskyLogo} height="48" />
        </a>
      </div>
      <div id="feed-info-container">
        <div id="feed-icon-container">
          <FeedIcon />
        </div>
        <div class="feed-description">
          <h1>
            🌆⋆.˚𖤓˚⟡&nbsp;&nbsp;&nbsp;Bushwick,
            Brooklyn.&nbsp;&nbsp;&nbsp;⟡˚⏾˚.⋆🌃
          </h1>
          <p>Curated feed for Bushwick news, events, culture & more.</p>
          <p>#bushwickfeed</p>
        </div>
      </div>
      <br />
      <br />
      <Philosophy />
      <br />
      <Algorithm />
      <br />
      <br />
      <h1>FAQ</h1>
      <h2>
        Why didn't my <code>#bushwickfeed</code>
        -tagged post show up in the feed?
      </h2>
      <p>
        There appear to be some issues with the Bluesky firehose or my (see:{' '}
        <a target="_blank" href={USER_LINK}>
          @crowdedteeth
        </a>
        ) server occasionally missing some posts. For now, the easiest thing may
        be to delete the tag and post it again.
      </p>
    </div>
  );
}

render(<App />, document.getElementById('app'));

function Philosophy() {
  return (
    <div>
      <h1>Philosophy</h1>
      <p>
        This feed is curated with an eye toward community building and
        engagement. For example, posts which promote local events,
        community-owned businesses, or Bushwick-related news are of principal
        interest. Secondarily, we aim to cultivate conversation among members of
        our community by highlighting "hot"/"trending" posts pertaining to any
        aspect of Bushwick's diverse culture.
        <br />
        <br />
        Practically, this means that posts are often added ad hoc by replying
        with the&nbsp;<code>#bushwickfeed</code>&nbsp;tag when they meet the
        criteria. Subscribers of the feed are encouraged to use this tag to
        promote their own posts as well as applicable content they encounter in
        the wild!
        <br />
        <br />
        Certain fixtures of the Bushwick community (e.g., Bushwick Daily) are
        allowlisted to include all their posts in the feed. If you have a
        suggestion for a new allowlisted account, please suggest it below!
        <br />
        <br />
        Do reach out to{' '}
        <a target="_blank" href={USER_LINK}>
          @crowdedteeth
        </a>{' '}
        with any suggestions or concerns :)
      </p>
    </div>
  );
}

function Algorithm() {
  return (
    <div>
      <h1>Algorithm</h1>
      <p>
        In the interest of clarity and transparency, the algorithm used by this
        feed's generator is reproduced diagrammatically below.
        <br />
        <br />
        The source code for this feed is also available on GitHub!&nbsp;
        <code>
          <a
            target="_blank"
            href="https://github.com/crowdedteeth/bushwick-bsky-feed">
            bushwick-bsky-feed
          </a>
        </code>
        &nbsp;PRs are welcome :)
        <br />
        <br />
        <br />
      </p>
      <div class="algo-viz-container">
        <img id="firehose" src={firehose} height="48" />
        <div class="algo-linefeed">
          <code style={{background: '#db7d09'}}>WIP</code>&nbsp;
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
          <code>#bushwickfeed</code>
        </div>
        <div class="algo-linefeed">
          <code style={{background: '#db7d09'}}>WIP</code>&nbsp;
          <code>Accept</code>
          &nbsp;any&nbsp;
          <a>post</a>
          &nbsp;with&nbsp;
          <i style={{opacity: '0.6'}}>[TBD for "hot"/"trending" criteria]</i>
        </div>
        <div class="algo-linefeed" style={{visibility: 'hidden'}} />
        <div class="feed-container">
          <FeedIcon />
        </div>
      </div>
    </div>
  );
}

function UserCardList(props) {
  const {users} = props;

  return (
    <div class="user-card-list">
      {users.map((user, index) => (
        <UserCard
          user={user}
          style={{left: `${48 * (users.length - index - 1)}px`}}
        />
      ))}
    </div>
  );
}

function UserCard(props) {
  const {
    user: {name, icon, handle},
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

function resizeFeedIconContainer() {
  const feedInfoContainer = document.getElementById('feed-info-container');
  const feedIconContainer = document.getElementById('feed-icon-container');

  const size = feedInfoContainer.offsetHeight - 64;
  feedIconContainer.style.width = `${size}px`;
  feedIconContainer.style.height = `${size}px`;
}

document.addEventListener(
  'DOMContentLoaded',
  () => void resizeFeedIconContainer(),
);
