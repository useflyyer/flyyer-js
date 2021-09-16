import type { FlyyerExtension } from "./ext";
import type { FlyyerMetaVariables } from "./meta";
import type { FlyyerVariables } from "./variables";

export interface FlyyerCommonParams<T extends FlyyerVariables> {
  /**
   * Optional. Leave empty `""` or as `_` to always grab the latest version.
   */
  version?: string | number | null;

  /**
   * Supported extensions are: `"jpeg" | "jpg" | "png" | "webp"`
   */
  extension?: FlyyerExtension | null;

  /**
   * JS serializable variables.
   * @example
   * const flyyerRender = new FlyyerRender({ variables: { title: "Hello world", image: "https://example.com/logo.png" } })
   * console.log(flyyerRender.href())
   * // https://cdn.flyyer.io/r/v2/TENANT/DECK/TEMPLATE.jpeg?title=Hello+world&image=https%3A%2F%2Fexample.com%2Flogo.png
   * @example
   * const flyyer = new Flyyer({ variables: { title: "Hello world", image: "https://example.com/logo.png" } })
   * console.log(flyyer.href())
   * // https://cdn.flyyer.io/v2/flyyer-com/_/title=Hello+world&image=https%3A%2F%2Fexample.com%2Flogo.png/
   */
  variables?: T | null;

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
   * `https://cdn.flyyer.io/r/v2/flyyer/default/main.jpeg?__v=disabled`
   * `https://cdn.flyyer.io/r/v2/flyyer/default/main.jpeg?_w=1080&_h=1080`
   * `https://cdn.flyyer.io/v2/flyyer-com/_/_/?__v=disabled`
   * `https://cdn.flyyer.io/v2/flyyer-com/_/_w=1080&_h=1080/marketplace`
   */
  meta?: FlyyerMetaVariables | null;

  secret?: string | undefined | null;
  strategy?: "JWT" | "HMAC" | undefined | null;
}
