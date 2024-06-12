[**minigame-std**](../../../README.md) • **Docs**

***

[minigame-std](../../../README.md) / [fs](../README.md) / emptyDir

# Function: emptyDir()

```ts
function emptyDir(dirPath): AsyncIOResult<boolean>
```

清空指定目录下的所有文件和子目录。

## Parameters

| Parameter | Type | Description |
| :------ | :------ | :------ |
| `dirPath` | `string` | 目录路径。 |

## Returns

`AsyncIOResult`\<`boolean`\>

清空成功返回 true 的异步操作结果。

## Source

[src/std/fs/mod.ts:185](https://github.com/JiangJie/minigame-std/blob/1bf3ee8cf3321353e47e032c8721e63dd3e21497/src/std/fs/mod.ts#L185)
