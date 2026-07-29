# en-connect クーポンアプリ

宿泊客限定で、伊東エリアの提携店舗クーポンを利用できるWebアプリです。

## 仕組み

- 予約確定時に、宿スタッフが管理画面（`/admin`）から客ごとに一意のURL（`/c/[token]`）を発行する
- 客はそのURLを開くと、利用できる提携店舗の一覧とクーポン内容が表示される
- 店舗データはNotionの「Stores」データベースで管理する（`Active`にチェックが入った店舗のみ表示）
- 来店時、店舗スタッフが客の画面上で「来店済みにする」を押すと、そのクーポンは使用済みになり以後使えなくなる

## セットアップ

```bash
npm install
cp .env.example .env
```

`.env` に以下を設定する。

| 変数 | 説明 |
| --- | --- |
| `DATABASE_URL` | Postgresの接続文字列（[Neon](https://neon.tech/)想定。VercelにNeon連携を追加すると自動発行される） |
| `ADMIN_PASSWORD` | 管理画面（`/admin`）のログインパスワード |
| `ADMIN_SESSION_SECRET` | セッション署名用のランダムな文字列（`openssl rand -hex 32` などで生成） |
| `NOTION_TOKEN` | Notion Integrationのトークン（[notion.so/my-integrations](https://www.notion.so/my-integrations)で発行） |
| `NOTION_STORES_DATABASE_ID` | 店舗一覧を管理するNotionデータベースのID |
| `NOTION_STORES_ACTIVE_PROPERTY` | 店舗を公開状態にするチェックボックスのプロパティ名（省略時 `Active`） |

DBを初期化する（有効なPostgres接続文字列が`DATABASE_URL`に必要）。

```bash
npx prisma migrate dev
```

開発サーバーを起動する。

```bash
npm run dev
```

## Notionの「Stores」データベースの作り方

HP制作で使っているNotionワークスペースに、以下のプロパティを持つデータベースを作成する。

| プロパティ名 | 型 | 用途 |
| --- | --- | --- |
| Name（または「名前」） | タイトル | 店舗名 |
| Description（または「説明」） | テキスト | 店舗の説明 |
| Address（または「住所」） | テキスト | 住所 |
| Coupon（または「クーポン内容」） | テキスト | クーポンの内容（例: 「ソフトドリンク1杯無料」） |
| Image（または「画像」） | ファイル&メディア | 店舗画像（任意） |
| Active | チェックボックス | チェックが入っている店舗のみアプリに表示される |

作成したデータベースに、作成したIntegrationを「接続」（Connections）から追加するのを忘れないこと。データベースのURLに含まれる32桁のIDが `NOTION_STORES_DATABASE_ID`。

## 管理画面（客URLの発行）

`/admin` にアクセスし、`ADMIN_PASSWORD` でログインする。客の名前・チェックイン/アウト日（任意）を入力して「URLを発行」を押すと、一覧に専用URLが表示される。これをコピーして予約確定メールなどで客に送る。

## 客用ページ（クーポン一覧）

`/c/[token]` は各客専用のページ。利用可能な店舗とクーポン内容が並び、各店舗に「来店済みにする（店舗スタッフ操作）」ボタンがある。**このボタンは客が来店した店舗のスタッフが押す想定**（客のスマホ画面を見せてもらい、その場でスタッフが押す）。押すと確認ダイアログが出て、OKを押すとそのクーポンは使用済みになり再利用できなくなる。

## デプロイ

Vercelを想定。DBはVercel Marketplace経由の[Neon](https://vercel.com/marketplace/neon)（Postgres）を使う。

1. VercelプロジェクトにGitHubリポジトリをImport
2. Environment Variablesに `ADMIN_PASSWORD` `ADMIN_SESSION_SECRET` を設定（Notion関連は後回しでも可、未設定だと店舗一覧の取得だけエラー表示になる）
3. デプロイ後、プロジェクトの「Storage」タブから「Neon」を追加（無料プランでOK）→ `DATABASE_URL` が自動で環境変数に追加される
4. ローカルから `vercel env pull` などでその接続文字列を取得し、`npx prisma migrate deploy` を実行してテーブルを作成する
5. 再デプロイして完了
