[**minigame-std**](../../../README.md)

***

[minigame-std](../../../README.md) / [fs](../README.md) / downloadFile

# Function: downloadFile()

## Call Signature

```ts
function downloadFile(fileUrl, options?): FetchTask<DownloadFileSuccessCallbackResult | DownloadFileTempResponse>
```

Defined in: [src/std/fs/fs\_async.ts:224](https://github.com/JiangJie/minigame-std/blob/ff3594872b1efbdbc13aabe99588385e855b50dc/src/std/fs/fs_async.ts#L224)

下载文件并保存到临时文件。

### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `fileUrl` | `string` | 文件的网络 URL。 |
| `options`? | [`UnionDownloadFileOptions`](../type-aliases/UnionDownloadFileOptions.md) | 可选参数。 |

### Returns

`FetchTask`\<`DownloadFileSuccessCallbackResult` \| `DownloadFileTempResponse`\>

下载操作的异步结果，成功时返回 true。

## Call Signature

```ts
function downloadFile(
   fileUrl, 
   filePath, 
options?): FetchTask<DownloadFileSuccessCallbackResult | Response>
```

Defined in: [src/std/fs/fs\_async.ts:232](https://github.com/JiangJie/minigame-std/blob/ff3594872b1efbdbc13aabe99588385e855b50dc/src/std/fs/fs_async.ts#L232)

下载文件。

### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `fileUrl` | `string` | 文件的网络 URL。 |
| `filePath` | `string` | 可选的下载后文件存储的路径，没传则存到临时文件。 |
| `options`? | [`UnionDownloadFileOptions`](../type-aliases/UnionDownloadFileOptions.md) | 可选的请求初始化参数。 |

### Returns

`FetchTask`\<`DownloadFileSuccessCallbackResult` \| `Response`\>

下载成功返回原始结果。
