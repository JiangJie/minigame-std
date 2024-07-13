[**minigame-std**](../../../README.md) • **Docs**

***

[minigame-std](../../../README.md) / [fs](../README.md) / writeFile

# Function: writeFile()

```ts
function writeFile(filePath, contents): AsyncIOResult<boolean>
```

写入文件，不存在则创建，同时创建对应目录，contents只支持ArrayBuffer和string，并且需要确保string一定是utf8编码的。

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `filePath` | `string` | 文件路径。 |
| `contents` | [`WriteFileContent`](../type-aliases/WriteFileContent.md) | 要写入的内容。 |

## Returns

`AsyncIOResult`\<`boolean`\>

写入成功返回 true 的异步操作结果。

## Defined in

[src/std/fs/mod.ts:146](https://github.com/JiangJie/minigame-std/blob/b22fceadbb04574df41eed36a50100fba3cc5e73/src/std/fs/mod.ts#L146)
