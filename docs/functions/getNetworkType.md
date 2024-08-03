[**minigame-std**](../README.md) • **Docs**

***

[minigame-std](../README.md) / getNetworkType

# Function: getNetworkType()

```ts
function getNetworkType(): Promise<NetworkType>
```

获取网络状态。

## Returns

`Promise`\<[`NetworkType`](../type-aliases/NetworkType.md)\>

根据浏览器支持情况不同，返回值可能为 `wifi` | `none` | `unknown` | `slow-2g` | `2g` | `3g` | `4g`

## Defined in

[network/mod.ts:12](https://github.com/JiangJie/minigame-std/blob/1d046e44c5931182cced8ad59c3bf51847c8ead7/src/std/network/mod.ts#L12)
