[**minigame-std**](../../../README.md) • **Docs**

***

[minigame-std](../../../README.md) / [fs](../README.md) / zip

# Function: zip()

```ts
function zip(
   sourcePath, 
   zipFilePath, 
   options?): AsyncVoidIOResult
```

压缩文件。

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `sourcePath` | `string` | 需要压缩的文件（夹）路径。 |
| `zipFilePath` | `string` | 压缩后的 zip 文件路径。 |
| `options`? | `ZipOptions` | 可选的压缩参数。 |

## Returns

`AsyncVoidIOResult`

压缩成功的异步结果。

## Defined in

[fs/fs\_async.ts:236](https://github.com/JiangJie/minigame-std/blob/e98ab0af7ad78dc07fcec865ee164ff1e7efe9cf/src/std/fs/fs_async.ts#L236)
