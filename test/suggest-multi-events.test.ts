import { setupSuggestLocalMulti, waitForSuggestUpdate } from "./utils";

const DEFAULT_CANDIDATE_LIST = [
  "apple",
  "banana",
  "cherry",
  "orange",
  "elderberry",
  "pineapple",
];

describe("Suggest.LocalMulti - Event Tests", () => {
  test("sequential suggestions with multiple inputs", async () => {
    const { input, suggestArea, user } = setupSuggestLocalMulti(
      DEFAULT_CANDIDATE_LIST,
    );

    // No suggestions are displayed in initial state
    await user.click(input);
    const suggestItems = await waitForSuggestUpdate(suggestArea);
    expect(suggestItems).toEqual([]);

    // Start typing
    await user.type(input, "app");
    const suggestItems1 = await waitForSuggestUpdate(suggestArea);
    expect(suggestItems1).toEqual(["apple", "pineapple"]);

    // Press down arrow key to select active suggestion
    await user.keyboard("{ArrowDown}");
    expect(input.value).toBe("apple");
    expect(suggestArea.children[0].className).toBe("select");
    expect(suggestArea.children[1].className).toBe("");

    await user.keyboard("{ArrowDown}");
    expect(input.value).toBe("pineapple");
    expect(suggestArea.children[0].className).toBe("");
    expect(suggestArea.children[1].className).toBe("select");

    // Confirm with Enter key
    await user.keyboard("{Enter}");
    expect(input.value).toBe("pineapple ");
    expect(suggestArea.style.display).toBe("none");

    // Type again to show new suggestions
    await user.type(input, "ba");

    const suggestItems2 = await waitForSuggestUpdate(suggestArea);
    expect(suggestItems2).toEqual(["banana"]);

    // Select suggestion with down arrow key
    await user.keyboard("{ArrowDown}");
    expect(input.value).toBe("pineapple banana");
    expect(suggestArea.children[0].className).toBe("select");

    // Confirm with Tab key
    await user.keyboard("{Tab}");
    expect(input.value).toBe("pineapple banana ");
    expect(suggestArea.style.display).toBe("none");
  });

  test("suggestion selection with mouse click and delimiter addition", async () => {
    const { input, suggestArea, user } = setupSuggestLocalMulti(
      DEFAULT_CANDIDATE_LIST,
    );

    await user.click(input);
    await user.type(input, "apple banana ch");

    const suggestItems = await waitForSuggestUpdate(suggestArea);
    expect(suggestItems).toEqual(["cherry"]);

    // Click the first suggestion
    const firstSuggestion = suggestArea.children[0];
    await user.click(firstSuggestion);

    expect(input.value).toBe("apple banana cherry ");
    expect(suggestArea.style.display).toBe("none");
  });

  test("option: custom delimiter (comma)", async () => {
    const { input, suggestArea, user } = setupSuggestLocalMulti(
      DEFAULT_CANDIDATE_LIST,
      { delim: "," },
    );

    await user.click(input);
    await user.type(input, "apple,banana,ch");

    const suggestItems = await waitForSuggestUpdate(suggestArea);
    expect(suggestItems).toEqual(["cherry"]);

    // Confirm with Enter
    await user.keyboard("{ArrowDown}");
    await user.keyboard("{Enter}");

    expect(input.value).toBe("apple,banana,cherry,");
  });

  test("option: custom delimiter (multiple characters)", async () => {
    const { input, suggestArea, user } = setupSuggestLocalMulti(
      DEFAULT_CANDIDATE_LIST,
      { delim: ", " },
    );

    // No suggestions are displayed in initial state
    await user.click(input);
    const suggestItems = await waitForSuggestUpdate(suggestArea);
    expect(suggestItems).toEqual([]);

    // Start typing
    await user.type(input, "app");
    const suggestItems1 = await waitForSuggestUpdate(suggestArea);
    expect(suggestItems1).toEqual(["apple", "pineapple"]);

    // Press down arrow key to select active suggestion
    await user.keyboard("{ArrowDown}");
    expect(input.value).toBe("apple");
    expect(suggestArea.children[0].className).toBe("select");
    expect(suggestArea.children[1].className).toBe("");

    // Confirm with Enter key
    await user.keyboard("{Enter}");
    expect(input.value).toBe("apple, ");
    expect(suggestArea.style.display).toBe("none");

    // Type again to show new suggestions
    await user.type(input, "ba");

    const suggestItems2 = await waitForSuggestUpdate(suggestArea);
    expect(suggestItems2).toEqual(["banana"]);

    // Select suggestion with down arrow key
    await user.keyboard("{ArrowDown}");
    expect(input.value).toBe("apple, banana");
    expect(suggestArea.children[0].className).toBe("select");

    // Confirm with Tab key
    await user.keyboard("{Tab}");
    expect(input.value).toBe("apple, banana, ");
    expect(suggestArea.style.display).toBe("none");
  });

  test("option: interval", async () => {
    const { input, suggestArea, user } = setupSuggestLocalMulti(
      DEFAULT_CANDIDATE_LIST,
      { interval: 100 }, // Set interval to 100ms
    );

    await user.click(input);
    await user.type(input, "apple banan");

    const suggestItems = await waitForSuggestUpdate(suggestArea, 100);
    expect(suggestItems).toEqual(["banana"]);
  });

  test("option: display count", async () => {
    const { input, suggestArea, user } = setupSuggestLocalMulti(
      DEFAULT_CANDIDATE_LIST,
      { dispMax: 2 },
    );

    await user.click(input);
    await user.type(input, "apple a");

    const suggestItems = await waitForSuggestUpdate(suggestArea);
    expect(suggestItems).toEqual(["apple", "banana"]); // Only 2 items displayed
  });

  test("option: list tag name", async () => {
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

  test("option: prefix", async () => {
    const { input, suggestArea, user } = setupSuggestLocalMulti(
      DEFAULT_CANDIDATE_LIST,
      { prefix: true },
    );

    await user.click(input);
    await user.type(input, "orange app");

    // 'pineapple' is not displayed because of prefix search
    const suggestItems = await waitForSuggestUpdate(suggestArea);
    expect(suggestItems).toEqual(["apple"]);
  });

  test("option: case sensitivity", async () => {
    const { input, suggestArea, user } = setupSuggestLocalMulti(
      ["Apple", "Cherry", "Pineapple"],
      { ignoreCase: false },
    );

    await user.click(input);
    await user.type(input, "Cherry App");

    // 'Pineapple' is not displayed because case is considered
    const suggestItems = await waitForSuggestUpdate(suggestArea);
    expect(suggestItems).toEqual(["Apple"]);
  });

  test("option: highlight", async () => {
    const { input, suggestArea, user } = setupSuggestLocalMulti(
      DEFAULT_CANDIDATE_LIST,
      { highlight: true },
    );

    await user.click(input);
    await user.type(input, "orange app");

    const suggestItems = await waitForSuggestUpdate(suggestArea);
    expect(suggestItems).toEqual(["apple", "pineapple"]);

    // Verify highlight display
    expect(suggestArea.innerHTML).toBe(
      "<div><strong>app</strong>le</div><div>pine<strong>app</strong>le</div>",
    );
  });

  test("option: display all", async () => {
    const { input, suggestArea, user } = setupSuggestLocalMulti(
      DEFAULT_CANDIDATE_LIST,
      { dispAllKey: true },
    );

    await user.click(input);
    await user.type(input, "orange ");

    // No items at this point
    const suggestItems1 = await waitForSuggestUpdate(suggestArea);
    expect(suggestItems1).toEqual([]);

    // Press Ctrl+Down arrow to show all items
    await user.keyboard("{Control>}{ArrowDown}{/Control}");

    const suggestItems2 = await waitForSuggestUpdate(suggestArea);
    expect(suggestItems2).toEqual(DEFAULT_CANDIDATE_LIST); // All items displayed
  });

  test("option: classMouseOver", async () => {
    const { input, suggestArea, user } = setupSuggestLocalMulti(
      DEFAULT_CANDIDATE_LIST,
      { classMouseOver: "overX" },
    );

    await user.click(input);
    await user.type(input, "orange a");
    await waitForSuggestUpdate(suggestArea);

    const firstSuggestion = suggestArea.children[0];

    // Mouse over
    await user.hover(firstSuggestion);
    expect(firstSuggestion.className).toBe("overX");

    // Mouse out (hover over another element to remove)
    await user.hover(input);
    expect(firstSuggestion.className).toBe("");
  });

  test("option: classSelect", async () => {
    const { input, suggestArea, user } = setupSuggestLocalMulti(
      DEFAULT_CANDIDATE_LIST,
      { classSelect: "selectX" },
    );

    await user.click(input);
    await user.type(input, "orange rry");

    const suggestItems = await waitForSuggestUpdate(suggestArea);

    // Verify suggestions are displayed
    expect(suggestItems).toEqual(["cherry", "elderberry"]);

    // Press down arrow key to select active suggestion
    await user.keyboard("{ArrowDown}");

    expect(input.value).toBe("orange cherry");
    expect(suggestArea.children[0].className).toBe("selectX");
  });
});
