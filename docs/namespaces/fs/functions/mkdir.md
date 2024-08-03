[**minigame-std**](../../../README.md) • **Docs**

***

[minigame-std](../../../README.md) / [fs](../README.md) / mkdir

# Function: mkdir()

```ts
function mkdir(dirPath): AsyncIOResult<boolean>
```

递归创建文件夹，相当于`mkdir -p`。

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `dirPath` | `string` | 将要创建的目录的路径。 |

## Returns

`AsyncIOResult`\<`boolean`\>

创建成功返回 true 的异步操作结果。

## Defined in

[fs/fs\_async.ts:42](https://github.com/JiangJie/minigame-std/blob/1d046e44c5931182cced8ad59c3bf51847c8ead7/src/std/fs/fs_async.ts#L42)
