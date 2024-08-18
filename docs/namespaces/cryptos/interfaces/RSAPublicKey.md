[**minigame-std**](../../../README.md) • **Docs**

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

[src/std/crypto/crypto\_defines.ts:10](https://github.com/JiangJie/minigame-std/blob/0b3f4c24a764d15c8d4cfbfab659d3f6c53dfd93/src/std/crypto/crypto_defines.ts#L10)

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

[src/std/crypto/crypto\_defines.ts:15](https://github.com/JiangJie/minigame-std/blob/0b3f4c24a764d15c8d4cfbfab659d3f6c53dfd93/src/std/crypto/crypto_defines.ts#L15)
