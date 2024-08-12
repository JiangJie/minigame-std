[**minigame-std**](../README.md) • **Docs**

***

[minigame-std](../README.md) / connectSocket

# Function: connectSocket()

```ts
function connectSocket(url, options?): ISocket
```

创建并返回一个 WebSocket 连接。

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `url` | `string` | WebSocket 服务器的 URL。 |
| `options`? | [`SocketOptions`](../type-aliases/SocketOptions.md) | 可选的参数。 |

## Returns

[`ISocket`](../interfaces/ISocket.md)

返回一个实现了 ISocket 接口的 WebSocket 对象。

## Defined in

[src/std/socket/mod.ts:14](https://github.com/JiangJie/minigame-std/blob/22787d0fd0cff776ed579de48ccf7523d9e4ce53/src/std/socket/mod.ts#L14)
