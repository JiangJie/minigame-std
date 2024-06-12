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
| :------ | :------ | :------ |
| `path` | `string` | 文件或目录的路径。 |

## Returns

`AsyncIOResult`\<\{
  `isDirectory`: () => `boolean`;
  `isFile`: () => `boolean`;
 \}\>

包含状态信息的异步操作结果。

| Member | Type |
| :------ | :------ |
| `isDirectory` | () => `boolean` |
| `isFile` | () => `boolean` |

## Source

[src/std/fs/mod.ts:100](https://github.com/JiangJie/minigame-std/blob/1bf3ee8cf3321353e47e032c8721e63dd3e21497/src/std/fs/mod.ts#L100)
