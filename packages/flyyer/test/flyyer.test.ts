import { dequal } from "dequal/lite";

import { Flyyer, isEqualFlyyer, DECODE_JWT_TOKEN } from "../dist/index";

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

  it("encodes url with hmac signature", () => {
    const flyyer1 = new Flyyer({
      project: "project",
      path: "/products/1",
      secret: "sg1j0HVy9bsMihJqa8Qwu8ZYgCYHG0tx",
      strategy: "HMAC",
      meta: { width: 1080 },
    });
    const flyyer2 = new Flyyer({ ...flyyer1, meta: { ...flyyer1.meta, v: 123 } });

    // if __v changes the signature remains the same
    const regex = /^https:\/\/cdn.flyyer.io\/v2\/project\/c5bd759442845a20\/__v=(\d+)&_w=1080\/products\/1$/;
    expect(flyyer1.href()).toMatch(regex);
    expect(flyyer2.href()).toMatch(regex);
  });

  it("sets 'default' image as '_def' param in HMAC", () => {
    const flyyer0 = new Flyyer({
      project: "project",
      path: "path",
      default: "/static/product/1.png",
      secret: "sg1j0HVy9bsMihJqa8Qwu8ZYgCYHG0tx",
      strategy: "HMAC",
      meta: { v: null },
    });
    expect(flyyer0.href()).toEqual(
      "https://cdn.flyyer.io/v2/project/89312d0aaddd60fe/_def=%2Fstatic%2Fproduct%2F1.png/path",
    );
  });

  it("compares two instances", async () => {
    const flyyer0 = new Flyyer({
      project: "project",
      path: "products/1",
      variables: { title: "Hello" },
      meta: { v: "anything" },
    });
    const flyyer1 = new Flyyer({ project: "project", path: ["/products", "1"], variables: { title: "Hello" } });
    const flyyer2 = new Flyyer({ project: "project", path: ["/products", "1"], variables: { title: "Bye" } });
    expect(flyyer0.href()).not.toEqual(flyyer1.href()); // different __v
    expect(isEqualFlyyer(flyyer0, flyyer0, dequal)).toEqual(true);
    expect(isEqualFlyyer(flyyer0, flyyer1, dequal)).toEqual(true);
    expect(isEqualFlyyer(flyyer0, flyyer2, dequal)).toEqual(false);
  });

  it("encodes url with JWT signature", () => {
    const key = "sg1j0HVy9bsMihJqa8Qwu8ZYgCYHG0tx";
    const flyyer = new Flyyer({
      project: "project",
      path: "products/1",
      secret: key,
      strategy: "JWT",
      meta: { v: null },
    });
    const token = flyyer
      .href()
      .match(/(jwt-)(.*)(\??)/g)?.[0]
      ?.slice(4);
    const decoded = token ? DECODE_JWT_TOKEN(token) : "";
    expect(decoded["params"]).toEqual({ var: {} });
    expect(decoded["path"]).toEqual("/products/1");
  });

  it("encodes url with JWT signature with variables", () => {
    const key = "sg1j0HVy9bsMihJqa8Qwu8ZYgCYHG0tx";
    const flyyer = new Flyyer({
      project: "project",
      path: "products/1",
      secret: key,
      strategy: "JWT",
      variables: { title: "Hello world!" },
    });
    const token = flyyer
      .href()
      .match(/(jwt-)(.*)(\??)/g)?.[0]
      ?.slice(4);
    const decoded = token ? DECODE_JWT_TOKEN(token) : "";
    expect(decoded["params"]).toEqual({ var: { title: "Hello world!" } });
    expect(decoded["path"]).toEqual("/products/1");
  });

  it("sets default image in JWT with relative URL", () => {
    const key = "sg1j0HVy9bsMihJqa8Qwu8ZYgCYHG0tx";
    const flyyer0 = new Flyyer({
      project: "project",
      path: "path",
      default: "/static/product/1.png",
      secret: key,
      strategy: "JWT",
      meta: { v: null },
    });

    const token = flyyer0
      .href()
      .match(/(jwt-)(.*)(\??)/g)?.[0]
      ?.slice(4);
    const decoded = token ? DECODE_JWT_TOKEN(token) : "";
    expect(decoded["params"]["def"]).toEqual("/static/product/1.png");
  });

  it("sets default image in JWT with absolute URL", () => {
    const key = "sg1j0HVy9bsMihJqa8Qwu8ZYgCYHG0tx";
    const flyyer0 = new Flyyer({
      project: "project",
      path: "path",
      default: "https://flyyer.io/static/product/1.png",
      secret: key,
      strategy: "JWT",
      meta: { v: null },
    });

    const token = flyyer0
      .href()
      .match(/(jwt-)(.*)(\??)/g)?.[0]
      ?.slice(4);
    const decoded = token ? DECODE_JWT_TOKEN(token) : "";
    expect(decoded["params"]["def"]).toEqual("https://flyyer.io/static/product/1.png");
    expect(decoded["path"]).toEqual("/path");
    expect(decoded["params"]["var"]).toEqual({});
  });

  it("encodes URL with JWT and has correct data", () => {
    const key = "sg1j0HVy9bsMihJqa8Qwu8ZYgCYHG0tx";
    const flyyer0 = new Flyyer({
      project: "project",
      path: "path/to/product",
      default: "https://flyyer.io/static/product/1.png",
      secret: key,
      strategy: "JWT",
      meta: { id: "h1", height: "200", width: 100, resolution: "90" },
      variables: { title: "Hello!" },
    });

    const token = flyyer0
      .href()
      .match(/(jwt-)(.*)(\??)/g)?.[0]
      ?.slice(4);
    const decoded = token ? DECODE_JWT_TOKEN(token) : "";
    expect(decoded["params"]).toEqual({
      i: "h1",
      h: "200",
      w: 100,
      r: "90",
      def: "https://flyyer.io/static/product/1.png",
      var: { title: "Hello!" },
    });
    expect(decoded["path"]).toEqual("/path/to/product");
  });
});
