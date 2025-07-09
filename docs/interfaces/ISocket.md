[**minigame-std**](../README.md)

***

[minigame-std](../README.md) / ISocket

# Interface: ISocket

Defined in: [src/std/socket/socket\_define.ts:58](https://github.com/JiangJie/minigame-std/blob/c702c23d8258d9dd96d873df515d0027c84fb302/src/std/socket/socket_define.ts#L58)

WebSocket 接口定义，描述了 WebSocket 的基本操作方法。

## Properties

| Property | Modifier | Type | Description | Defined in |
| ------ | ------ | ------ | ------ | ------ |
| <a id="readystate"></a> `readyState` | `readonly` | `number` | WebSocket 的连接状态。 | [src/std/socket/socket\_define.ts:62](https://github.com/JiangJie/minigame-std/blob/c702c23d8258d9dd96d873df515d0027c84fb302/src/std/socket/socket_define.ts#L62) |

## Methods

### addEventListener()

```ts
addEventListener<K>(type, listener): () => void
```

Defined in: [src/std/socket/socket\_define.ts:71](https://github.com/JiangJie/minigame-std/blob/c702c23d8258d9dd96d873df515d0027c84fb302/src/std/socket/socket_define.ts#L71)

添加事件监听器到 WebSocket 对象。

#### Type Parameters

| Type Parameter | Description |
| ------ | ------ |
| `K` *extends* keyof `WebSocketEventMap` | 限定为 WebSocketEventMap 的键类型。 |

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `type` | `K` | 事件类型，如 'open', 'close', 'message', 'error'。 |
| `listener` | [`SocketListenerMap`](SocketListenerMap.md)\[`K`\] | 对应事件的监听器回调函数。 |

#### Returns

`Function`

返回对应的`removeEventListener代理函数`。

##### Returns

`void`

***

### close()

```ts
close(code?, reason?): void
```

Defined in: [src/std/socket/socket\_define.ts:85](https://github.com/JiangJie/minigame-std/blob/c702c23d8258d9dd96d873df515d0027c84fb302/src/std/socket/socket_define.ts#L85)

关闭 WebSocket 连接。

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `code`? | `number` | 可选的状态码，表示关闭连接的原因。 |
| `reason`? | `string` | 可选的字符串，解释为什么要关闭连接。 |

#### Returns

`void`

***

### send()

```ts
send(data): AsyncVoidIOResult
```

Defined in: [src/std/socket/socket\_define.ts:78](https://github.com/JiangJie/minigame-std/blob/c702c23d8258d9dd96d873df515d0027c84fb302/src/std/socket/socket_define.ts#L78)

发送数据到 WebSocket 服务器。

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `data` | [`DataSource`](../type-aliases/DataSource.md) | 要发送的数据，可以是字符串、ArrayBuffer 或 ArrayBufferView。 |

#### Returns

`AsyncVoidIOResult`

返回一个 Promise，其解析为发送结果，成功时返回 true，失败时返回 Error。
