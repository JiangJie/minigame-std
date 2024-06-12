[**minigame-std**](../../../README.md) • **Docs**

***

[minigame-std](../../../README.md) / [storage](../README.md) / getItem

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

[src/std/storage/mod.ts:21](https://github.com/JiangJie/minigame-std/blob/1bf3ee8cf3321353e47e032c8721e63dd3e21497/src/std/storage/mod.ts#L21)
