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

Defined in: [src/std/fs/fs\_async.ts:157](https://github.com/JiangJie/minigame-std/blob/8c5db4b9c3dabb4d0435a493922f29b60a730f0d/src/std/fs/fs_async.ts#L157)

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
