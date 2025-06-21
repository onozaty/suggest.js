// TypeScript interfaces
export interface SuggestOptions {
  interval?: number;
  dispMax?: number;
  listTagName?: string;
  prefix?: boolean;
  ignoreCase?: boolean;
  highlight?: boolean;
  dispAllKey?: boolean;
  classMouseOver?: string;
  classSelect?: string;
  hookBeforeSearch?: (text: string) => void;
}

export interface SuggestMultiOptions extends SuggestOptions {
  delim?: string;
}

type ElementOrId = string | HTMLElement;

// SuggestLocal class definition
class SuggestLocal {
  protected input: HTMLInputElement;
  protected suggestArea: HTMLElement;
  protected candidateList: string[];
  protected oldText: string;
  protected timerId: ReturnType<typeof setTimeout> | null = null;
  protected suggestList: HTMLElement[] | null = null;
  protected suggestIndexList: number[] | null = null;
  protected activePosition: number | null = null;
  protected inputValueBackup: string = "";

  // Options with defaults
  interval: number = 500;
  dispMax: number = 20;
  listTagName: string = "div";
  prefix: boolean = false;
  ignoreCase: boolean = true;
  highlight: boolean = false;
  dispAllKey: boolean = false;
  classMouseOver: string = "over";
  classSelect: string = "select";
  hookBeforeSearch: (text: string) => void = () => {};

  constructor(
    input: ElementOrId,
    suggestArea: ElementOrId,
    candidateList: string[],
    options?: SuggestOptions,
  ) {
    this.input = this.getElement(input) as HTMLInputElement;
    this.suggestArea = this.getElement(suggestArea);
    this.candidateList = candidateList;
    this.oldText = this.getInputText();

    if (options) {
      this.setOptions(options);
    }

    // Register events
    this.input.addEventListener("focus", () => this.checkLoop());
    this.input.addEventListener("blur", () => this.inputBlur());
    this.suggestArea.addEventListener("blur", () => this.inputBlur());
    this.input.addEventListener("keydown", (event) => this.keyEvent(event));

    // Initialize
    this.clearSuggestArea();
  }

  private setOptions(options: SuggestOptions): void {
    Object.assign(this, options);
  }

  private inputBlur(): void {
    setTimeout(() => {
      if (
        document.activeElement === this.suggestArea ||
        document.activeElement === this.input
      ) {
        // keep suggestion
        return;
      }

      this.changeUnactive();
      this.oldText = this.getInputText();

      if (this.timerId) {
        clearTimeout(this.timerId);
      }
      this.timerId = null;

      setTimeout(() => this.clearSuggestArea(), 500);
    }, 500);
  }

  private checkLoop(): void {
    const text = this.getInputText();
    if (text !== this.oldText) {
      this.oldText = text;
      this.search();
    }
    if (this.timerId) {
      clearTimeout(this.timerId);
    }
    this.timerId = setTimeout(() => this.checkLoop(), this.interval);
  }

  private search(): void {
    // Initialize
    this.clearSuggestArea();

    const text = this.getInputText();

    if (text === "" || text === null) return;

    this.hookBeforeSearch(text);
    const resultList = this._search(text);
    if (resultList.length !== 0) {
      this.createSuggestArea(resultList);
    }
  }

  private _search(text: string): string[] {
    const resultList: string[] = [];
    let temp: string | null;
    this.suggestIndexList = [];

    for (let i = 0, length = this.candidateList.length; i < length; i++) {
      temp = this.isMatch(this.candidateList[i], text);
      if (temp !== null) {
        resultList.push(temp);
        this.suggestIndexList.push(i);

        if (this.dispMax !== 0 && resultList.length >= this.dispMax) break;
      }
    }
    return resultList;
  }

  private isMatch(value: string, pattern: string): string | null {
    if (value === null || value === undefined) return null;

    const pos = this.ignoreCase
      ? value.toLowerCase().indexOf(pattern.toLowerCase())
      : value.indexOf(pattern);

    if (pos === -1 || (this.prefix && pos !== 0)) return null;

    if (this.highlight) {
      return (
        this.escapeHTML(value.substring(0, pos)) +
        "<strong>" +
        this.escapeHTML(value.substring(pos, pos + pattern.length)) +
        "</strong>" +
        this.escapeHTML(value.substring(pos + pattern.length))
      );
    } else {
      return this.escapeHTML(value);
    }
  }

