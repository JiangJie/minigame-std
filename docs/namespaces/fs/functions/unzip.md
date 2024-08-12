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

[src/std/fs/fs\_async.ts:249](https://github.com/JiangJie/minigame-std/blob/d5a0bd55450bd8f6d3ddbc9f604a3e15ebaebf6d/src/std/fs/fs_async.ts#L249)
