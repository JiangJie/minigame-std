[**minigame-std**](../../../README.md) • **Docs**

***

[minigame-std](../../../README.md) / [fs](../README.md) / downloadFile

# Function: downloadFile()

## downloadFile(fileUrl, options)

```ts
function downloadFile(fileUrl, options?): FetchTask<WechatMinigame.DownloadFileSuccessCallbackResult | DownloadFileTempResponse>
```

下载文件并保存到临时文件。

### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `fileUrl` | `string` | 文件的网络 URL。 |
| `options`? | [`UnionDownloadFileOptions`](../type-aliases/UnionDownloadFileOptions.md) | 可选参数。 |

### Returns

`FetchTask`\<`WechatMinigame.DownloadFileSuccessCallbackResult` \| `DownloadFileTempResponse`\>

下载操作的异步结果，成功时返回 true。

### Defined in

[src/std/fs/fs\_async.ts:221](https://github.com/JiangJie/minigame-std/blob/ffbed6cccc22260d9da27c221c59422568396e08/src/std/fs/fs_async.ts#L221)

## downloadFile(fileUrl, filePath, options)

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

[src/std/fs/fs\_async.ts:229](https://github.com/JiangJie/minigame-std/blob/ffbed6cccc22260d9da27c221c59422568396e08/src/std/fs/fs_async.ts#L229)
