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

[src/std/fs/fs\_async.ts:165](https://github.com/JiangJie/minigame-std/blob/0b3f4c24a764d15c8d4cfbfab659d3f6c53dfd93/src/std/fs/fs_async.ts#L165)
