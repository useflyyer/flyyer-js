import { FlyyerRender, Flyyer, toQuery, isEqualFlyyer, isEqualFlyyerRender } from "../src/flyyer";

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

  it("shallow clones properties but deep clones 'meta' property", () => {
    const flyyer = new Flyyer({ project: "project", meta: { width: 1080 } });
    const clone = flyyer.clone();
    clone.project = "flyyer";
    clone.meta.width = 400;
    expect(clone.project).not.toEqual(flyyer.project);
    expect(clone.meta.width).not.toEqual(flyyer.meta.width);
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
    expect(isEqualFlyyer(flyyer0, flyyer0)).toEqual(true);
    expect(isEqualFlyyer(flyyer0, flyyer1)).toEqual(true);
    expect(isEqualFlyyer(flyyer0, flyyer2)).toEqual(false);
  });
});

describe("FlyyerRender", () => {
  it("FlyyerRender is instantiable", () => {
    const flyyer = new FlyyerRender({ tenant: "", deck: "", template: "" });
    expect(flyyer).toBeInstanceOf(FlyyerRender);
  });

  it("raises error if missing arguments", () => {
    const executer = (args?: any) => new FlyyerRender(args).href();

    expect(() => executer()).toThrow("FlyyerRender constructor must not be empty");
    expect(() => executer({ tenant: "" })).toThrow("Missing 'deck' property");
    expect(() => executer({ tenant: "", deck: "", template: "" })).not.toThrow();
  });

  it("shallow clones properties but deep clones 'meta' property", () => {
    const flyyer = new FlyyerRender({ tenant: "tenant", deck: "deck", template: "template", meta: { width: 1080 } });
    const clone = flyyer.clone();
    clone.deck = "flyyer";
    clone.meta.width = 400;
    expect(clone.deck).not.toEqual(flyyer.deck);
    expect(clone.meta.width).not.toEqual(flyyer.meta.width);
  });

  const DEFAULTS = {
    tenant: "tenant",
    deck: "deck",
    template: "template",
  };

  it("no queryparams no '?'", () => {
    const flyyer = new FlyyerRender({
      ...DEFAULTS,
      meta: { v: null },
    });
    expect(flyyer.href()).toEqual("https://cdn.flyyer.io/render/v2/tenant/deck/template.jpeg");
  });

  it("encodes url", () => {
    const flyyer = new FlyyerRender({
      ...DEFAULTS,
      variables: {
        title: "Hello world!",
        description: "",
      },
    });
    const href = flyyer.href();
    expect(href).toMatch(
      /^https:\/\/cdn.flyyer.io\/render\/v2\/tenant\/deck\/template\.jpeg\?__v=(\d+)&title=Hello\+world%21&description=$/,
    );
  });

  it("encodes url and skips undefined values", () => {
    const flyyer = new FlyyerRender({
      ...DEFAULTS,
      variables: {
        title: "title",
        description: undefined,
      },
    });
    const href = flyyer.href();
    expect(href).toMatch(/^https:\/\/cdn.flyyer.io\/render\/v2\/tenant\/deck\/template\.jpeg\?__v=(\d+)&title=title$/);
  });

  it("encodes url and convert null values to empty string", () => {
    const flyyer = new FlyyerRender({
      ...DEFAULTS,
      variables: {
        title: "title",
        description: null,
      },
    });
    const href = flyyer.href();
    expect(href).toMatch(
      /^https:\/\/cdn.flyyer.io\/render\/v2\/tenant\/deck\/template\.jpeg\?__v=(\d+)&title=title&description=$/,
    );
  });

  it("encodes url with meta values", () => {
    const flyyer = new FlyyerRender({
      ...DEFAULTS,
      variables: {
        title: "title",
      },
      meta: {
        agent: "whatsapp",
        locale: "es-CL",
        height: 100,
        width: "200",
        id: "dev forgot to encode",
        v: null,
      },
      extension: "png",
    });
    const href = flyyer.href();
    expect(href).toMatch(
      /^https:\/\/cdn.flyyer.io\/render\/v2\/tenant\/deck\/template\.png\?__id=dev\+forgot\+to\+encode&_w=200&_h=100&_ua=whatsapp&_loc=es-CL&title=title$/,
    );
  });

  it("compares two instances", async () => {
    const flyyer0 = new FlyyerRender({
      ...DEFAULTS,
      variables: { title: "Hello" },
      meta: { v: "anything" },
    });
    const flyyer1 = new FlyyerRender({ ...DEFAULTS, variables: { title: "Hello" } });
    const flyyer2 = new FlyyerRender({ ...DEFAULTS, variables: { title: "Bye" } });
    expect(flyyer0.href()).not.toEqual(flyyer1.href()); // different __v
    expect(isEqualFlyyerRender(flyyer0, flyyer0)).toEqual(true);
    expect(isEqualFlyyerRender(flyyer0, flyyer1)).toEqual(true);
    expect(isEqualFlyyerRender(flyyer0, flyyer2)).toEqual(false);
  });
});

describe("toQuery", () => {
  it("stringifies object of primitives", () => {
    // @ts-expect-error will complain about duplicate identifier `b`
    const object = { a: "hello", b: 100, c: false, d: null, e: undefined, b: 999 };
    const str = toQuery(object);
    expect(str).toEqual(`a=hello&b=999&c=false&d=`);
  });

  it("stringifies a complex object", () => {
    const object = {
      a: { aa: "bar", ab: "foo" },
      b: [{ c: "foo" }, { c: "bar" }],
    };
    const str = toQuery(object);
    expect(str).not.toEqual(decodeURI(str));
    expect(decodeURI(str)).toEqual(`a[aa]=bar&a[ab]=foo&b[0][c]=foo&b[1][c]=bar`);
  });

  it("encodes special characters", () => {
    const object = { title: "Ñandú" };
    const str = toQuery(object);
    expect(str).toEqual(`title=%C3%91and%C3%BA`);
    expect(decodeURIComponent("%C3%91")).toEqual("Ñ");
    expect(decodeURI(str)).toEqual(`title=Ñandú`);
  });

  it("encodes Date", () => {
    const now = new Date();
    const object = { timestamp: now };
    const str = toQuery(object);
    expect(str).toEqual(`timestamp=${encodeURIComponent(now.toISOString())}`);
  });
});
