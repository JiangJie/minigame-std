[**minigame-std**](../../../README.md)

***

[minigame-std](../../../README.md) / [storage](../README.md) / hasItem

# Function: hasItem()

```ts
function hasItem(key): AsyncIOResult<boolean>
```

Defined in: [src/std/storage/mod.ts:85](https://github.com/JiangJie/minigame-std/blob/fdb22241c47c2e98329a4c62befde728957e03ee/src/std/storage/mod.ts#L85)

检查本地存储中是否存在指定的数据。

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `key` | `string` | 数据的键名。 |

## Returns

`AsyncIOResult`\<`boolean`\>

返回一个 Promise，表示操作完成。
