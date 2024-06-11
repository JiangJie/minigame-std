[**minigame-std**](../../../index.md) • **Docs**

***

[minigame-std](../../../index.md) / [fs](../index.md) / rename

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

[src/std/fs/mod.ts:91](https://github.com/JiangJie/minigame-std/blob/fe87039c9bf9e09f2936bdac3b9a02fcf5e4b50c/src/std/fs/mod.ts#L91)
