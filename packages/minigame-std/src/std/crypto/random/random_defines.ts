/**
 * UUID 类型。
 * @since 1.7.0
 * @example
 * ```ts
 * import { cryptos, type UUID } from 'minigame-std';
 *
 * const result = await cryptos.randomUUID();
 * if (result.isOk()) {
 *     const uuid: UUID = result.unwrap();
 *     console.log(uuid); // 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'
 * }
 * ```
 */
export type UUID = `${ string }-${ string }-${ string }-${ string }-${ string }`;