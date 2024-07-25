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

[fs/mod.ts:144](https://github.com/JiangJie/minigame-std/blob/9a02e61a8957cca22585cd9d056a48faa2b3d8ee/src/std/fs/mod.ts#L144)
