# 業務報告アプリ

日々の業務内容を記録・共有するための日報管理アプリです。

## 技術スタック

| 役割 | 技術 |
|------|------|
| フレームワーク | Vite + React + TypeScript |
| スタイリング | Tailwind CSS |
| データベース / 認証 | Supabase |
| ソース管理 | GitHub |
| デプロイ | Vercel |

## 主な機能

- **認証** - メール/パスワードでのサインアップ・ログイン
- **日報 CRUD** - 作成・閲覧・編集・削除
- **フォーム項目** - タイトル・日付・業務内容・作業時間・カテゴリ・タグ・所感・翌日の予定
- **一覧・検索・フィルタ** - キーワード検索、カテゴリ絞り込み、日付範囲フィルタ
- **統計ダッシュボード** - 総日報数・今月・今週の日報数表示

## セットアップ

### 1. Supabase の準備

1. [Supabase](https://supabase.com) でプロジェクトを作成
2. SQL Editor で `supabase/schema.sql` を実行してテーブルを作成
3. Project Settings > API から URL と anon key をコピー

### 2. 環境変数の設定

```bash
cp .env.example .env
```

`.env` を編集して Supabase の情報を入力:

```
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 3. 開発サーバーの起動

```bash
npm install
npm run dev
```

## Vercel へのデプロイ

1. GitHub にプッシュ
2. [Vercel](https://vercel.com) でリポジトリをインポート
3. Environment Variables に `VITE_SUPABASE_URL` と `VITE_SUPABASE_ANON_KEY` を設定
4. デプロイ実行

## プロジェクト構造

```
src/
├── components/
│   ├── layout/      # Header等レイアウト
│   └── reports/     # 日報カード・フォーム
├── hooks/           # useAuth / useReports / useCategories
├── lib/             # Supabase クライアント
├── pages/           # ページコンポーネント
└── types/           # TypeScript 型定義
supabase/
└── schema.sql       # DB スキーマ・RLS ポリシー
```
