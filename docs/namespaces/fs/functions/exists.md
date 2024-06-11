[**minigame-std**](../../../index.md) • **Docs**

***

[minigame-std](../../../index.md) / [fs](../index.md) / exists

# Function: exists()

```ts
function exists(path): AsyncIOResult<boolean>
```

检查指定路径的文件或目录是否存在。

## Parameters

| Parameter | Type | Description |
| :------ | :------ | :------ |
| `path` | `string` | 文件或目录的路径。 |

## Returns

`AsyncIOResult`\<`boolean`\>

存在返回 true 的异步操作结果。

## Source

[src/std/fs/mod.ts:176](https://github.com/JiangJie/minigame-std/blob/fe87039c9bf9e09f2936bdac3b9a02fcf5e4b50c/src/std/fs/mod.ts#L176)
