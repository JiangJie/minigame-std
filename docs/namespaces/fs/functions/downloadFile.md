[**minigame-std**](../../../README.md) • **Docs**

***

[minigame-std](../../../README.md) / [fs](../README.md) / downloadFile

# Function: downloadFile()

```ts
function downloadFile(
   fileUrl, 
   filePath, 
options?): FetchTask<WechatMinigame.DownloadFileSuccessCallbackResult | Response>
```

下载文件。

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `fileUrl` | `string` | 文件的网络 URL。 |
| `filePath` | `string` | 下载后文件存储的路径。 |
| `options`? | [`UnionDownloadFileOptions`](../type-aliases/UnionDownloadFileOptions.md) | 可选的请求初始化参数。 |

## Returns

`FetchTask`\<`WechatMinigame.DownloadFileSuccessCallbackResult` \| `Response`\>

下载成功返回原始结果。

## Defined in

[fs/mod.ts:192](https://github.com/JiangJie/minigame-std/blob/541deb559aa54bb90a9c59ed9d62e2fa15307533/src/std/fs/mod.ts#L192)
