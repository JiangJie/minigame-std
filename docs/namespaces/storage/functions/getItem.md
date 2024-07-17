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
| ------ | ------ | ------ |
| `key` | `string` | 数据的键名。 |

## Returns

`Promise`\<`Option`\<`string`\>\>

返回一个 Promise，解析为一个 Option 类型，包含读取到的数据或者在未找到数据时为 null。

## Defined in

[storage/mod.ts:21](https://github.com/JiangJie/minigame-std/blob/1187f9b62000e3d29782e461fb54ceb4107f512c/src/std/storage/mod.ts#L21)
