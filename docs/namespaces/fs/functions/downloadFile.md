[**minigame-std**](../../../README.md) • **Docs**

***

[minigame-std](../../../README.md) / [fs](../README.md) / downloadFile

# Function: downloadFile()

```ts
function downloadFile(
   fileUrl, 
   filePath, 
requestInit?): AsyncIOResult<boolean>
```

下载文件。

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `fileUrl` | `string` | 文件的网络 URL。 |
| `filePath` | `string` | 下载后文件存储的路径。 |
| `requestInit`? | `RequestInit` | 可选的请求初始化参数。 |

## Returns

`AsyncIOResult`\<`boolean`\>

下载成功返回 true 的异步操作结果。

## Defined in

[fs/mod.ts:164](https://github.com/JiangJie/minigame-std/blob/d86e790fe8486ddfc8ce953df31d30618f403d3b/src/std/fs/mod.ts#L164)
