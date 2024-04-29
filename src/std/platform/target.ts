export type TargetType = 'wx' | 'web';

/**
 * 获取运行平台类型
 *
 * @returns {TargetType}
 */
export function getTargetType(): TargetType {
    return 'wx' in globalThis ? 'wx' : 'web';
}

/**
 * 判断是否在微信小游戏环境
 *
 * @returns {boolean} true - 微信小游戏; false - 其他
 */
export function isWx(): boolean {
    return getTargetType() === 'wx';
}

/**
 * 判断是否在浏览器环境
 *
 * @returns {boolean} true - 浏览器; false - 其他
 */
export function isWeb(): boolean {
    return getTargetType() === 'web';
}