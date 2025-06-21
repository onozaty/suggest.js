import type { UserEvent } from "@testing-library/user-event";
import userEvent from "@testing-library/user-event";
import { Suggest, SuggestMultiOptions, SuggestOptions } from "../src/suggest";

interface SuggestSetupResult {
  input: HTMLInputElement;
  suggestArea: HTMLElement;
  user: UserEvent;
}

export const setupSuggestLocal = (
  candidateList: string[],
  options?: SuggestOptions,
): SuggestSetupResult => {
  document.body.innerHTML = "";

  const input = createTestInput("test-input");
  const suggestArea = createTestSuggestArea("test-suggest");
  const user = userEvent.setup({ document });
  new Suggest.Local(input, suggestArea, candidateList, options);

  return { input, suggestArea, user };
};

export const setupSuggestLocalMulti = (
  candidateList: string[],
  options?: SuggestMultiOptions,
): SuggestSetupResult => {
  document.body.innerHTML = "";

  const input = createTestInput("test-input");
  const suggestArea = createTestSuggestArea("test-suggest");
  const user = userEvent.setup({ document });
  new Suggest.LocalMulti(input, suggestArea, candidateList, options);

  return { input, suggestArea, user };
};

const collectDisplayItems = (suggestArea: HTMLElement): string[] => {
  return Array.from(suggestArea.children).map((x) => x.textContent || "");
};

export const waitForSuggestUpdate = async (
  suggestArea: HTMLElement,
  interval: number = 500,
): Promise<string[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(collectDisplayItems(suggestArea));
    }, interval + 100);
  });
};

export const waitForSuggestBlur = async (): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, 1200));
};

const createTestInput = (id: string): HTMLInputElement => {
  const element = document.createElement("input");
  element.id = id;
  document.body.appendChild(element);
  return element;
};

const createTestSuggestArea = (id: string): HTMLElement => {
  const div = document.createElement("div");
  div.id = id;
  div.style.display = "none";
  document.body.appendChild(div);
  return div;
};
