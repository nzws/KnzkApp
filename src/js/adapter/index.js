import mastodon_config from './mastodon/config';
import mastodon_auth from './mastodon/auth';
import mastodon_timeline from './mastodon/timeline';

export default {
  mastodon: {
    config: mastodon_config,
    auth: mastodon_auth,
    timeline: mastodon_timeline
  }
};
