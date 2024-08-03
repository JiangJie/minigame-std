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

[fs/fs\_async.ts:151](https://github.com/JiangJie/minigame-std/blob/1d046e44c5931182cced8ad59c3bf51847c8ead7/src/std/fs/fs_async.ts#L151)
