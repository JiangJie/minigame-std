[**minigame-std**](../../../README.md)

***

[minigame-std](../../../README.md) / [fs](../README.md) / mkdir

# Function: mkdir()

```ts
function mkdir(dirPath): AsyncVoidIOResult
```

Defined in: [src/std/fs/fs\_async.ts:57](https://github.com/JiangJie/minigame-std/blob/fdb22241c47c2e98329a4c62befde728957e03ee/src/std/fs/fs_async.ts#L57)

递归创建文件夹，相当于`mkdir -p`。

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `dirPath` | `string` | 将要创建的目录的路径。 |

## Returns

`AsyncVoidIOResult`

创建成功返回 true 的异步操作结果。
