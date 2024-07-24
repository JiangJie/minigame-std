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
| ------ | ------ | ------ |
| `oldPath` | `string` | 原始路径。 |
| `newPath` | `string` | 新路径。 |

## Returns

`AsyncIOResult`\<`boolean`\>

重命名成功返回 true 的异步操作结果。

## Defined in

[fs/mod.ts:92](https://github.com/JiangJie/minigame-std/blob/c06988f76801881a43518a5e9723580f21a11a7f/src/std/fs/mod.ts#L92)
