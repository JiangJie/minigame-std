[**minigame-std**](../../../README.md)

***

[minigame-std](../../../README.md) / [fs](../README.md) / exists

# Function: exists()

```ts
function exists(path): AsyncIOResult<boolean>
```

Defined in: [src/std/fs/fs\_async.ts:187](https://github.com/JiangJie/minigame-std/blob/fdb22241c47c2e98329a4c62befde728957e03ee/src/std/fs/fs_async.ts#L187)

检查指定路径的文件或目录是否存在。

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `path` | `string` | 文件或目录的路径。 |

## Returns

`AsyncIOResult`\<`boolean`\>

存在返回 true 的异步操作结果。
