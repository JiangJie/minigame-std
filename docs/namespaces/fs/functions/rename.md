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

[fs/mod.ts:91](https://github.com/JiangJie/minigame-std/blob/d86e790fe8486ddfc8ce953df31d30618f403d3b/src/std/fs/mod.ts#L91)
