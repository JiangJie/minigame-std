[**minigame-std**](../README.md) • **Docs**

***

[minigame-std](../README.md) / ISocket

# Interface: ISocket

WebSocket 接口定义，描述了 WebSocket 的基本操作方法。

## Methods

### addEventListener()

```ts
addEventListener<K>(type, listener): void
```

添加事件监听器到 WebSocket 对象。

#### Type parameters

| Type parameter | Description |
| :------ | :------ |
| `K` *extends* keyof `WebSocketEventMap` | 限定为 WebSocketEventMap 的键类型。 |

#### Parameters

| Parameter | Type | Description |
| :------ | :------ | :------ |
| `type` | `K` | 事件类型，如 'open', 'close', 'message', 'error'。 |
| `listener` | [`SocketListenerMap`](SocketListenerMap.md)\[`K`\] | 对应事件的监听器回调函数。 |

#### Returns

`void`

#### Source

[src/std/socket/socket\_define.ts:42](https://github.com/JiangJie/minigame-std/blob/1bf3ee8cf3321353e47e032c8721e63dd3e21497/src/std/socket/socket_define.ts#L42)

***

### close()

```ts
close(code?, reason?): void
```

关闭 WebSocket 连接。

#### Parameters

| Parameter | Type | Description |
| :------ | :------ | :------ |
| `code`? | `number` | 可选的状态码，表示关闭连接的原因。 |
| `reason`? | `string` | 可选的字符串，解释为什么要关闭连接。 |

#### Returns

`void`

#### Source

[src/std/socket/socket\_define.ts:56](https://github.com/JiangJie/minigame-std/blob/1bf3ee8cf3321353e47e032c8721e63dd3e21497/src/std/socket/socket_define.ts#L56)

***

### send()

```ts
send(data): Promise<Result<boolean, Error>>
```

发送数据到 WebSocket 服务器。

#### Parameters

| Parameter | Type | Description |
| :------ | :------ | :------ |
| `data` | `string` \| `ArrayBuffer` \| `ArrayBufferView` | 要发送的数据，可以是字符串、ArrayBuffer 或 ArrayBufferView。 |

#### Returns

`Promise`\<`Result`\<`boolean`, `Error`\>\>

返回一个 Promise，其解析为发送结果，成功时返回 true，失败时返回 Error。

#### Source

[src/std/socket/socket\_define.ts:49](https://github.com/JiangJie/minigame-std/blob/1bf3ee8cf3321353e47e032c8721e63dd3e21497/src/std/socket/socket_define.ts#L49)
