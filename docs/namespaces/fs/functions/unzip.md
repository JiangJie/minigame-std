[**minigame-std**](../../../README.md) • **Docs**

***

[minigame-std](../../../README.md) / [fs](../README.md) / unzip

# Function: unzip()

```ts
function unzip(zipFilePath, targetPath): AsyncVoidIOResult
```

解压 zip 文件。

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `zipFilePath` | `string` | 要解压的 zip 文件路径。 |
| `targetPath` | `string` | 要解压到的目标文件夹路径。 |

## Returns

`AsyncVoidIOResult`

解压操作的异步结果。

## Defined in

[src/std/fs/fs\_async.ts:260](https://github.com/JiangJie/minigame-std/blob/0b3f4c24a764d15c8d4cfbfab659d3f6c53dfd93/src/std/fs/fs_async.ts#L260)
