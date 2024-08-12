[**minigame-std**](../../../README.md) • **Docs**

***

[minigame-std](../../../README.md) / [fs](../README.md) / uploadFile

# Function: uploadFile()

```ts
function uploadFile(
   filePath, 
   fileUrl, 
options?): FetchTask<WechatMinigame.UploadFileSuccessCallbackResult | Response>
```

上传本地文件。

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `filePath` | `string` | 需要上传的文件路径。 |
| `fileUrl` | `string` | 目标服务器的 URL。 |
| `options`? | [`UnionUploadFileOptions`](../type-aliases/UnionUploadFileOptions.md) | 可选的请求初始化参数。 |

## Returns

`FetchTask`\<`WechatMinigame.UploadFileSuccessCallbackResult` \| `Response`\>

上传成功返回原始结果。

## Defined in

[src/std/fs/fs\_async.ts:239](https://github.com/JiangJie/minigame-std/blob/22787d0fd0cff776ed579de48ccf7523d9e4ce53/src/std/fs/fs_async.ts#L239)
