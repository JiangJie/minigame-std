[**minigame-std**](../../../README.md)

***

[minigame-std](../../../README.md) / [fs](../README.md) / writeFile

# Function: writeFile()

```ts
function writeFile(
   filePath, 
   contents, 
   options?): AsyncVoidIOResult
```

Defined in: [src/std/fs/fs\_async.ts:157](https://github.com/JiangJie/minigame-std/blob/c702c23d8258d9dd96d873df515d0027c84fb302/src/std/fs/fs_async.ts#L157)

写入文件，不存在则创建，同时创建对应目录，contents只支持ArrayBuffer和string，并且需要确保string一定是utf8编码的。

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `filePath` | `string` | 文件路径。 |
| `contents` | [`WriteFileContent`](../type-aliases/WriteFileContent.md) | 要写入的内容。 |
| `options`? | `WriteOptions` | 可选选项。 |

## Returns

`AsyncVoidIOResult`

写入成功返回 true 的异步操作结果。
