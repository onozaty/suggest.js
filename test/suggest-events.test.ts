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

describe("Suggest.Local - Event tests", () => {
  test("should start suggestion on focus event", async () => {
    const { input, suggestArea, user } = setupSuggestLocal(
      DEFAULT_CANDIDATE_LIST,
    );

    await user.click(input);
    await user.clear(input);
    await user.type(input, "app");

    const suggestItems = await waitForSuggestUpdate(suggestArea);
    expect(suggestItems).toEqual(["apple", "pineapple"]);
  });

  test("should navigate with up/down arrow keys", async () => {
    const { input, suggestArea, user } = setupSuggestLocal(
      DEFAULT_CANDIDATE_LIST,
    );

    await user.click(input);
    await user.type(input, "ap");

    const suggestItems = await waitForSuggestUpdate(suggestArea);

    // Verify suggestions are displayed
    expect(suggestItems).toEqual(["apple", "pineapple"]);

    // Select suggestion with down arrow key
    await user.keyboard("{ArrowDown}");
    expect(input.value).toBe("apple");
    expect(suggestArea.children[0].className).toBe("select");
    expect(suggestArea.children[1].className).toBe("");

    await user.keyboard("{ArrowDown}");
    expect(input.value).toBe("pineapple");
    expect(suggestArea.children[0].className).toBe("");
    expect(suggestArea.children[1].className).toBe("select");

    // Pressing down arrow at the last suggestion returns to unselected state
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

    // Navigate back with up arrow key
    await user.keyboard("{ArrowUp}");
    expect(input.value).toBe("apple");
    expect(suggestArea.children[0].className).toBe("select");
    expect(suggestArea.children[1].className).toBe("");
  });

  test("should confirm selection with Enter key", async () => {
    const { input, suggestArea, user } = setupSuggestLocal(
      DEFAULT_CANDIDATE_LIST,
    );

    await user.click(input);
    await user.type(input, "app");

    const suggestItems = await waitForSuggestUpdate(suggestArea);
    expect(suggestItems).toEqual(["apple", "pineapple"]);

    // Select suggestion with down arrow key
    await user.keyboard("{ArrowDown}");

    // Confirm with Enter key
    await user.keyboard("{Enter}");

    expect(input.value).toBe("apple");
    expect(suggestArea.style.display).toBe("none");
  });

  test("should cancel with Escape key", async () => {
    const { input, suggestArea, user } = setupSuggestLocal(
      DEFAULT_CANDIDATE_LIST,
    );

    const originalValue = "app";
    await user.click(input);
    await user.type(input, originalValue);

    const suggestItems = await waitForSuggestUpdate(suggestArea);
    expect(suggestItems).toEqual(["apple", "pineapple"]);

    // Select suggestion
    await user.keyboard("{ArrowDown}");

    // Cancel with Escape key
    await user.keyboard("{Escape}");

    expect(input.value).toBe(originalValue);
    expect(suggestArea.style.display).toBe("none");
  });

  test("should select suggestion with mouse click", async () => {
    const { input, suggestArea, user } = setupSuggestLocal(
      DEFAULT_CANDIDATE_LIST,
    );

    await user.click(input);
    await user.type(input, "a");

    const suggestItems = await waitForSuggestUpdate(suggestArea);
    expect(suggestItems).toEqual(["apple", "banana", "orange", "pineapple"]);

    // Click first suggestion
    const firstSuggestion = suggestArea.children[0];
    await user.click(firstSuggestion);

    expect(input.value).toBe("apple");
    expect(suggestArea.style.display).toBe("none");
  });

  test("should highlight/unhighlight on mouse over/out", async () => {
    const { input, suggestArea, user } = setupSuggestLocal(
      DEFAULT_CANDIDATE_LIST,
    );

    await user.click(input);
    await user.type(input, "a");
    await waitForSuggestUpdate(suggestArea);

    const firstSuggestion = suggestArea.children[0];

    // Mouse over
    await user.hover(firstSuggestion);
    expect(firstSuggestion.className).toBe("over");

    // Mouse out (hover over another element)
    await user.hover(input);
    expect(firstSuggestion.className).toBe("");
  });

  test("should hide suggestions on blur event", async () => {
    const { input, suggestArea, user } = setupSuggestLocal(
      DEFAULT_CANDIDATE_LIST,
    );

    await user.click(input);
    await user.type(input, "app");

    // Verify suggestions are displayed
    const suggestItems = await waitForSuggestUpdate(suggestArea);
    expect(suggestItems).toEqual(["apple", "pineapple"]);

    // Trigger blur event
    input.blur();

    await waitForSuggestBlur();

    // Verify suggestions are hidden
    expect(suggestArea.style.display).toBe("none");
  });

  test("option: interval", async () => {
    const { input, suggestArea, user } = setupSuggestLocal(
      DEFAULT_CANDIDATE_LIST,
      { interval: 100 }, // Set interval to 100ms
    );

    await user.click(input);
    await user.type(input, "banana");

    const suggestItems = await waitForSuggestUpdate(suggestArea, 100);
    expect(suggestItems).toEqual(["banana"]);
  });

  test("option: dispMax", async () => {
    const { input, suggestArea, user } = setupSuggestLocal(
      DEFAULT_CANDIDATE_LIST,
      { dispMax: 2 },
    );

    await user.click(input);
    await user.type(input, "a");

    const suggestItems = await waitForSuggestUpdate(suggestArea);
    expect(suggestItems).toEqual(["apple", "banana"]); // Only 2 items displayed
  });

  test("option: listTagName", async () => {
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

  test("option: prefix", async () => {
    const { input, suggestArea, user } = setupSuggestLocal(
      DEFAULT_CANDIDATE_LIST,
      { prefix: true },
    );

    await user.click(input);
    await user.type(input, "app");

    // With prefix search, 'pineapple' is not displayed
    const suggestItems = await waitForSuggestUpdate(suggestArea);
    expect(suggestItems).toEqual(["apple"]);
  });

  test("option: ignoreCase", async () => {
    const { input, suggestArea, user } = setupSuggestLocal(
      ["Apple", "Pineapple"],
      { ignoreCase: false },
    );

    await user.click(input);
    await user.type(input, "App");

    // With case sensitivity, 'Pineapple' is not displayed
    const suggestItems = await waitForSuggestUpdate(suggestArea);
    expect(suggestItems).toEqual(["Apple"]);
  });

  test("option: highlight", async () => {
    const { input, suggestArea, user } = setupSuggestLocal(
      DEFAULT_CANDIDATE_LIST,
      { highlight: true },
    );

    await user.click(input);
    await user.type(input, "app");

    const suggestItems = await waitForSuggestUpdate(suggestArea);
    expect(suggestItems).toEqual(["apple", "pineapple"]);

    // Verify highlighting is applied
    expect(suggestArea.innerHTML).toBe(
      "<div><strong>app</strong>le</div><div>pine<strong>app</strong>le</div>",
    );
  });

  test("option: dispAllKey", async () => {
    const { input, suggestArea, user } = setupSuggestLocal(
      DEFAULT_CANDIDATE_LIST,
      { dispAllKey: true },
    );

    await user.click(input);

    // No suggestions at this point
    const suggestItems1 = await waitForSuggestUpdate(suggestArea);
    expect(suggestItems1).toEqual([]);

    // Press Ctrl+Down arrow to show all
    await user.keyboard("{Control>}{ArrowDown}{/Control}");

    const suggestItems2 = await waitForSuggestUpdate(suggestArea);
    expect(suggestItems2).toEqual(DEFAULT_CANDIDATE_LIST); // All items displayed
  });

  test("option: classMouseOver", async () => {
    const { input, suggestArea, user } = setupSuggestLocal(
      DEFAULT_CANDIDATE_LIST,
      { classMouseOver: "overX" },
    );

    await user.click(input);
    await user.type(input, "a");
    await waitForSuggestUpdate(suggestArea);

    const firstSuggestion = suggestArea.children[0];

    // Mouse over
    await user.hover(firstSuggestion);
    expect(firstSuggestion.className).toBe("overX");

    // Mouse out (hover over another element)
    await user.hover(input);
    expect(firstSuggestion.className).toBe("");
  });

  test("option: classSelect", async () => {
    const { input, suggestArea, user } = setupSuggestLocal(
      DEFAULT_CANDIDATE_LIST,
      { classSelect: "selectX" },
    );

    await user.click(input);
    await user.type(input, "rry");

    const suggestItems = await waitForSuggestUpdate(suggestArea);

    // Verify suggestions are displayed
    expect(suggestItems).toEqual(["cherry", "elderberry"]);

    // Select suggestion with down arrow key
    await user.keyboard("{ArrowDown}");

    expect(input.value).toBe("cherry");
    expect(suggestArea.children[0].className).toBe("selectX");
  });
});
