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

[src/std/socket/mod.ts:14](https://github.com/JiangJie/minigame-std/blob/0b3f4c24a764d15c8d4cfbfab659d3f6c53dfd93/src/std/socket/mod.ts#L14)
