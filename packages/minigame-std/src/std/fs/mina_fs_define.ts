/**
 * @internal
 * 小游戏平台文件系统请求的内部类型定义。
 */
import type { FetchInit } from '@happy-ts/fetch-t';

/**
 * 下载文件的选项。
 */
export interface DownloadFileOptions extends Omit<WechatMinigame.DownloadFileOption, 'url' | 'filePath' | 'header' | 'success' | 'fail'> {
    headers?: Record<string, string>;
    onProgress?: FetchInit['onProgress'];
}

/**
 * 上传文件的选项。
 */
export interface UploadFileOptions extends Omit<WechatMinigame.UploadFileOption, 'url' | 'filePath' | 'name' | 'header' | 'success' | 'fail'> {
    headers?: Record<string, string>;
    /**
     * 可选的文件名称。
     */
    name?: string;
}
