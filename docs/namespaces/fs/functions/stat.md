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
| `isDirectory` | () => `boolean` | [fs/mod.ts:103](https://github.com/JiangJie/minigame-std/blob/541deb559aa54bb90a9c59ed9d62e2fa15307533/src/std/fs/mod.ts#L103) |
| `isFile` | () => `boolean` | [fs/mod.ts:102](https://github.com/JiangJie/minigame-std/blob/541deb559aa54bb90a9c59ed9d62e2fa15307533/src/std/fs/mod.ts#L102) |

## Defined in

[fs/mod.ts:101](https://github.com/JiangJie/minigame-std/blob/541deb559aa54bb90a9c59ed9d62e2fa15307533/src/std/fs/mod.ts#L101)
