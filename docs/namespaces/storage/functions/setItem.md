[**minigame-std**](../../../README.md)

***

[minigame-std](../../../README.md) / [storage](../README.md) / setItem

# Function: setItem()

```ts
function setItem(key, data): AsyncVoidIOResult
```

Defined in: [src/std/storage/mod.ts:32](https://github.com/JiangJie/minigame-std/blob/fdb22241c47c2e98329a4c62befde728957e03ee/src/std/storage/mod.ts#L32)

将数据存储在本地缓存中。

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `key` | `string` | 数据的键名。 |
| `data` | `string` | 要存储的数据。 |

## Returns

`AsyncVoidIOResult`

返回一个 Promise，表示操作完成。
