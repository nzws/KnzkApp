/**
 * インスタンス仕様設定ファイル
 * limit: 文字数
 * glitch_soc: Glitch-socインスタンスか
 * bbcode: BBCode (元: now.kibousoft.co.jp) 対応か
 * markdown: Markdown (元: kirishima.cloud) 対応か
 * enquete: アンケート(元: friends.nico) 対応か
 * enquete_duration: アンケートの期間設定 (元: knzk.me) 対応か
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
        bbcode: true,
        markdown: true
    },
    "friends.nico": {
        limit: 500,
        enquete: true
    }
};