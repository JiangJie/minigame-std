[**minigame-std**](../../../README.md)

***

[minigame-std](../../../README.md) / [fs](../README.md) / unzip

# Function: unzip()

```ts
function unzip(zipFilePath, targetPath): AsyncVoidIOResult
```

Defined in: [src/std/fs/fs\_async.ts:262](https://github.com/JiangJie/minigame-std/blob/8c5db4b9c3dabb4d0435a493922f29b60a730f0d/src/std/fs/fs_async.ts#L262)

解压 zip 文件。

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `zipFilePath` | `string` | 要解压的 zip 文件路径。 |
| `targetPath` | `string` | 要解压到的目标文件夹路径。 |

## Returns

`AsyncVoidIOResult`

解压操作的异步结果。
