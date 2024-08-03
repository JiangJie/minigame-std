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

[socket/mod.ts:14](https://github.com/JiangJie/minigame-std/blob/1d046e44c5931182cced8ad59c3bf51847c8ead7/src/std/socket/mod.ts#L14)
