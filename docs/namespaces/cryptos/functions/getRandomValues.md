[**minigame-std**](../../../README.md) • **Docs**

***

[minigame-std](../../../README.md) / [cryptos](../README.md) / getRandomValues

# Function: getRandomValues()

```ts
function getRandomValues(length): AsyncIOResult<Uint8Array>
```

获取密码学安全随机数。

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `length` | `number` | 要生成的字节数。 |

## Returns

`AsyncIOResult`\<`Uint8Array`\>

生成的随机数 Buffer。

## Defined in

[src/std/crypto/random/mod.ts:20](https://github.com/JiangJie/minigame-std/blob/d842b492eda479274cfeb38a06f4c4255b5493bc/src/std/crypto/random/mod.ts#L20)
