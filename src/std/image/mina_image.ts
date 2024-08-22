export function createImageFromUrl(url: string): WechatMinigame.Image {
    const img = wx.createImage();
    img.src = url;

    return img;
}

export function createImageFromFile(filePath: string): WechatMinigame.Image {
    return createImageFromUrl(filePath);
}