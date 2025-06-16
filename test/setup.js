// @ts-check
// テスト用のセットアップファイル
import "@testing-library/jest-dom";
import { readFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// suggest.jsの内容を読み込み
const suggestJs = readFileSync(join(__dirname, "../src/suggest.js"), "utf-8");

// suggest.jsを実行
window.eval(suggestJs);
