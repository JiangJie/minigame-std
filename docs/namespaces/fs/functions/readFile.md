[**minigame-std**](../../../README.md)

***

[minigame-std](../../../README.md) / [fs](../README.md) / readFile

# Function: readFile()

```ts
function readFile(filePath): AsyncIOResult<ArrayBuffer>
```

Defined in: [src/std/fs/fs\_async.ts:95](https://github.com/JiangJie/minigame-std/blob/fdb22241c47c2e98329a4c62befde728957e03ee/src/std/fs/fs_async.ts#L95)

读取文件内容。

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `filePath` | `string` | 文件的路径。 |

## Returns

`AsyncIOResult`\<`ArrayBuffer`\>

包含文件内容的 ArrayBuffer 的异步操作结果。
