import { toQuery } from "../src/query";

describe("toQuery", () => {
  it("stringifies object of primitives", () => {
    // @ts-expect-error will complain about duplicate identifier `b`
    const object = { a: "hello", b: 100, c: false, d: null, e: undefined, b: 999 }; // eslint-disable-line no-dupe-keys
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
