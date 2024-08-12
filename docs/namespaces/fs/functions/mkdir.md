[**minigame-std**](../../../README.md) • **Docs**

***

[minigame-std](../../../README.md) / [fs](../README.md) / mkdir

# Function: mkdir()

```ts
function mkdir(dirPath): AsyncVoidIOResult
```

递归创建文件夹，相当于`mkdir -p`。

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `dirPath` | `string` | 将要创建的目录的路径。 |

## Returns

`AsyncVoidIOResult`

创建成功返回 true 的异步操作结果。

## Defined in

[src/std/fs/fs\_async.ts:54](https://github.com/JiangJie/minigame-std/blob/d5a0bd55450bd8f6d3ddbc9f604a3e15ebaebf6d/src/std/fs/fs_async.ts#L54)
