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

[src/std/network/mod.ts:12](https://github.com/JiangJie/minigame-std/blob/0b3f4c24a764d15c8d4cfbfab659d3f6c53dfd93/src/std/network/mod.ts#L12)
