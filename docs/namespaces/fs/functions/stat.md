[**minigame-std**](../../../index.md) • **Docs**

***

[minigame-std](../../../index.md) / [fs](../index.md) / stat

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

[src/std/fs/mod.ts:100](https://github.com/JiangJie/minigame-std/blob/fe87039c9bf9e09f2936bdac3b9a02fcf5e4b50c/src/std/fs/mod.ts#L100)
