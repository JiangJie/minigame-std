[**minigame-std**](../../../README.md) • **Docs**

***

[minigame-std](../../../README.md) / [fs](../README.md) / emptyDir

# Function: emptyDir()

```ts
function emptyDir(dirPath): AsyncIOResult<boolean>
```

清空指定目录下的所有文件和子目录。

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `dirPath` | `string` | 目录路径。 |

## Returns

`AsyncIOResult`\<`boolean`\>

清空成功返回 true 的异步操作结果。

## Defined in

[fs/fs\_async.ts:179](https://github.com/JiangJie/minigame-std/blob/1d046e44c5931182cced8ad59c3bf51847c8ead7/src/std/fs/fs_async.ts#L179)
