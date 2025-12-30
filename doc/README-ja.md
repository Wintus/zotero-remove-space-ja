# Zotero Remove Space (Japanese)

[![zotero target version](https://img.shields.io/badge/Zotero-7-green?style=flat-square&logo=zotero&logoColor=CC2936)](https://www.zotero.org)
[![Using Zotero Plugin Template](https://img.shields.io/badge/Using-Zotero%20Plugin%20Template-blue?style=flat-square&logo=github)](https://github.com/windingwind/zotero-plugin-template)

PDFアノテーションから不要なスペースを削除するZotero 7プラグインです。特に日本語テキストに対応しています。

[English](../README.md) | [日本語](README-ja.md)

## 動機

Zotero PDFリーダーでテキストを選択してハイライトすると、生成されるアノテーションに不要なスペースが含まれることがよくあります。特に日本語のテキストでは、単語の区切りにスペースを使わないため問題になります。このプラグインは、ボタン一つで不要なスペースを自動的に削除します。

## 機能

- **ワンクリックでスペース削除**: PDFリーダーのサイドバーにある各アノテーションに「スペースを削除」ボタンを追加
- **日本語テキストのスマート検出**: Unicode script propertiesを使用して日本語文字（漢字、ひらがな、カタカナ）を識別
- **正当なスペースは保持**: 日本語文字間のスペースのみを削除し、日本語と英数字間のスペースは保持

## インストール

1. [Releasesページ](https://github.com/Wintus/zotero-remove-space-ja/releases)から最新の`.xpi`ファイルをダウンロード
2. Zoteroでツール → アドオンを開く
3. 歯車アイコンをクリックし、「ファイルからアドオンをインストール...」を選択
4. ダウンロードした`.xpi`ファイルを選択

## 使い方

1. ZoteroリーダーでPDFを開く
2. ハイライトアノテーションを作成または選択
3. サイドバーで不要なスペースを含むアノテーションを見つける
4. アノテーションヘッダーに表示される「スペースを削除」ボタンをクリック
5. 日本語文字間のスペースが自動的に削除される

## 開発

```bash
# 依存関係のインストール
npm install

# ホットリロード付き開発サーバーを起動
npm start

# 本番用ビルド
npm run build

# テスト実行
npm run test
```

詳細な開発ドキュメントは[CLAUDE.md](../CLAUDE.md)を参照してください。

## 技術詳細

プラグインはUnicode script property escapesを使用して日本語文字を正確に検出します:

```typescript
const pattern =
  /(?<=[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}])\s+(?=[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}])/gu;
```

このパターンは:

- `\p{Script=Han}` - 漢字にマッチ
- `\p{Script=Hiragana}` - ひらがなにマッチ
- `\p{Script=Katakana}` - カタカナにマッチ
- 後読みと先読みを使用して、日本語文字に囲まれたスペースのみを削除

## 参考

- [Zotero Plugin Template](https://github.com/windingwind/zotero-plugin-template) - ベーステンプレート
- [zotero-plugin-toolkit](https://github.com/windingwind/zotero-plugin-toolkit) - 開発ツールキット
- [zotero-pdf-translate](https://github.com/windingwind/zotero-pdf-translate) - リファレンス実装

## ライセンス

AGPL-3.0
