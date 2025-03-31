[**minigame-std**](../../../README.md)

***

[minigame-std](../../../README.md) / [cryptos](../README.md) / RSAPublicKey

# Interface: RSAPublicKey

The RSA public key.

## Methods

### encrypt()

```ts
encrypt(data): Promise<ArrayBuffer>
```

Use the RSA-OAEP algorithm to encrypt the data.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `data` | `string` | The data to encrypt. |

#### Returns

`Promise`\<`ArrayBuffer`\>

Encrypted data.

#### Defined in

[src/std/crypto/crypto\_defines.ts:10](https://github.com/JiangJie/minigame-std/blob/8633d80114dee6c79033ec094d8233bd8263bedc/src/std/crypto/crypto_defines.ts#L10)

***

### encryptToString()

```ts
encryptToString(data): Promise<string>
```

`encrypt` then convert to base64 string.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `data` | `string` |

#### Returns

`Promise`\<`string`\>

#### Defined in

[src/std/crypto/crypto\_defines.ts:15](https://github.com/JiangJie/minigame-std/blob/8633d80114dee6c79033ec094d8233bd8263bedc/src/std/crypto/crypto_defines.ts#L15)
