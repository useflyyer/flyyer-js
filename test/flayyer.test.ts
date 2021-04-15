import { FlayyerIO, FlayyerAI, toQuery } from "../src/flayyer";

describe("Flayyer AI", () => {
  it("FlayyerAI is instantiable", () => {
    const flayyer = new FlayyerAI({ project: "" });
    expect(flayyer).toBeInstanceOf(FlayyerAI);
  });

  it("raises error if missing arguments", () => {
    const executer = (args?: any) => new FlayyerAI(args).href();

    expect(() => executer()).toThrow("Flayyer constructor must not be empty");
    expect(() => executer({ project: "" })).not.toThrow();
  });

  it("without path fallbacks to root", () => {
    const flayyer = new FlayyerAI({ project: "project" });
    expect(flayyer.href()).toMatch(/^https:\/\/flayyer.ai\/v2\/project\/_\/__v=(\d+)\/$/);
  });

  it("handles single path", () => {
    const flayyer = new FlayyerAI({ project: "project", path: "about" });
    expect(flayyer.href()).toMatch(/^https:\/\/flayyer.ai\/v2\/project\/_\/__v=(\d+)\/about$/);
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
      const flayyer = new FlayyerAI({ project: "project", path: path as any });
      expect(flayyer.href()).toMatch(/^https:\/\/flayyer.ai\/v2\/project\/_\/__v=(\d+)\/dashboard\/company$/);
    }
  });

  it("handle numbers in path", () => {
    const flayyer1 = new FlayyerAI({ project: "project", path: ["products", 1] });
    expect(flayyer1.href()).toMatch(/^https:\/\/flayyer.ai\/v2\/project\/_\/__v=(\d+)\/products\/1$/);
    const flayyer0 = new FlayyerAI({ project: "project", path: ["products", 0] });
    expect(flayyer0.href()).toMatch(/^https:\/\/flayyer.ai\/v2\/project\/_\/__v=(\d+)\/products\/0$/);
    const flayyerInf = new FlayyerAI({ project: "project", path: ["products", Infinity] });
    expect(flayyerInf.href()).toMatch(/^https:\/\/flayyer.ai\/v2\/project\/_\/__v=(\d+)\/products\/Infinity$/);
    // Ignores falsy values
    const flayyerNaN = new FlayyerAI({ project: "project", path: ["products", NaN] });
    expect(flayyerNaN.href()).toMatch(/^https:\/\/flayyer.ai\/v2\/project\/_\/__v=(\d+)\/products$/);
  });

  it("handle booleans in path", () => {
    const flayyerTrue = new FlayyerAI({ project: "project", path: ["products", true as any] });
    expect(flayyerTrue.href()).toMatch(/^https:\/\/flayyer.ai\/v2\/project\/_\/__v=(\d+)\/products\/true$/);
    // Ignores falsy values
    const flayyerFalse = new FlayyerAI({ project: "project", path: ["products", false as any] });
    expect(flayyerFalse.href()).toMatch(/^https:\/\/flayyer.ai\/v2\/project\/_\/__v=(\d+)\/products$/);
  });

  it("handle variables such as `title`", () => {
    const flayyer = new FlayyerAI({ project: "project", path: "about", variables: { title: "hello world" } });
    expect(flayyer.href()).toMatch(/^https:\/\/flayyer.ai\/v2\/project\/_\/__v=(\d+)&title=hello\+world\/about$/);
  });

  it("can disable __v cache-bursting param", () => {
    const flayyer0 = new FlayyerAI({ project: "project", meta: { v: undefined } });
    expect(flayyer0.href()).toMatch(/^https:\/\/flayyer.ai\/v2\/project\/_\/__v=(\d+)\/$/);
    const flayyer1 = new FlayyerAI({ project: "project", meta: { v: null } });
    expect(flayyer1.href()).toEqual("https://flayyer.ai/v2/project/_/_/");
    const flayyer2 = new FlayyerAI({ project: "project", meta: { v: "" } });
    expect(flayyer2.href()).toEqual("https://flayyer.ai/v2/project/_/__v=/");
    const flayyer3 = new FlayyerAI({ project: "project", meta: { v: false as any } });
    expect(flayyer3.href()).toEqual("https://flayyer.ai/v2/project/_/__v=false/");
  });
});

describe("Flayyer IO", () => {
  it("Flayyer is instantiable", () => {
    const flayyer = new FlayyerIO({ tenant: "", deck: "", template: "" });
    expect(flayyer).toBeInstanceOf(FlayyerIO);
  });

  it("raises error if missing arguments", () => {
    const executer = (args?: any) => new FlayyerIO(args).href();

    expect(() => executer()).toThrow("Flayyer constructor must not be empty");
    expect(() => executer({ tenant: "" })).toThrow("Missing 'deck' property");
    expect(() => executer({ tenant: "", deck: "", template: "" })).not.toThrow();
  });

  const DEFAULTS = {
    tenant: "tenant",
    deck: "deck",
    template: "template",
  };

  it("no queryparams no '?'", () => {
    const flayyer = new FlayyerIO({
      ...DEFAULTS,
      meta: { v: null },
    });
    expect(flayyer.href()).toEqual("https://flayyer.io/v2/tenant/deck/template.jpeg");
  });

  it("encodes url", () => {
    const flayyer = new FlayyerIO({
      ...DEFAULTS,
      variables: {
        title: "Hello world!",
        description: "",
      },
    });
    const href = flayyer.href();
    expect(href).toMatch(
      /^https:\/\/flayyer.io\/v2\/tenant\/deck\/template\.jpeg\?__v=(\d+)&title=Hello\+world%21&description=$/,
    );
  });

  it("encodes url and skips undefined values", () => {
    const flayyer = new FlayyerIO({
      ...DEFAULTS,
      variables: {
        title: "title",
        description: undefined,
      },
    });
    const href = flayyer.href();
    expect(href).toMatch(/^https:\/\/flayyer.io\/v2\/tenant\/deck\/template\.jpeg\?__v=(\d+)&title=title$/);
  });

  it("encodes url and convert null values to empty string", () => {
    const flayyer = new FlayyerIO({
      ...DEFAULTS,
      variables: {
        title: "title",
        description: null,
      },
    });
    const href = flayyer.href();
    expect(href).toMatch(
      /^https:\/\/flayyer.io\/v2\/tenant\/deck\/template\.jpeg\?__v=(\d+)&title=title&description=$/,
    );
  });

  it("encodes url with meta values", () => {
    const flayyer = new FlayyerIO({
      ...DEFAULTS,
      variables: {
        title: "title",
      },
      meta: {
        agent: "whatsapp",
        height: 100,
        width: "200",
        id: "dev forgot to encode",
        v: null,
      },
      extension: "png",
    });
    const href = flayyer.href();
    expect(href).toMatch(
      /^https:\/\/flayyer.io\/v2\/tenant\/deck\/template\.png\?__id=dev\+forgot\+to\+encode&_w=200&_h=100&_ua=whatsapp&title=title$/,
    );
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
