[**minigame-std**](../../../index.md) • **Docs**

***

[minigame-std](../../../index.md) / [fs](../index.md) / mkdir

# Function: mkdir()

```ts
function mkdir(dirPath): AsyncIOResult<boolean>
```

递归创建文件夹，相当于`mkdir -p`。

## Parameters

| Parameter | Type | Description |
| :------ | :------ | :------ |
| `dirPath` | `string` | 将要创建的目录的路径。 |

## Returns

`AsyncIOResult`\<`boolean`\>

创建成功返回 true 的异步操作结果。

## Source

[src/std/fs/mod.ts:63](https://github.com/JiangJie/minigame-std/blob/fe87039c9bf9e09f2936bdac3b9a02fcf5e4b50c/src/std/fs/mod.ts#L63)
