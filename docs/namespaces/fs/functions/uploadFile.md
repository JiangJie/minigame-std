[**minigame-std**](../../../README.md) • **Docs**

***

[minigame-std](../../../README.md) / [fs](../README.md) / uploadFile

# Function: uploadFile()

```ts
function uploadFile(
   filePath, 
   fileUrl, 
requestInit?): AsyncIOResult<boolean>
```

上传本地文件。

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `filePath` | `string` | 需要上传的文件路径。 |
| `fileUrl` | `string` | 目标服务器的 URL。 |
| `requestInit`? | `RequestInit` | 可选的请求初始化参数。 |

## Returns

`AsyncIOResult`\<`boolean`\>

上传成功返回 true 的异步操作结果。

## Defined in

[fs/mod.ts:202](https://github.com/JiangJie/minigame-std/blob/d86e790fe8486ddfc8ce953df31d30618f403d3b/src/std/fs/mod.ts#L202)
