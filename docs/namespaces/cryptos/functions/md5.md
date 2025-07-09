[**minigame-std**](../../../README.md)

***

[minigame-std](../../../README.md) / [cryptos](../README.md) / md5

# Function: md5()

```ts
function md5(data): string
```

Defined in: [src/std/crypto/md/mod.ts:11](https://github.com/JiangJie/minigame-std/blob/c702c23d8258d9dd96d873df515d0027c84fb302/src/std/crypto/md/mod.ts#L11)

计算字符串或者 buffer 的 MD5 值，结果用16进制字符串表示。

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `data` | [`DataSource`](../../../type-aliases/DataSource.md) | 需要计算 MD5 值的数据。 |

## Returns

`string`

计算得到的 MD5 十六进制字符串。
