import { describe, expect, it } from "vitest";
import hateoas from "../src";

describe("hateoas", function () {
  const testCases = [
    ["http://localhost", "test"],
    ["http://localhost", "/test"],
    ["http://localhost/", "test"],
    ["http://localhost/", "/test"],
  ];

  it.each(testCases)("all combinations of baseUrl", (baseUrl, subUrl) => {
    const routing = hateoas({ baseUrl: baseUrl! }).registerLinkHandler("test", () => ({
      test: subUrl!,
    }));

    expect(routing.link("test", {})).toEqual({
      links: { test: "http://localhost/test" },
    });
  });

  it("links by type", function () {
    const routing = hateoas({ baseUrl: "http://localhost" }).registerLinkHandler(
      "test",
      (_input: { value: string }) => ({ test: "/test" })
    );

    expect(routing.link("test", { value: "aaa" })).toEqual({
      value: "aaa",
      links: { test: "http://localhost/test" },
    });
  });

  it("links empty collections", function () {
    const routing = hateoas({ baseUrl: "http://localhost" }).registerCollectionLinkHandler(
      "test",
      () => ({ test: "/test" })
    );

    expect(routing.link("test", [])).toEqual({
      data: [],
      links: { test: "http://localhost/test" },
    });
  });

  it("links collections", function () {
    const routing = hateoas({ baseUrl: "http://localhost" }).registerCollectionLinkHandler(
      "test",
      (_input: { value: string }[]) => ({ test: "/test" })
    );

    expect(routing.link("test", [{ value: "aaa" }, { value: "bbb" }])).toEqual({
      data: [{ value: "aaa" }, { value: "bbb" }],
      links: { test: "http://localhost/test" },
    });
  });
});
