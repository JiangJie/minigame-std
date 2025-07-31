[**minigame-std**](../../../README.md)

***

[minigame-std](../../../README.md) / [fs](../README.md) / move

# Function: move()

```ts
function move(srcPath, destPath): AsyncVoidIOResult
```

Defined in: [src/std/fs/fs\_async.ts:67](https://github.com/JiangJie/minigame-std/blob/fdb22241c47c2e98329a4c62befde728957e03ee/src/std/fs/fs_async.ts#L67)

重命名文件或目录。

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `srcPath` | `string` | 原始路径。 |
| `destPath` | `string` | 新路径。 |

## Returns

`AsyncVoidIOResult`

重命名成功返回 true 的异步操作结果。
