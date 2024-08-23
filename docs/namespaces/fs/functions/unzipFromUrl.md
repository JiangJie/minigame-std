[**minigame-std**](../../../README.md) • **Docs**

***

[minigame-std](../../../README.md) / [fs](../README.md) / unzipFromUrl

# Function: unzipFromUrl()

```ts
function unzipFromUrl(
   zipFileUrl, 
   targetPath, 
   options?): AsyncVoidIOResult
```

从网络下载 zip 文件并解压。

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `zipFileUrl` | `string` | Zip 文件的网络地址。 |
| `targetPath` | `string` | 要解压到的目标文件夹路径。 |
| `options`? | [`UnionDownloadFileOptions`](../type-aliases/UnionDownloadFileOptions.md) | 可选的下载参数。 |

## Returns

`AsyncVoidIOResult`

下载并解压操作的异步结果。

## Defined in

[src/std/fs/fs\_async.ts:271](https://github.com/JiangJie/minigame-std/blob/d842b492eda479274cfeb38a06f4c4255b5493bc/src/std/fs/fs_async.ts#L271)
