[**minigame-std**](../../../README.md)

***

[minigame-std](../../../README.md) / [fs](../README.md) / uploadFile

# Function: uploadFile()

```ts
function uploadFile(
   filePath, 
   fileUrl, 
options?): FetchTask<UploadFileSuccessCallbackResult | Response>
```

Defined in: [src/std/fs/fs\_async.ts:252](https://github.com/JiangJie/minigame-std/blob/fdb22241c47c2e98329a4c62befde728957e03ee/src/std/fs/fs_async.ts#L252)

上传本地文件。

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `filePath` | `string` | 需要上传的文件路径。 |
| `fileUrl` | `string` | 目标服务器的 URL。 |
| `options`? | [`UnionUploadFileOptions`](../type-aliases/UnionUploadFileOptions.md) | 可选的请求初始化参数。 |

## Returns

`FetchTask`\<`UploadFileSuccessCallbackResult` \| `Response`\>

上传成功返回原始结果。
