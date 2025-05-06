[**minigame-std**](../README.md)

***

[minigame-std](../README.md) / getNetworkType

# Function: getNetworkType()

```ts
function getNetworkType(): Promise<NetworkType>
```

Defined in: [src/std/network/mod.ts:12](https://github.com/JiangJie/minigame-std/blob/8c5db4b9c3dabb4d0435a493922f29b60a730f0d/src/std/network/mod.ts#L12)

获取网络状态。

## Returns

`Promise`\<[`NetworkType`](../type-aliases/NetworkType.md)\>

根据浏览器支持情况不同，返回值可能为 `wifi` | `none` | `unknown` | `slow-2g` | `2g` | `3g` | `4g`
