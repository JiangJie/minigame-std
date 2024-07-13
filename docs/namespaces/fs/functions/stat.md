[**minigame-std**](../../../README.md) • **Docs**

***

[minigame-std](../../../README.md) / [fs](../README.md) / stat

# Function: stat()

```ts
function stat(path): AsyncIOResult<{
  isDirectory: () => boolean;
  isFile: () => boolean;
}>
```

获取文件或目录的状态信息。

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `path` | `string` | 文件或目录的路径。 |

## Returns

`AsyncIOResult`\<\{
  `isDirectory`: () => `boolean`;
  `isFile`: () => `boolean`;
 \}\>

包含状态信息的异步操作结果。

| Name | Type | Defined in |
| ------ | ------ | ------ |
| `isDirectory` | () => `boolean` | [src/std/fs/mod.ts:102](https://github.com/JiangJie/minigame-std/blob/b22fceadbb04574df41eed36a50100fba3cc5e73/src/std/fs/mod.ts#L102) |
| `isFile` | () => `boolean` | [src/std/fs/mod.ts:101](https://github.com/JiangJie/minigame-std/blob/b22fceadbb04574df41eed36a50100fba3cc5e73/src/std/fs/mod.ts#L101) |

## Defined in

[src/std/fs/mod.ts:100](https://github.com/JiangJie/minigame-std/blob/b22fceadbb04574df41eed36a50100fba3cc5e73/src/std/fs/mod.ts#L100)
