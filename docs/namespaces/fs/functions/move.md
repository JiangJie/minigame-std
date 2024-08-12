[**minigame-std**](../../../README.md) • **Docs**

***

[minigame-std](../../../README.md) / [fs](../README.md) / move

# Function: move()

```ts
function move(srcPath, destPath): AsyncVoidIOResult
```

重命名文件或目录。

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `srcPath` | `string` | 原始路径。 |
| `destPath` | `string` | 新路径。 |

## Returns

`AsyncVoidIOResult`

重命名成功返回 true 的异步操作结果。

## Defined in

[src/std/fs/fs\_async.ts:64](https://github.com/JiangJie/minigame-std/blob/22787d0fd0cff776ed579de48ccf7523d9e4ce53/src/std/fs/fs_async.ts#L64)
