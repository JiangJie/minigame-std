[**minigame-std**](../../../README.md) • **Docs**

***

[minigame-std](../../../README.md) / [fs](../README.md) / readDir

# Function: readDir()

```ts
function readDir(dirPath): AsyncIOResult<string[]>
```

异步读取指定目录下的所有文件和子目录。

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `dirPath` | `string` | 需要读取的目录路径。 |

## Returns

`AsyncIOResult`\<`string`[]\>

包含目录内容的字符串数组的异步操作结果。

## Defined in

[fs/mod.ts:43](https://github.com/JiangJie/minigame-std/blob/c06988f76801881a43518a5e9723580f21a11a7f/src/std/fs/mod.ts#L43)
