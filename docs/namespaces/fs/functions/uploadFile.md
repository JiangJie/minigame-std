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

[fs/fs\_async.ts:210](https://github.com/JiangJie/minigame-std/blob/baaa9364b1809237ffe9720be3ef4dba617567c9/src/std/fs/fs_async.ts#L210)
