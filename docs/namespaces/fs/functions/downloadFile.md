[**minigame-std**](../../../README.md)

***

[minigame-std](../../../README.md) / [fs](../README.md) / downloadFile

# Function: downloadFile()

## Call Signature

```ts
function downloadFile(fileUrl, options?): FetchTask<
  | WechatMinigame.DownloadFileSuccessCallbackResult
| DownloadFileTempResponse>
```

下载文件并保存到临时文件。

### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `fileUrl` | `string` | 文件的网络 URL。 |
| `options`? | [`UnionDownloadFileOptions`](../type-aliases/UnionDownloadFileOptions.md) | 可选参数。 |

### Returns

`FetchTask`\<
  \| `WechatMinigame.DownloadFileSuccessCallbackResult`
  \| `DownloadFileTempResponse`\>

下载操作的异步结果，成功时返回 true。

### Defined in

[src/std/fs/fs\_async.ts:224](https://github.com/JiangJie/minigame-std/blob/ddafbfd7359780ec38a81aeff021a80d33e07eb0/src/std/fs/fs_async.ts#L224)

## Call Signature

```ts
function downloadFile(
   fileUrl, 
   filePath, 
options?): FetchTask<WechatMinigame.DownloadFileSuccessCallbackResult | Response>
```

下载文件。

### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `fileUrl` | `string` | 文件的网络 URL。 |
| `filePath` | `string` | 可选的下载后文件存储的路径，没传则存到临时文件。 |
| `options`? | [`UnionDownloadFileOptions`](../type-aliases/UnionDownloadFileOptions.md) | 可选的请求初始化参数。 |

### Returns

`FetchTask`\<`WechatMinigame.DownloadFileSuccessCallbackResult` \| `Response`\>

下载成功返回原始结果。

### Defined in

[src/std/fs/fs\_async.ts:232](https://github.com/JiangJie/minigame-std/blob/ddafbfd7359780ec38a81aeff021a80d33e07eb0/src/std/fs/fs_async.ts#L232)
