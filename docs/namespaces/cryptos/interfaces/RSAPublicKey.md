[**minigame-std**](../../../README.md)

***

[minigame-std](../../../README.md) / [cryptos](../README.md) / RSAPublicKey

# Interface: RSAPublicKey

Defined in: [src/std/crypto/crypto\_defines.ts:4](https://github.com/JiangJie/minigame-std/blob/8c5db4b9c3dabb4d0435a493922f29b60a730f0d/src/std/crypto/crypto_defines.ts#L4)

The RSA public key.

## Methods

### encrypt()

```ts
encrypt(data): Promise<ArrayBuffer>
```

Defined in: [src/std/crypto/crypto\_defines.ts:10](https://github.com/JiangJie/minigame-std/blob/8c5db4b9c3dabb4d0435a493922f29b60a730f0d/src/std/crypto/crypto_defines.ts#L10)

Use the RSA-OAEP algorithm to encrypt the data.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `data` | `string` | The data to encrypt. |

#### Returns

`Promise`\<`ArrayBuffer`\>

Encrypted data.

***

### encryptToString()

```ts
encryptToString(data): Promise<string>
```

Defined in: [src/std/crypto/crypto\_defines.ts:15](https://github.com/JiangJie/minigame-std/blob/8c5db4b9c3dabb4d0435a493922f29b60a730f0d/src/std/crypto/crypto_defines.ts#L15)

`encrypt` then convert to base64 string.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `data` | `string` |

#### Returns

`Promise`\<`string`\>
