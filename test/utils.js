// @ts-check
import userEvent from "@testing-library/user-event";

export const setupSuggestLocal = (candidateList, options) => {
  document.body.innerHTML = "";

  const input = createTestInput("test-input");
  const suggestArea = createTestSuggestArea("test-suggest");
  const user = userEvent.setup({ document });
  new Suggest.Local(input, suggestArea, candidateList, options);

  return { input, suggestArea, user };
};

export const setupSuggestLocalMulti = (candidateList, options) => {
  document.body.innerHTML = "";

  const input = createTestInput("test-input");
  const suggestArea = createTestSuggestArea("test-suggest");
  const user = userEvent.setup({ document });
  new Suggest.LocalMulti(input, suggestArea, candidateList, options);

  return { input, suggestArea, user };
};

const collectDisplayItems = (suggestArea) => {
  return Array.from(suggestArea.children).map((x) => x.textContent);
};

export const waitForSuggestUpdate = async (suggestArea, interval = 500) => {
  return await new Promise((resolve) => {
    setTimeout(() => {
      resolve(collectDisplayItems(suggestArea));
    }, interval + 100);
  });
};

export const waitForSuggestBlur = async () => {
  return await new Promise((resolve) => setTimeout(resolve, 1200));
};

const createTestInput = (id) => {
  const element = document.createElement("input");
  element.id = id;
  document.body.appendChild(element);
  return element;
};

const createTestSuggestArea = (id) => {
  const div = document.createElement("div");
  div.id = id;
  div.style.display = "none";
  document.body.appendChild(div);
  return div;
};
