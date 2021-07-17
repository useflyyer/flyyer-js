/**
 * Meta variables usually have values assigned by Flyyer depending on how and where images are rendered.
 *
 * You can force these values here.
 * @example
 * const meta: FlyyerMetaVariables ={
 *   width: 1080, // in pixels
 *   height: 1080, // in pixels
 *   v: null, // disable cache-burst
 *   id: "my-id", // analytics id
 * }
 * const flyyerRender = new FlyyerRender({ meta });
 * const flyyer = new Flyyer({ meta });
 * @example
 * `https://cdn.flyyer.io/render/v2/flyyer/default/main.jpeg?__v=disabled`
 * `https://cdn.flyyer.io/render/v2/flyyer/default/main.jpeg?_w=1080&_h=1080`
 * `https://cdn.flyyer.io/v2/flyyer-com/_/_/?__v=disabled`
 * `https://cdn.flyyer.io/v2/flyyer-com/_/_w=1080&_h=1080/marketplace`
 */
export interface FlyyerMetaVariables {
  /**
   * Force crawler user agent.
   * Converted to `_ua=` on `flyyer.href()` if set.
   *
   * Full list at https://docs.flyyer.io/docs/features/agent-detection
   * @example
   * "whatsapp" // _ua=whatsapp
   * "facebook" // _ua=facebook
   * "twitter" // _ua=twitter
   * "instagram" // _ua=instagram
   */
  agent?: string | null;
  /*
   * Force language instead of using the viewer's locale.
   * This is useful when you have your website with international routes (eg: `example.com/de` or `de.example.com`)
   * Converted to `_loc=` on `flyyer.href()` if set.
   */
  locale?: string | null;
  /**
   * Pixels (integer value).
   * Converted to `_w=` on `flyyer.href()` if set.
   * @example
   * 1200 // _w=1200 // default value most of the time
   * 1080 // _w=1080
   * @example
   * `https://cdn.flyyer.io/render/v2/flyyer/default/main.jpeg?_w=1080&_h=1080`
   * `https://cdn.flyyer.io/v2/flyyer-com/_/_w=1080&_h=1080/jobs`
   */
  width?: string | number | null;
  /**
   * Pixels (integer value).
   * Converted to `_h=` on `flyyer.href()` if set.
   * @example
   * 1200 // _h=630 // default value most of the time
   * 1080 // _h=1080
   * 1080 // _h=1920
   * @example
   * `https://cdn.flyyer.io/render/v2/flyyer/default/main.jpeg?_w=1080&_h=1080`
   * `https://cdn.flyyer.io/v2/flyyer-com/_/_w=1080&_h=1080/jobs`
   */
  height?: string | number | null;
  /**
   * Range from [0.0, 1.0]
   * Converted to `_res=` on `flyyer.href()` if set.
   */
  resolution?: string | number | null;
  /**
   * To identify your links on the analytics report
   * Converted to `__id=` on `flyyer.href()` if set.
   */
  id?: string | number | null;
  /**
   * Cache invalidator, set to `null` or empty string `""` to disable it.
   * Converted to `__v=` on `flyyer.href()` if set.
   *
   * **If you are using Flyyer inside your website for to render images we recommend disabling it to use browser's cache.**
   * @example
   * const flyyer = new FlyyerRender({ meta: { v: null } }); // disabled
   * @example
   * __v=null // disabled
   * __v="1" // constant
   * __v=undefined // `__v=123123` a timestamp will be used.
   * @example
   * `https://cdn.flyyer.io/render/v2/flyyer/default/main.jpeg?title=Hello&__v=123123` // by default is a timestamp
   * `https://cdn.flyyer.io/render/v2/flyyer/default/main.jpeg?title=Hello&__v=` // disabled to use browser's cache
   */
  v?: string | number | null;
}

/**
 * Compare two `FlyyerMetaVariables` object. Ignores `__v` param.
 */
export function isEqualFlyyerMeta(ameta: FlyyerMetaVariables, bmeta: FlyyerMetaVariables): boolean {
  const metas = ["width", "height", "agent", "id", "locale", "resolution"] as const;
  for (const meta of metas) {
    if (ameta[meta] !== bmeta[meta]) {
      return false;
    }
  }
  return true;
}
