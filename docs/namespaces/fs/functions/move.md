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

[src/std/fs/fs\_async.ts:66](https://github.com/JiangJie/minigame-std/blob/0b3f4c24a764d15c8d4cfbfab659d3f6c53dfd93/src/std/fs/fs_async.ts#L66)
