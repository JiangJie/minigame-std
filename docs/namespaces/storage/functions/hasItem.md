[**minigame-std**](../../../README.md)

***

[minigame-std](../../../README.md) / [storage](../README.md) / hasItem

# Function: hasItem()

```ts
function hasItem(key): AsyncIOResult<boolean>
```

Defined in: [src/std/storage/mod.ts:85](https://github.com/JiangJie/minigame-std/blob/ff3594872b1efbdbc13aabe99588385e855b50dc/src/std/storage/mod.ts#L85)

检查本地存储中是否存在指定的数据。

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `key` | `string` | 数据的键名。 |

## Returns

`AsyncIOResult`\<`boolean`\>

返回一个 Promise，表示操作完成。
