import { describe, expect, it, vi } from "vitest";
import { error, info, warn } from "./Logger";

describe("logger", () => {
  it("should info", () => {
    const consoleMock = vi.spyOn(console, "log").mockImplementation(() => {
      return;
    });

    info("test");
    expect(consoleMock).toHaveBeenCalledWith("[INFO] test");
  });

  it("should warn", () => {
    const consoleMock = vi.spyOn(console, "warn").mockImplementation(() => {
      return;
    });

    warn("test");
    expect(consoleMock).toHaveBeenCalledWith("[WARN] test");
  });

  it("should error", () => {
    const consoleMock = vi.spyOn(console, "error").mockImplementation(() => {
      return;
    });

    error("test");
    expect(consoleMock).toHaveBeenCalledWith("[ERROR] test");
  });
});