  protected clearSuggestArea(): void {
    this.suggestArea.innerHTML = "";
    this.suggestArea.style.display = "none";
    this.suggestList = null;
    this.suggestIndexList = null;
    this.activePosition = null;
  }

  private createSuggestArea(resultList: string[]): void {
    this.suggestList = [];
    this.inputValueBackup = this.input.value;

    for (let i = 0, length = resultList.length; i < length; i++) {
      const element = document.createElement(this.listTagName);
      element.innerHTML = resultList[i];
      this.suggestArea.appendChild(element);

      element.addEventListener("click", (event) => this.listClick(event, i));
      element.addEventListener("mouseover", (event) =>
        this.listMouseOver(event, i),
      );
      element.addEventListener("mouseout", (event) =>
        this.listMouseOut(event, i),
      );

      this.suggestList.push(element);
    }

    this.suggestArea.style.display = "";
    this.suggestArea.scrollTop = 0;
  }

  protected getInputText(): string {
    return this.input.value;
  }

  protected setInputText(text: string): void {
    this.input.value = text;
  }

  // Key event handling
  private keyEvent(event: KeyboardEvent): void {
    if (!this.timerId) {
      this.timerId = setTimeout(() => this.checkLoop(), this.interval);
    }

    if (
      this.dispAllKey &&
      event.ctrlKey &&
      this.getInputText() === "" &&
      !this.suggestList &&
      event.key === "ArrowDown"
    ) {
      // Display all
      this.stopEvent(event);
      this.keyEventDispAll();
    } else if (event.key === "ArrowUp" || event.key === "ArrowDown") {
      // Key movement
      if (this.suggestList && this.suggestList.length !== 0) {
        this.stopEvent(event);
        this.keyEventMove(event.key);
      }
    } else if (event.key === "Enter") {
      // Confirm
      if (this.suggestList && this.suggestList.length !== 0) {
        this.stopEvent(event);
        this.keyEventReturn();
      }
    } else if (event.key === "Escape") {
      // Cancel
      if (this.suggestList && this.suggestList.length !== 0) {
        this.stopEvent(event);
        this.keyEventEsc();
      }
    } else {
      this.keyEventOther(event);
    }
  }

  private keyEventDispAll(): void {
    // Initialize
    this.clearSuggestArea();

    this.oldText = this.getInputText();

    this.suggestIndexList = [];
    for (let i = 0, length = this.candidateList.length; i < length; i++) {
      this.suggestIndexList.push(i);
    }

    this.createSuggestArea(this.candidateList);
  }

  private keyEventMove(key: string): void {
    this.changeUnactive();

    if (key === "ArrowUp") {
      // Up
      if (this.activePosition === null) {
        this.activePosition = this.suggestList!.length - 1;
      } else {
        this.activePosition--;
        if (this.activePosition < 0) {
          this.activePosition = null;
          this.input.value = this.inputValueBackup;
          this.suggestArea.scrollTop = 0;
          return;
        }
      }
    } else {
      // Down
      if (this.activePosition === null) {
        this.activePosition = 0;
      } else {
        this.activePosition++;
      }

      if (this.activePosition >= this.suggestList!.length) {
        this.activePosition = null;
        this.input.value = this.inputValueBackup;
        this.suggestArea.scrollTop = 0;
        return;
      }
    }

    this.changeActive(this.activePosition);
  }

  protected keyEventReturn(): void {
    this.clearSuggestArea();
    this.moveEnd();
  }

  private keyEventEsc(): void {
    this.clearSuggestArea();
    this.input.value = this.inputValueBackup;
    this.oldText = this.getInputText();
  }

  protected keyEventOther(_event: KeyboardEvent): void {
    // Override in subclasses if needed
  }

  protected changeActive(index: number): void {
    this.setStyleActive(this.suggestList![index]);
    this.setInputText(this.candidateList[this.suggestIndexList![index]]);
    this.oldText = this.getInputText();
    this.input.focus();
  }

