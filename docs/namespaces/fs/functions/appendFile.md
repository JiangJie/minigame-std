[**minigame-std**](../../../README.md) • **Docs**

***

[minigame-std](../../../README.md) / [fs](../README.md) / appendFile

# Function: appendFile()

```ts
function appendFile(filePath, contents): AsyncVoidIOResult
```

向文件追加内容。

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `filePath` | `string` | 文件路径。 |
| `contents` | [`WriteFileContent`](../type-aliases/WriteFileContent.md) | 要追加的内容。 |

## Returns

`AsyncVoidIOResult`

追加成功返回 true 的异步操作结果。

## Defined in

[fs/fs\_async.ts:166](https://github.com/JiangJie/minigame-std/blob/e98ab0af7ad78dc07fcec865ee164ff1e7efe9cf/src/std/fs/fs_async.ts#L166)
