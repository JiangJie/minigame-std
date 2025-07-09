[**minigame-std**](../../../README.md)

***

[minigame-std](../../../README.md) / [fs](../README.md) / readDir

# Function: readDir()

```ts
function readDir(dirPath): AsyncIOResult<string[]>
```

Defined in: [src/std/fs/fs\_async.ts:76](https://github.com/JiangJie/minigame-std/blob/c702c23d8258d9dd96d873df515d0027c84fb302/src/std/fs/fs_async.ts#L76)

异步读取指定目录下的所有文件和子目录。

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `dirPath` | `string` | 需要读取的目录路径。 |

## Returns

`AsyncIOResult`\<`string`[]\>

包含目录内容的字符串数组的异步操作结果。
