/**
 * @internal
 * 小游戏平台的图片创建实现。
 */

/**
 * 从 URL 创建图片对象。
 * @param url - 图片的 URL 地址。
 * @returns 返回小游戏平台的图片对象。
 */
export function createImageFromUrl(url: string): WechatMinigame.Image {
    const img = wx.createImage();
    img.src = url;

    return img;
}

/**
 * 从本地文件路径创建图片对象。
 * @param filePath - 图片文件的本地路径。
 * @returns 返回小游戏平台的图片对象。
 */
export function createImageFromFile(filePath: string): WechatMinigame.Image {
    return createImageFromUrl(filePath);
}