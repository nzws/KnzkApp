/**
 * インスタンス仕様設定ファイル
 * limit: 文字数 [必須]
 * glitch_soc: Glitch-socインスタンスか
 * bbcode: BBCode (from now.kibousoft.co.jp) 対応か
 * markdown: Markdown (from kirishima.cloud) 対応か
 * enquete: アンケート(from friends.nico) 対応か
 * enquete_duration: アンケートの期間設定 (from knzk.me) 対応か
 * yomigana: 読み仮名 (from theboss.tech) 対応か
 */

var instance_config = {
  "knzk.me": {
    limit: 5000,
    glitch_soc: true
  },
  "now.kibousoft.co.jp": {
    limit: 4096,
    bbcode: true
  },
  "kirishima.cloud": {
    limit: 6229,
    bbcode: true
  },
  "friends.nico": {
    limit: 500,
    enquete: true
  },
  "theboss.tech": {
    limit: 1000,
    yomigana: true
  }
};
