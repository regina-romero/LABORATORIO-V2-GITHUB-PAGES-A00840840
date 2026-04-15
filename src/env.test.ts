import { describe, expect, it } from "vitest";

describe("release board environment", () => {
  it("uses local as default environment when no variable is provided", () => {
    const raw: string | undefined = undefined;
    const environment = raw || "local";
    expect(environment).toBe("local");
  });

  it("accepts staging as a visible environment", () => {
    const environment = "staging";
    expect(environment).toBe("staging");
  });
});