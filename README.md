<div align="center">
  <a href="https://knzkapp.nzws.me">
    <img src="res/android/icon/xxxhdpi.png" alt="Knzk.me Logo" width=100>
  </a>

  <h1 align="center">
    KnzkApp
  </h1>

  <p align="center">
    A mastodon client for customized instances.
  </p>

  <p align="center">
    <b>Get it on:</b>
    <a href="https://play.google.com/store/apps/details?id=net.knzkdev.app"><b>PlayStore</b></a>
    ·
    <a href="https://itunes.apple.com/jp/app/knzkapp/id1296825434"><b>AppStore</b></a>
  </p>

  <p align="center">
    Sponsored by <a href="http://kibousoft.co.jp/">Kibousoft LLC</a>.
  </p>

  <p align="center">
    <a href="http://makeapullrequest.com">
    <img src="https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=for-the-badge">
  </p>

  <p align="center">
    <a href="https://github.com/KnzkDev/KnzkApp/blob/master/LICENSE">
    <img src="https://img.shields.io/badge/license-knzkapp%20license-blue.svg?style=for-the-badge">
  </p>
</div>

## 特徴
Mastodonの基本機能はもちろん、いくつかのインスタンスの追加機能に対応したアプリです。

### 対応機能
- [Glitch-soc](https://github.com/glitch-soc/mastodon/) Features
  - Local-only
  - Doodle
  - DM Timeline
  - Bookmark
  - etc...
- BBCode (from [now.kibousoft.co.jp](https://now.kibousoft.co.jp/))
- Enquete (from [friends.nico](https://friends.nico/))
- Markdown (from [kirishima.cloud](https://kirishima.cloud/))
- 読み仮名 (from [theboss.tech](https://theboss.tech/))

*これらのインスタンスより機能を輸入したインスタンスでも使用可能です。KnzkAppを使用した際にあなたのインスタンスで有効化する場合は`www/config/instance.js`にプルリクエストを送信してください。(分からなければ[@y@knzk.me](https://knzk.me/@y)まで。)

また、ある程度簡単な内容の独自機能であれば(時間があれば)対応しますので、気軽にご相談下さい。

###### テーマ(着せ替え的なやつ)ももしかしたらできるかもしれないのでアイデア下さい。

## 注意とか
- masterは結構バグ多かったりするので非推奨です。
- ビルドにはMonaca Pro以上のアカウントが必要です。
- `www/config/config.sample.js`をコピーして`www/config/config.js`を生成し、sentry.ioのトークン、[KnzkApp Notification](https://github.com/yuzulabo/tusky-api)のセンターサーバーURLと認証キーを入力してください。
> なお、is_debugをtrueにしてそれぞれ適当な文字列にしておけばデバッグ中は不要です。
- Firebaseで生成した`google-services.json` / `GoogleService-Info.plist`をルートディレクトリに設置して下さい。

## License
[KnzkApp License (Restricted BSD License)](https://github.com/KnzkDev/KnzkApp/blob/master/LICENSE)

その他: https://github.com/KnzkDev/KnzkApp/wiki/License

## Special Thanks ✨
- [あんのたん @annotunzdy](https://knzk.me/@annotunzdy)
- [神崎丼ロゴ(旧): ネイティオ @twotwo](https://knzk.me/@twotwo)
