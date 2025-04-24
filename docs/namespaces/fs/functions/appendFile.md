[**minigame-std**](../../../README.md)

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

[src/std/fs/fs\_async.ts:167](https://github.com/JiangJie/minigame-std/blob/ddafbfd7359780ec38a81aeff021a80d33e07eb0/src/std/fs/fs_async.ts#L167)