  protected changeUnactive(): void {
    if (
      this.suggestList !== null &&
      this.suggestList.length > 0 &&
      this.activePosition !== null
    ) {
      this.setStyleUnactive(this.suggestList[this.activePosition]);
    }
  }

  protected listClick(_event: Event, index: number): void {
    this.changeUnactive();
    this.activePosition = index;
    this.changeActive(index);

    this.clearSuggestArea();
    this.moveEnd();
  }

  private listMouseOver(event: Event, _index: number): void {
    this.setStyleMouseOver(this.getEventElement(event));
  }

  private listMouseOut(event: Event, index: number): void {
    if (!this.suggestList) return;

    const element = this.getEventElement(event);

    if (index === this.activePosition) {
      this.setStyleActive(element);
    } else {
      this.setStyleUnactive(element);
    }
  }

  private setStyleActive(element: HTMLElement): void {
    element.className = this.classSelect;

    // Auto scroll
    const offset = element.offsetTop;
    const offsetWithHeight = offset + element.clientHeight;

    if (this.suggestArea.scrollTop > offset) {
      this.suggestArea.scrollTop = offset;
    } else if (
      this.suggestArea.scrollTop + this.suggestArea.clientHeight <
      offsetWithHeight
    ) {
      this.suggestArea.scrollTop =
        offsetWithHeight - this.suggestArea.clientHeight;
    }
  }

  private setStyleUnactive(element: HTMLElement): void {
    element.className = "";
  }

  private setStyleMouseOver(element: HTMLElement): void {
    element.className = this.classMouseOver;
  }

  protected moveEnd(): void {
    this.input.setSelectionRange(
      this.input.value.length,
      this.input.value.length,
    );
    this.input.focus();
  }

  // Utility methods
  private getElement(element: ElementOrId): HTMLElement {
    return typeof element === "string"
      ? document.getElementById(element)!
      : element;
  }

  protected stopEvent(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
  }

  private getEventElement(event: Event): HTMLElement {
    return event.target as HTMLElement;
  }

  private escapeHTML(value: string): string {
    return value
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }
}

// SuggestLocalMulti class definition
class SuggestLocalMulti extends SuggestLocal {
  delim: string = " "; // delimiter

  constructor(
    input: ElementOrId,
    suggestArea: ElementOrId,
    candidateList: string[],
    options?: SuggestMultiOptions,
  ) {
    super(input, suggestArea, candidateList, options);
    if (options?.delim) {
      this.delim = options.delim;
    }
  }

  override keyEventReturn(): void {
    this.clearSuggestArea();
    this.input.value += this.delim;
    this.moveEnd();
  }

  override keyEventOther(event: KeyboardEvent): void {
    if (event.key === "Tab") {
      // Confirm
      if (this.suggestList && this.suggestList.length !== 0) {
        this.stopEvent(event);

        if (this.activePosition === null) {
          this.activePosition = 0;
          this.changeActive(this.activePosition);
        }

        this.clearSuggestArea();
        this.input.value += this.delim;

        this.moveEnd();
      }
    }
  }

  override listClick(_event: Event, index: number): void {
    this.changeUnactive();
    this.activePosition = index;
    this.changeActive(index);

    this.input.value += this.delim;

    this.clearSuggestArea();
    this.moveEnd();
  }

  override getInputText(): string {
    const pos = this.getLastTokenPos();

    if (pos === -1) {
      return this.input.value;
    } else {
      return this.input.value.substring(pos + this.delim.length);
    }
  }

  override setInputText(text: string): void {
    const pos = this.getLastTokenPos();

    if (pos === -1) {
      this.input.value = text;
    } else {
      this.input.value =
        this.input.value.substring(0, pos + this.delim.length) + text;
    }
  }

  private getLastTokenPos(): number {
    return this.input.value.lastIndexOf(this.delim);
  }
}

// Named exports for module usage
export { SuggestLocal as Local, SuggestLocalMulti as LocalMulti };

// Main Suggest namespace (for module compatibility)
export const Suggest = {
  Local: SuggestLocal,
  LocalMulti: SuggestLocalMulti,
};

// Default export - directly export the namespace object
export default {
  Local: SuggestLocal,
  LocalMulti: SuggestLocalMulti,
};
