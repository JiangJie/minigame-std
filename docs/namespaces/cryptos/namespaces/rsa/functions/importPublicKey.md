[**minigame-std**](../../../../../README.md) • **Docs**

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

[src/std/crypto/rsa/mod.ts:13](https://github.com/JiangJie/minigame-std/blob/d842b492eda479274cfeb38a06f4c4255b5493bc/src/std/crypto/rsa/mod.ts#L13)
