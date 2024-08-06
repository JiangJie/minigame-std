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

[fs/fs\_async.ts:215](https://github.com/JiangJie/minigame-std/blob/e98ab0af7ad78dc07fcec865ee164ff1e7efe9cf/src/std/fs/fs_async.ts#L215)
