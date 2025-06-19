import { setupSuggestLocalMulti, waitForSuggestUpdate } from "./utils";

const DEFAULT_CANDIDATE_LIST = [
  "apple",
  "banana",
  "cherry",
  "orange",
  "elderberry",
  "pineapple",
];

describe("Suggest.LocalMulti - イベントテスト", () => {
  test("複数入力で順次サジェスト", async () => {
    const { input, suggestArea, user } = setupSuggestLocalMulti(
      DEFAULT_CANDIDATE_LIST,
    );

    // 初期状態では候補は表示されない
    await user.click(input);
    const suggestItems = await waitForSuggestUpdate(suggestArea);
    expect(suggestItems).toEqual([]);

    // 入力を開始
    await user.type(input, "app");
    const suggestItems1 = await waitForSuggestUpdate(suggestArea);
    expect(suggestItems1).toEqual(["apple", "pineapple"]);

    // 下矢印キーを押してアクティブ候補を選択
    await user.keyboard("{ArrowDown}");
    expect(input.value).toBe("apple");
    expect(suggestArea.children[0].className).toBe("select");
    expect(suggestArea.children[1].className).toBe("");

    await user.keyboard("{ArrowDown}");
    expect(input.value).toBe("pineapple");
    expect(suggestArea.children[0].className).toBe("");
    expect(suggestArea.children[1].className).toBe("select");

    // Enterキーで確定
    await user.keyboard("{Enter}");
    expect(input.value).toBe("pineapple ");
    expect(suggestArea.style.display).toBe("none");

    // 再度入力して新しい候補を表示
    await user.type(input, "ba");

    const suggestItems2 = await waitForSuggestUpdate(suggestArea);
    expect(suggestItems2).toEqual(["banana"]);

    // 下矢印キーで候補選択
    await user.keyboard("{ArrowDown}");
    expect(input.value).toBe("pineapple banana");
    expect(suggestArea.children[0].className).toBe("select");

    // Tabキーで確定
    await user.keyboard("{Tab}");
    expect(input.value).toBe("pineapple banana ");
    expect(suggestArea.style.display).toBe("none");
  });

  test("マウスクリックで候補選択と区切り文字追加", async () => {
    const { input, suggestArea, user } = setupSuggestLocalMulti(
      DEFAULT_CANDIDATE_LIST,
    );

    await user.click(input);
    await user.type(input, "apple banana ch");

    const suggestItems = await waitForSuggestUpdate(suggestArea);
    expect(suggestItems).toEqual(["cherry"]);

    // 最初の候補をクリック
    const firstSuggestion = suggestArea.children[0];
    await user.click(firstSuggestion);

    expect(input.value).toBe("apple banana cherry ");
    expect(suggestArea.style.display).toBe("none");
  });

  test("オプション: カスタム区切り文字（カンマ）", async () => {
    const { input, suggestArea, user } = setupSuggestLocalMulti(
      DEFAULT_CANDIDATE_LIST,
      { delim: "," },
    );

    await user.click(input);
    await user.type(input, "apple,banana,ch");

    const suggestItems = await waitForSuggestUpdate(suggestArea);
    expect(suggestItems).toEqual(["cherry"]);

    // Enterで確定
    await user.keyboard("{ArrowDown}");
    await user.keyboard("{Enter}");

    expect(input.value).toBe("apple,banana,cherry,");
  });

  test("オプション: インターバル", async () => {
    const { input, suggestArea, user } = setupSuggestLocalMulti(
      DEFAULT_CANDIDATE_LIST,
      { interval: 100 }, // インターバルを100msに設定
    );

    await user.click(input);
    await user.type(input, "apple banan");

    const suggestItems = await waitForSuggestUpdate(suggestArea, 100);
    expect(suggestItems).toEqual(["banana"]);
  });

  test("オプション: 表示件数", async () => {
    const { input, suggestArea, user } = setupSuggestLocalMulti(
      DEFAULT_CANDIDATE_LIST,
      { dispMax: 2 },
    );

    await user.click(input);
    await user.type(input, "apple a");

    const suggestItems = await waitForSuggestUpdate(suggestArea);
    expect(suggestItems).toEqual(["apple", "banana"]); // 2件のみ表示される
  });

  test("オプション: リストタグ名", async () => {
    const { input, suggestArea, user } = setupSuggestLocalMulti(
      DEFAULT_CANDIDATE_LIST,
      { listTagName: "span" },
    );

    await user.click(input);
    await user.type(input, "banana app");

    const suggestItems = await waitForSuggestUpdate(suggestArea);
    expect(suggestItems).toEqual(["apple", "pineapple"]);

    expect(suggestArea.innerHTML).toBe(
      "<span>apple</span><span>pineapple</span>",
    );
  });

  test("オプション: プレフィックス", async () => {
    const { input, suggestArea, user } = setupSuggestLocalMulti(
      DEFAULT_CANDIDATE_LIST,
      { prefix: true },
    );

    await user.click(input);
    await user.type(input, "orange app");

    // プレフィックス検索なので 'pineapple' は表示されない
    const suggestItems = await waitForSuggestUpdate(suggestArea);
    expect(suggestItems).toEqual(["apple"]);
  });

  test("オプション: 大文字小文字を区別", async () => {
    const { input, suggestArea, user } = setupSuggestLocalMulti(
      ["Apple", "Cherry", "Pineapple"],
      { ignoreCase: false },
    );

    await user.click(input);
    await user.type(input, "Cherry App");

    // 大文字小文字が区別されるので 'Pineapple' は表示されない
    const suggestItems = await waitForSuggestUpdate(suggestArea);
    expect(suggestItems).toEqual(["Apple"]);
  });

  test("オプション: ハイライト", async () => {
    const { input, suggestArea, user } = setupSuggestLocalMulti(
      DEFAULT_CANDIDATE_LIST,
      { highlight: true },
    );

    await user.click(input);
    await user.type(input, "orange app");

    const suggestItems = await waitForSuggestUpdate(suggestArea);
    expect(suggestItems).toEqual(["apple", "pineapple"]);

    // ハイライト表示されることを確認
    expect(suggestArea.innerHTML).toBe(
      "<div><strong>app</strong>le</div><div>pine<strong>app</strong>le</div>",
    );
  });

  test("オプション: 全件表示", async () => {
    const { input, suggestArea, user } = setupSuggestLocalMulti(
      DEFAULT_CANDIDATE_LIST,
      { dispAllKey: true },
    );

    await user.click(input);
    await user.type(input, "orange ");

    // この時点では0件
    const suggestItems1 = await waitForSuggestUpdate(suggestArea);
    expect(suggestItems1).toEqual([]);

    // Ctrl+下矢印キーを押して全件
    await user.keyboard("{Control>}{ArrowDown}{/Control}");

    const suggestItems2 = await waitForSuggestUpdate(suggestArea);
    expect(suggestItems2).toEqual(DEFAULT_CANDIDATE_LIST); // 全件表示される
  });

  test("オプション: classMouseOver", async () => {
    const { input, suggestArea, user } = setupSuggestLocalMulti(
      DEFAULT_CANDIDATE_LIST,
      { classMouseOver: "overX" },
    );

    await user.click(input);
    await user.type(input, "orange a");
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
    const { input, suggestArea, user } = setupSuggestLocalMulti(
      DEFAULT_CANDIDATE_LIST,
      { classSelect: "selectX" },
    );

    await user.click(input);
    await user.type(input, "orange rry");

    const suggestItems = await waitForSuggestUpdate(suggestArea);

    // サジェストが表示されていることを確認
    expect(suggestItems).toEqual(["cherry", "elderberry"]);

    // 下矢印キーを押してアクティブ候補を選択
    await user.keyboard("{ArrowDown}");

    expect(input.value).toBe("orange cherry");
    expect(suggestArea.children[0].className).toBe("selectX");
  });
});
