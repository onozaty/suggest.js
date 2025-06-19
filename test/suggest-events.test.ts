import {
  setupSuggestLocal,
  waitForSuggestBlur,
  waitForSuggestUpdate,
} from "./utils";

const DEFAULT_CANDIDATE_LIST = [
  "apple",
  "banana",
  "cherry",
  "orange",
  "elderberry",
  "pineapple",
];

describe("Suggest.Local - イベントテスト", () => {
  test("フォーカスイベントでサジェスト機能が開始される", async () => {
    const { input, suggestArea, user } = setupSuggestLocal(
      DEFAULT_CANDIDATE_LIST,
    );

    await user.click(input);
    await user.clear(input);
    await user.type(input, "app");

    const suggestItems = await waitForSuggestUpdate(suggestArea);
    expect(suggestItems).toEqual(["apple", "pineapple"]);
  });

  test("キーダウンイベントで上下キー移動", async () => {
    const { input, suggestArea, user } = setupSuggestLocal(
      DEFAULT_CANDIDATE_LIST,
    );

    await user.click(input);
    await user.type(input, "ap");

    const suggestItems = await waitForSuggestUpdate(suggestArea);

    // サジェストが表示されていることを確認
    expect(suggestItems).toEqual(["apple", "pineapple"]);

    // 下矢印キーを押してアクティブ候補を選択
    await user.keyboard("{ArrowDown}");
    expect(input.value).toBe("apple");
    expect(suggestArea.children[0].className).toBe("select");
    expect(suggestArea.children[1].className).toBe("");

    await user.keyboard("{ArrowDown}");
    expect(input.value).toBe("pineapple");
    expect(suggestArea.children[0].className).toBe("");
    expect(suggestArea.children[1].className).toBe("select");

    // 一番下の候補からさらに下矢印キーを押すと、未選択に戻る
    await user.keyboard("{ArrowDown}");
    expect(input.value).toBe("ap");
    expect(suggestArea.children[0].className).toBe("");
    expect(suggestArea.children[1].className).toBe("");

    await user.keyboard("{ArrowDown}");
    expect(input.value).toBe("apple");
    expect(suggestArea.children[0].className).toBe("select");
    expect(suggestArea.children[1].className).toBe("");

    await user.keyboard("{ArrowDown}");
    expect(input.value).toBe("pineapple");
    expect(suggestArea.children[0].className).toBe("");
    expect(suggestArea.children[1].className).toBe("select");

    // 上矢印キーで戻る
    await user.keyboard("{ArrowUp}");
    expect(input.value).toBe("apple");
    expect(suggestArea.children[0].className).toBe("select");
    expect(suggestArea.children[1].className).toBe("");
  });

  test("Enterキーで候補確定", async () => {
    const { input, suggestArea, user } = setupSuggestLocal(
      DEFAULT_CANDIDATE_LIST,
    );

    await user.click(input);
    await user.type(input, "app");

    const suggestItems = await waitForSuggestUpdate(suggestArea);
    expect(suggestItems).toEqual(["apple", "pineapple"]);

    // 下矢印キーで候補選択
    await user.keyboard("{ArrowDown}");

    // Enterキーで確定
    await user.keyboard("{Enter}");

    expect(input.value).toBe("apple");
    expect(suggestArea.style.display).toBe("none");
  });

  test("ESCキーでキャンセル", async () => {
    const { input, suggestArea, user } = setupSuggestLocal(
      DEFAULT_CANDIDATE_LIST,
    );

    const originalValue = "app";
    await user.click(input);
    await user.type(input, originalValue);

    const suggestItems = await waitForSuggestUpdate(suggestArea);
    expect(suggestItems).toEqual(["apple", "pineapple"]);

    // 候補を選択
    await user.keyboard("{ArrowDown}");

    // ESCキーでキャンセル
    await user.keyboard("{Escape}");

    expect(input.value).toBe(originalValue);
    expect(suggestArea.style.display).toBe("none");
  });

  test("マウスクリックで候補選択", async () => {
    const { input, suggestArea, user } = setupSuggestLocal(
      DEFAULT_CANDIDATE_LIST,
    );

    await user.click(input);
    await user.type(input, "a");

    const suggestItems = await waitForSuggestUpdate(suggestArea);
    expect(suggestItems).toEqual(["apple", "banana", "orange", "pineapple"]);

    // 最初の候補をクリック
    const firstSuggestion = suggestArea.children[0];
    await user.click(firstSuggestion);

    expect(input.value).toBe("apple");
    expect(suggestArea.style.display).toBe("none");
  });

  test("マウスアウトでハイライト/ハイライト解除", async () => {
    const { input, suggestArea, user } = setupSuggestLocal(
      DEFAULT_CANDIDATE_LIST,
    );

    await user.click(input);
    await user.type(input, "a");
    await waitForSuggestUpdate(suggestArea);

    const firstSuggestion = suggestArea.children[0];

    // マウスオーバー
    await user.hover(firstSuggestion);
    expect(firstSuggestion.className).toBe("over");

    // マウスアウト（他の要素にhoverして外す）
    await user.hover(input);
    expect(firstSuggestion.className).toBe("");
  });

  test("ブラーイベントでサジェスト非表示", async () => {
    const { input, suggestArea, user } = setupSuggestLocal(
      DEFAULT_CANDIDATE_LIST,
    );

    await user.click(input);
    await user.type(input, "app");

    // サジェストが表示されていることを確認
    const suggestItems = await waitForSuggestUpdate(suggestArea);
    expect(suggestItems).toEqual(["apple", "pineapple"]);

    // ブラーイベント発行
    input.blur();

    await waitForSuggestBlur();

    // 非表示であることを確認
    expect(suggestArea.style.display).toBe("none");
  });

  test("オプション: インターバル", async () => {
    const { input, suggestArea, user } = setupSuggestLocal(
      DEFAULT_CANDIDATE_LIST,
      { interval: 100 }, // インターバルを100msに設定
    );

    await user.click(input);
    await user.type(input, "banana");

    const suggestItems = await waitForSuggestUpdate(suggestArea, 100);
    expect(suggestItems).toEqual(["banana"]);
  });

  test("オプション: 表示件数", async () => {
    const { input, suggestArea, user } = setupSuggestLocal(
      DEFAULT_CANDIDATE_LIST,
      { dispMax: 2 },
    );

    await user.click(input);
    await user.type(input, "a");

    const suggestItems = await waitForSuggestUpdate(suggestArea);
    expect(suggestItems).toEqual(["apple", "banana"]); // 2件のみ表示される
  });

  test("オプション: リストタグ名", async () => {
    const { input, suggestArea, user } = setupSuggestLocal(
      DEFAULT_CANDIDATE_LIST,
      { listTagName: "span" },
    );

    await user.click(input);
    await user.type(input, "app");

    const suggestItems = await waitForSuggestUpdate(suggestArea);
    expect(suggestItems).toEqual(["apple", "pineapple"]);

    expect(suggestArea.innerHTML).toBe(
      "<span>apple</span><span>pineapple</span>",
    );
  });

  test("オプション: プレフィックス", async () => {
    const { input, suggestArea, user } = setupSuggestLocal(
      DEFAULT_CANDIDATE_LIST,
      { prefix: true },
    );

    await user.click(input);
    await user.type(input, "app");

    // プレフィックス検索なので 'pineapple' は表示されない
    const suggestItems = await waitForSuggestUpdate(suggestArea);
    expect(suggestItems).toEqual(["apple"]);
  });

  test("オプション: 大文字小文字を区別", async () => {
    const { input, suggestArea, user } = setupSuggestLocal(
      ["Apple", "Pineapple"],
      { ignoreCase: false },
    );

    await user.click(input);
    await user.type(input, "App");

    // 大文字小文字が区別されるので 'Pineapple' は表示されない
    const suggestItems = await waitForSuggestUpdate(suggestArea);
    expect(suggestItems).toEqual(["Apple"]);
  });

  test("オプション: ハイライト", async () => {
    const { input, suggestArea, user } = setupSuggestLocal(
      DEFAULT_CANDIDATE_LIST,
      { highlight: true },
    );

    await user.click(input);
    await user.type(input, "app");

    const suggestItems = await waitForSuggestUpdate(suggestArea);
    expect(suggestItems).toEqual(["apple", "pineapple"]);

    // ハイライト表示されることを確認
    expect(suggestArea.innerHTML).toBe(
      "<div><strong>app</strong>le</div><div>pine<strong>app</strong>le</div>",
    );
  });

  test("オプション: 全件表示", async () => {
    const { input, suggestArea, user } = setupSuggestLocal(
      DEFAULT_CANDIDATE_LIST,
      { dispAllKey: true },
    );

    await user.click(input);

    // この時点では0件
    const suggestItems1 = await waitForSuggestUpdate(suggestArea);
    expect(suggestItems1).toEqual([]);

    // Ctrl+下矢印キーを押して全件
    await user.keyboard("{Control>}{ArrowDown}{/Control}");

    const suggestItems2 = await waitForSuggestUpdate(suggestArea);
    expect(suggestItems2).toEqual(DEFAULT_CANDIDATE_LIST); // 全件表示される
  });

  test("オプション: classMouseOver", async () => {
    const { input, suggestArea, user } = setupSuggestLocal(
      DEFAULT_CANDIDATE_LIST,
      { classMouseOver: "overX" },
    );

    await user.click(input);
    await user.type(input, "a");
    await waitForSuggestUpdate(suggestArea);

    const firstSuggestion = suggestArea.children[0];

    // マウスオーバー
    await user.hover(firstSuggestion);
    expect(firstSuggestion.className).toBe("overX");

    // マウスアウト（他の要素にhoverして外す）
    await user.hover(input);
    expect(firstSuggestion.className).toBe("");
  });

  test("オプション: classSelect", async () => {
    const { input, suggestArea, user } = setupSuggestLocal(
      DEFAULT_CANDIDATE_LIST,
      { classSelect: "selectX" },
    );

    await user.click(input);
    await user.type(input, "rry");

    const suggestItems = await waitForSuggestUpdate(suggestArea);

    // サジェストが表示されていることを確認
    expect(suggestItems).toEqual(["cherry", "elderberry"]);

    // 下矢印キーを押してアクティブ候補を選択
    await user.keyboard("{ArrowDown}");

    expect(input.value).toBe("cherry");
    expect(suggestArea.children[0].className).toBe("selectX");
  });
});
