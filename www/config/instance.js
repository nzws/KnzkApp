/**
 * インスタンス仕様設定ファイル
 * limit: character-limit [Required]
 * glitch_soc: Is Glitch-soc server
 * bbcode: Is supported BBCode (from now.kibousoft.co.jp)
 * markdown: Is supported Markdown (from kirishima.cloud)
 * enquete: Is supported enquete (from friends.nico)
 * enquete_duration: アンケートの期間設定 (from knzk.me)
 * yomigana: Is supported yomigana (from theboss.tech)
 * privacy_limited: Is supported limited mode (from itabashi.0j0.jp)
 */

var instance_config = {
  'knzk.me': {
    limit: 500,
  },
  'mastodon.cloud': {
    limit: 500,
  },
  'now.kibousoft.co.jp': {
    limit: 4096,
    bbcode: true,
  },
  'kirishima.cloud': {
    limit: 6229,
    bbcode: true,
    markdown: true,
    glitch_soc: true,
  },
  'friends.nico': {
    limit: 500,
    enquete: true,
  },
  'theboss.tech': {
    limit: 1000,
    yomigana: true,
  },
  'itabashi.0j0.jp': {
    limit: 1024,
    privacy_limited: true,
  },
};
