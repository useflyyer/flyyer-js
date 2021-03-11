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
    expect(flayyer.href()).toMatch(/^https:\/\/flayyer.ai\/v2\/project\/_\/__v=(\d+)\//);
  });

  it("handles single path", () => {
    const flayyer = new FlayyerAI({ project: "project", path: "about" });
    expect(flayyer.href()).toMatch(/^https:\/\/flayyer.ai\/v2\/project\/_\/__v=(\d+)\/about/);
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
      expect(flayyer.href()).toMatch(/^https:\/\/flayyer.ai\/v2\/project\/_\/__v=(\d+)\/dashboard\/company/);
    }
  });

  it("can have variables as title", () => {
    const flayyer = new FlayyerAI({ project: "project", path: "about", variables: { title: "hello world" } });
    expect(flayyer.href()).toMatch(/^https:\/\/flayyer.ai\/v2\/project\/_\/__v=(\d+)&title=hello\+world\/about/);
  });

  it("can have numbers in path", () => {
    const flayyer1 = new FlayyerAI({ project: "project", path: ["products", 1] });
    expect(flayyer1.href()).toMatch(/^https:\/\/flayyer.ai\/v2\/project\/_\/__v=(\d+)\/products\/1/);
    const flayyer0 = new FlayyerAI({ project: "project", path: ["products", 0] });
    expect(flayyer0.href()).toMatch(/^https:\/\/flayyer.ai\/v2\/project\/_\/__v=(\d+)\/products\/0/);
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

  it("encodes url", () => {
    const flayyer = new FlayyerIO({
      ...DEFAULTS,
      variables: {
        title: "Hello world!",
        description: "",
      },
    });
    const href = flayyer.href();

    expect(href.startsWith("https://flayyer.io/v2/tenant/deck/template.jpeg?__v=")).toBeTruthy();
    expect(href).toEqual(expect.stringContaining("&title=Hello+world%21"));
    expect(href).toEqual(expect.stringContaining("&description="));
    expect(href).toEqual(String(flayyer)); // test `.toString()`
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

    expect(href.startsWith("https://flayyer.io/v2/tenant/deck/template.jpeg?__v=")).toBeTruthy();
    expect(href).toEqual(expect.stringContaining("&title=title"));
    expect(href).toEqual(expect.not.stringContaining("&description="));
    expect(href).toEqual(expect.not.stringContaining("&description=undefined"));
    expect(href).toEqual(expect.not.stringContaining("&description=null"));
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

    expect(href.startsWith("https://flayyer.io/v2/tenant/deck/template.jpeg?__v=")).toBeTruthy();
    expect(href).toEqual(expect.stringContaining("&title=title"));
    expect(href).toEqual(expect.stringContaining("&description="));
    expect(href).toEqual(expect.not.stringContaining("&description=undefined"));
    expect(href).toEqual(expect.not.stringContaining("&description=null"));
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
    });
    const href = flayyer.href();

    expect(href.startsWith("https://flayyer.io/v2/tenant/deck/template.jpeg?__v=")).toBeTruthy();
    expect(href).toEqual(expect.stringContaining("&title=title"));
    expect(href).toEqual(expect.stringContaining("_ua=whatsapp"));
    expect(href).toEqual(expect.stringContaining("_h=100"));
    expect(href).toEqual(expect.stringContaining("_w=200"));
    expect(href).toEqual(expect.stringContaining("__id=dev+forgot+to+encode"));
    // TODO: use regex to verify empty __v
    expect(href).toEqual(expect.stringContaining("__v="));
    expect(href).toEqual(expect.not.stringContaining("__v=1"));
  });
});

describe("toQuery", () => {
  it("stringifies object of primitives", () => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const object = { a: "hello", b: 100, c: false, d: null, b: 999 };
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
});
