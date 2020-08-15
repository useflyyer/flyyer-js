import Flayyer, { toQuery } from "../src/flayyer";

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

  it("encodes url", () => {
    const flayyer = new Flayyer<{ title: string }>({
      tenant: "tenant",
      deck: "deck",
      template: "template",
      variables: {
        title: "Hello world!",
      },
    });

    const href = flayyer.href();

    expect(href.startsWith("https://flayyer.host/v2/tenant/deck/template.jpeg?__v=")).toBeTruthy();
    expect(href.includes("&title=Hello+world%21")).toBeTruthy();
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
