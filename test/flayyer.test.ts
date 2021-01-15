import { Flayyer, toQuery } from "../src/flayyer";

describe("Flayyer", () => {
  it("Flayyer is instantiable", () => {
    const flayyer = new Flayyer({ tenant: "", deck: "", template: "" });
    expect(flayyer).toBeInstanceOf(Flayyer);
  });

  it("raises error if missing arguments", () => {
    const executer = (args?: any) => new Flayyer(args).href();

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
    const flayyer = new Flayyer({
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
    const flayyer = new Flayyer({
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
    const flayyer = new Flayyer({
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
    const flayyer = new Flayyer({
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
  it("stringifies hash of primitives", () => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const hash = { a: "hello", b: 100, c: false, d: null, b: 999 };
    const str = toQuery(hash);
    expect(str).toEqual(`a=hello&b=999&c=false&d=`);
  });

  it("stringifies a complex hash", () => {
    const hash = {
      a: { aa: "bar", ab: "foo" },
      b: [{ c: "foo" }, { c: "bar" }],
    };
    const str = toQuery(hash);
    expect(str).not.toEqual(decodeURI(str));
    expect(decodeURI(str)).toEqual(`a[aa]=bar&a[ab]=foo&b[0][c]=foo&b[1][c]=bar`);
  });
});
