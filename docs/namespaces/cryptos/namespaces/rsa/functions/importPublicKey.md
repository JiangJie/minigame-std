[**minigame-std**](../../../../../README.md)

***

[minigame-std](../../../../../README.md) / [cryptos](../../../README.md) / [rsa](../README.md) / importPublicKey

# Function: importPublicKey()

```ts
function importPublicKey(pem, hash): Promise<RSAPublicKey>
```

Defined in: [src/std/crypto/rsa/mod.ts:13](https://github.com/JiangJie/minigame-std/blob/c702c23d8258d9dd96d873df515d0027c84fb302/src/std/crypto/rsa/mod.ts#L13)

Import a public key from a PEM encoded string for encryption.

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `pem` | `string` | PEM encoded string. |
| `hash` | [`SHA`](../../../type-aliases/SHA.md) | Hash algorithm. |

## Returns

`Promise`\<[`RSAPublicKey`](../../../interfaces/RSAPublicKey.md)\>
