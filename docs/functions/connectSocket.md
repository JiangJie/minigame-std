[**minigame-std**](../README.md)

***

[minigame-std](../README.md) / connectSocket

# Function: connectSocket()

```ts
function connectSocket(url, options?): ISocket
```

Defined in: [src/std/socket/mod.ts:14](https://github.com/JiangJie/minigame-std/blob/8c5db4b9c3dabb4d0435a493922f29b60a730f0d/src/std/socket/mod.ts#L14)

创建并返回一个 WebSocket 连接。

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `url` | `string` | WebSocket 服务器的 URL。 |
| `options`? | [`SocketOptions`](../type-aliases/SocketOptions.md) | 可选的参数。 |

## Returns

[`ISocket`](../interfaces/ISocket.md)

返回一个实现了 ISocket 接口的 WebSocket 对象。
