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

[src/std/fs/mod.ts:156](https://github.com/JiangJie/minigame-std/blob/b22fceadbb04574df41eed36a50100fba3cc5e73/src/std/fs/mod.ts#L156)
