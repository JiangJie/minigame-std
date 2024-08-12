[**minigame-std**](../README.md) • **Docs**

***

[minigame-std](../README.md) / ISocket

# Interface: ISocket

WebSocket 接口定义，描述了 WebSocket 的基本操作方法。

## Properties

| Property | Modifier | Type | Description | Defined in |
| ------ | ------ | ------ | ------ | ------ |
| `readyState` | `readonly` | `number` | WebSocket 的连接状态。 | [src/std/socket/socket\_define.ts:61](https://github.com/JiangJie/minigame-std/blob/22787d0fd0cff776ed579de48ccf7523d9e4ce53/src/std/socket/socket_define.ts#L61) |

## Methods

### addEventListener()

```ts
addEventListener<K>(type, listener): () => void
```

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

#### Defined in

[src/std/socket/socket\_define.ts:70](https://github.com/JiangJie/minigame-std/blob/22787d0fd0cff776ed579de48ccf7523d9e4ce53/src/std/socket/socket_define.ts#L70)

***

### close()

```ts
close(code?, reason?): void
```

关闭 WebSocket 连接。

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `code`? | `number` | 可选的状态码，表示关闭连接的原因。 |
| `reason`? | `string` | 可选的字符串，解释为什么要关闭连接。 |

#### Returns

`void`

#### Defined in

[src/std/socket/socket\_define.ts:84](https://github.com/JiangJie/minigame-std/blob/22787d0fd0cff776ed579de48ccf7523d9e4ce53/src/std/socket/socket_define.ts#L84)

***

### send()

```ts
send(data): AsyncVoidIOResult
```

发送数据到 WebSocket 服务器。

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `data` | `string` \| `BufferSource` | 要发送的数据，可以是字符串、ArrayBuffer 或 ArrayBufferView。 |

#### Returns

`AsyncVoidIOResult`

返回一个 Promise，其解析为发送结果，成功时返回 true，失败时返回 Error。

#### Defined in

[src/std/socket/socket\_define.ts:77](https://github.com/JiangJie/minigame-std/blob/22787d0fd0cff776ed579de48ccf7523d9e4ce53/src/std/socket/socket_define.ts#L77)
