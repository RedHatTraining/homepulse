import { describe, expect, it } from "vitest";
import { loadColor, percentOf } from "./metrics.js";

describe("percentOf", () => {
  it("rounds to the nearest integer", () => {
    expect(percentOf(1, 3)).toBe(33);
    expect(percentOf(2, 3)).toBe(67);
  });

  it("caps at 100", () => {
    expect(percentOf(150, 100)).toBe(100);
  });
});

describe("loadColor", () => {
  it("maps load levels to green, amber and red", () => {
    expect(loadColor(50)).toBe("#3e8635");
    expect(loadColor(51)).toBe("#f0ab00");
    expect(loadColor(80)).toBe("#f0ab00");
    expect(loadColor(81)).toBe("#c9190b");
  });
});
