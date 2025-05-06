[**minigame-std**](../../../README.md)

***

[minigame-std](../../../README.md) / [storage](../README.md) / getItem

# Function: getItem()

```ts
function getItem(key): AsyncIOResult<string>
```

Defined in: [src/std/storage/mod.ts:40](https://github.com/JiangJie/minigame-std/blob/8c5db4b9c3dabb4d0435a493922f29b60a730f0d/src/std/storage/mod.ts#L40)

从本地缓存中读取数据。

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `key` | `string` | 数据的键名。 |

## Returns

`AsyncIOResult`\<`string`\>

返回一个 Promise，表示操作完成。
