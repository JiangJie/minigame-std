[**minigame-std**](../../../../../README.md)

***

[minigame-std](../../../../../README.md) / [cryptos](../../../README.md) / [rsa](../README.md) / importPublicKey

# Function: importPublicKey()

```ts
function importPublicKey(pem, hash): Promise<RSAPublicKey>
```

Import a public key from a PEM encoded string for encryption.

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `pem` | `string` | PEM encoded string. |
| `hash` | [`SHA`](../../../type-aliases/SHA.md) | Hash algorithm. |

## Returns

`Promise`\<[`RSAPublicKey`](../../../interfaces/RSAPublicKey.md)\>

## Defined in

[src/std/crypto/rsa/mod.ts:13](https://github.com/JiangJie/minigame-std/blob/8633d80114dee6c79033ec094d8233bd8263bedc/src/std/crypto/rsa/mod.ts#L13)
