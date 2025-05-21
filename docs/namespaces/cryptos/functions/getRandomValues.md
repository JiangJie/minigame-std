[**minigame-std**](../../../README.md)

***

[minigame-std](../../../README.md) / [cryptos](../README.md) / getRandomValues

# Function: getRandomValues()

```ts
function getRandomValues(length): AsyncIOResult<Uint8Array<ArrayBufferLike>>
```

Defined in: [src/std/crypto/random/mod.ts:20](https://github.com/JiangJie/minigame-std/blob/ff3594872b1efbdbc13aabe99588385e855b50dc/src/std/crypto/random/mod.ts#L20)

获取密码学安全随机数。

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `length` | `number` | 要生成的字节数。 |

## Returns

`AsyncIOResult`\<`Uint8Array`\<`ArrayBufferLike`\>\>

生成的随机数 Buffer。
