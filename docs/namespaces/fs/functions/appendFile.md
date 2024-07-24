[**minigame-std**](../../../README.md) • **Docs**

***

[minigame-std](../../../README.md) / [fs](../README.md) / appendFile

# Function: appendFile()

```ts
function appendFile(filePath, contents): AsyncIOResult<boolean>
```

向文件追加内容。

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `filePath` | `string` | 文件路径。 |
| `contents` | [`WriteFileContent`](../type-aliases/WriteFileContent.md) | 要追加的内容。 |

## Returns

`AsyncIOResult`\<`boolean`\>

追加成功返回 true 的异步操作结果。

## Defined in

[fs/mod.ts:154](https://github.com/JiangJie/minigame-std/blob/c06988f76801881a43518a5e9723580f21a11a7f/src/std/fs/mod.ts#L154)
