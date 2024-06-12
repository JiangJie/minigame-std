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
| :------ | :------ | :------ |
| `dirPath` | `string` | 需要读取的目录路径。 |

## Returns

`AsyncIOResult`\<`string`[]\>

包含目录内容的字符串数组的异步操作结果。

## Source

[src/std/fs/mod.ts:42](https://github.com/JiangJie/minigame-std/blob/1bf3ee8cf3321353e47e032c8721e63dd3e21497/src/std/fs/mod.ts#L42)
