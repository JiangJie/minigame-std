[**minigame-std**](../../../index.md) • **Docs**

***

[minigame-std](../../../index.md) / [storage](../index.md) / getItem

# Function: getItem()

```ts
function getItem(key): Promise<Option<string>>
```

从本地缓存中读取数据。

## Parameters

| Parameter | Type | Description |
| :------ | :------ | :------ |
| `key` | `string` | 数据的键名。 |

## Returns

`Promise`\<`Option`\<`string`\>\>

返回一个 Promise，解析为一个 Option 类型，包含读取到的数据或者在未找到数据时为 null。

## Source

[src/std/storage/mod.ts:21](https://github.com/JiangJie/minigame-std/blob/fe87039c9bf9e09f2936bdac3b9a02fcf5e4b50c/src/std/storage/mod.ts#L21)
