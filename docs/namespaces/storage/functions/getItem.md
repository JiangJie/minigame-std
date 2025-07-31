[**minigame-std**](../../../README.md)

***

[minigame-std](../../../README.md) / [storage](../README.md) / getItem

# Function: getItem()

```ts
function getItem(key): AsyncIOResult<string>
```

Defined in: [src/std/storage/mod.ts:43](https://github.com/JiangJie/minigame-std/blob/fdb22241c47c2e98329a4c62befde728957e03ee/src/std/storage/mod.ts#L43)

从本地缓存中读取数据。

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `key` | `string` | 数据的键名。 |

## Returns

`AsyncIOResult`\<`string`\>

返回一个 Promise，表示操作完成。
