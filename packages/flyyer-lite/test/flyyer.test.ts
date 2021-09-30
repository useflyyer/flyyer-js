import { Flyyer } from "../src/flyyer";

describe("Flyyer", () => {
  it("Flyyer is instantiable", () => {
    const flyyer = new Flyyer({ project: "" });
    expect(flyyer).toBeInstanceOf(Flyyer);
  });

  it("raises error if missing arguments", () => {
    const executer = (args?: any) => new Flyyer(args).href();

    expect(() => executer()).toThrow("Flyyer constructor must not be empty");
    expect(() => executer({ project: "" })).not.toThrow();
  });

  it("without path fallbacks to root", () => {
    const flyyer = new Flyyer({ project: "project" });
    expect(flyyer.href()).toMatch(/^https:\/\/cdn.flyyer.io\/v2\/project\/_\/__v=(\d+)\/$/);
  });

  it("handles single path", () => {
    const flyyer = new Flyyer({ project: "project", path: "about" });
    expect(flyyer.href()).toMatch(/^https:\/\/cdn.flyyer.io\/v2\/project\/_\/__v=(\d+)\/about$/);
  });

  it("handles multiple paths", () => {
    const options = [
      ["dashboard", "company"],
      ["/dashboard", "company"],
      ["/dashboard", "/company"],
      ["dashboard", false, "/company"],
      ["/dashboard/", null, "/company/"],
      ["dashboard///", null, undefined, false, "////company/"],
    ];
    for (const path of options) {
      const flyyer = new Flyyer({ project: "project", path: path as any });
      expect(flyyer.href()).toMatch(/^https:\/\/cdn.flyyer.io\/v2\/project\/_\/__v=(\d+)\/dashboard\/company$/);
    }
  });

  it("handle numbers in path", () => {
    const flyyer1 = new Flyyer({ project: "project", path: ["products", 1] });
    expect(flyyer1.href()).toMatch(/^https:\/\/cdn.flyyer.io\/v2\/project\/_\/__v=(\d+)\/products\/1$/);
    const flyyer0 = new Flyyer({ project: "project", path: ["products", 0] });
    expect(flyyer0.href()).toMatch(/^https:\/\/cdn.flyyer.io\/v2\/project\/_\/__v=(\d+)\/products\/0$/);
    const flyyerInf = new Flyyer({ project: "project", path: ["products", Infinity] });
    expect(flyyerInf.href()).toMatch(/^https:\/\/cdn.flyyer.io\/v2\/project\/_\/__v=(\d+)\/products\/Infinity$/);
    // Ignores falsy values
    const flyyerNaN = new Flyyer({ project: "project", path: ["products", NaN] });
    expect(flyyerNaN.href()).toMatch(/^https:\/\/cdn.flyyer.io\/v2\/project\/_\/__v=(\d+)\/products$/);
  });

  it("handle booleans in path", () => {
    const flyyerTrue = new Flyyer({ project: "project", path: ["products", true as any] });
    expect(flyyerTrue.href()).toMatch(/^https:\/\/cdn.flyyer.io\/v2\/project\/_\/__v=(\d+)\/products\/true$/);
    // Ignores falsy values
    const flyyerFalse = new Flyyer({ project: "project", path: ["products", false as any] });
    expect(flyyerFalse.href()).toMatch(/^https:\/\/cdn.flyyer.io\/v2\/project\/_\/__v=(\d+)\/products$/);
  });

  it("handle variables such as `title`", () => {
    const flyyer = new Flyyer({ project: "project", path: "about", variables: { title: "hello world" } });
    expect(flyyer.href()).toMatch(/^https:\/\/cdn.flyyer.io\/v2\/project\/_\/__v=(\d+)&title=hello\+world\/about$/);
  });

  it("can disable __v cache-bursting param", () => {
    const flyyer0 = new Flyyer({ project: "project", meta: { v: undefined } });
    expect(flyyer0.href()).toMatch(/^https:\/\/cdn.flyyer.io\/v2\/project\/_\/__v=(\d+)\/$/);
    const flyyer1 = new Flyyer({ project: "project", meta: { v: null } });
    expect(flyyer1.href()).toEqual("https://cdn.flyyer.io/v2/project/_/_/");
    const flyyer2 = new Flyyer({ project: "project", meta: { v: "" } });
    expect(flyyer2.href()).toEqual("https://cdn.flyyer.io/v2/project/_/__v=/");
    const flyyer3 = new Flyyer({ project: "project", meta: { v: false as any } });
    expect(flyyer3.href()).toEqual("https://cdn.flyyer.io/v2/project/_/__v=false/");
  });

  it("sets 'default' image as '_def' param", () => {
    const flyyer0 = new Flyyer({ project: "project", path: "path", default: "/static/product/1.png" });
    expect(flyyer0.href()).toMatch(
      /^https:\/\/cdn.flyyer.io\/v2\/project\/_\/__v=(\d+)&_def=%2Fstatic%2Fproduct%2F1.png\/path$/,
    );
    const flyyer1 = new Flyyer({ project: "project", path: "path", default: "https://www.flyyer.io/logo.png" });
    expect(flyyer1.href()).toMatch(
      /^https:\/\/cdn.flyyer.io\/v2\/project\/_\/__v=(\d+)&_def=https%3A%2F%2Fwww.flyyer.io%2Flogo.png\/path$/,
    );
  });
});
