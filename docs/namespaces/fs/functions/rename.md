[**minigame-std**](../../../README.md) • **Docs**

***

[minigame-std](../../../README.md) / [fs](../README.md) / rename

# Function: rename()

```ts
function rename(oldPath, newPath): AsyncIOResult<boolean>
```

重命名文件或目录。

## Parameters

| Parameter | Type | Description |
| :------ | :------ | :------ |
| `oldPath` | `string` | 原始路径。 |
| `newPath` | `string` | 新路径。 |

## Returns

`AsyncIOResult`\<`boolean`\>

重命名成功返回 true 的异步操作结果。

## Source

[src/std/fs/mod.ts:91](https://github.com/JiangJie/minigame-std/blob/1bf3ee8cf3321353e47e032c8721e63dd3e21497/src/std/fs/mod.ts#L91)
