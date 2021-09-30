import { FlyyerRender } from "../src/render";

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

  const DEFAULTS = {
    tenant: "tenant",
    deck: "deck",
    template: "template",
  };

  it("no queryparams no '?'", () => {
    const flyyer = new FlyyerRender({
      extension: "jpeg",
      ...DEFAULTS,
      meta: { v: null },
    });
    expect(flyyer.href()).toEqual("https://cdn.flyyer.io/r/v2/tenant/deck/template.jpeg");
  });

  it("encodes url", () => {
    const flyyer = new FlyyerRender({
      extension: "jpeg",
      ...DEFAULTS,
      variables: {
        title: "Hello world!",
        description: "",
      },
    });
    const href = flyyer.href();
    expect(href).toMatch(
      /^https:\/\/cdn.flyyer.io\/r\/v2\/tenant\/deck\/template\.jpeg\?__v=(\d+)&title=Hello\+world%21&description=$/,
    );
  });

  it("encodes url and skips undefined values", () => {
    const flyyer = new FlyyerRender({
      ...DEFAULTS,
      extension: "jpeg",
      variables: {
        title: "title",
        description: undefined,
      },
    });
    const href = flyyer.href();
    expect(href).toMatch(/^https:\/\/cdn.flyyer.io\/r\/v2\/tenant\/deck\/template\.jpeg\?__v=(\d+)&title=title$/);
  });

  it("encodes url and convert null values to empty string", () => {
    const flyyer = new FlyyerRender({
      ...DEFAULTS,
      extension: "jpeg",
      variables: {
        title: "title",
        description: null,
      },
    });
    const href = flyyer.href();
    expect(href).toMatch(
      /^https:\/\/cdn.flyyer.io\/r\/v2\/tenant\/deck\/template\.jpeg\?__v=(\d+)&title=title&description=$/,
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
      /^https:\/\/cdn.flyyer.io\/r\/v2\/tenant\/deck\/template\.png\?__id=dev\+forgot\+to\+encode&_w=200&_h=100&_ua=whatsapp&_loc=es-CL&title=title$/,
    );
  });
});
