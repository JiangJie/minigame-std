[**minigame-std**](../../../README.md)

***

[minigame-std](../../../README.md) / [fs](../README.md) / readDir

# Function: readDir()

```ts
function readDir(dirPath): AsyncIOResult<string[]>
```

Defined in: [src/std/fs/fs\_async.ts:76](https://github.com/JiangJie/minigame-std/blob/fdb22241c47c2e98329a4c62befde728957e03ee/src/std/fs/fs_async.ts#L76)

异步读取指定目录下的所有文件和子目录。

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `dirPath` | `string` | 需要读取的目录路径。 |

## Returns

`AsyncIOResult`\<`string`[]\>

包含目录内容的字符串数组的异步操作结果。
