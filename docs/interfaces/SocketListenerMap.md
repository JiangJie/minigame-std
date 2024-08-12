[**minigame-std**](../README.md) • **Docs**

***

[minigame-std](../README.md) / SocketListenerMap

# Interface: SocketListenerMap

WebSocket 事件监听器映射接口，定义了与 WebSocket 事件对应的回调函数类型。

## Methods

### close()

```ts
close(code, reason): void
```

当 WebSocket 连接关闭时触发。

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `code` | `number` | 表示关闭连接的状态码。 |
| `reason` | `string` | 表示关闭连接的原因。 |

#### Returns

`void`

#### Defined in

[src/std/socket/socket\_define.ts:39](https://github.com/JiangJie/minigame-std/blob/d5a0bd55450bd8f6d3ddbc9f604a3e15ebaebf6d/src/std/socket/socket_define.ts#L39)

***

### error()

```ts
error(err): void
```

当 WebSocket 连接发生错误时触发。

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `err` | `Error` | 发生的错误对象。 |

#### Returns

`void`

#### Defined in

[src/std/socket/socket\_define.ts:51](https://github.com/JiangJie/minigame-std/blob/d5a0bd55450bd8f6d3ddbc9f604a3e15ebaebf6d/src/std/socket/socket_define.ts#L51)

***

### message()

```ts
message(data): void
```

当 WebSocket 接收到消息时触发。

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `data` | `string` \| `ArrayBuffer` | 接收到的消息数据，可以是字符串或者 ArrayBuffer。 |

#### Returns

`void`

#### Defined in

[src/std/socket/socket\_define.ts:45](https://github.com/JiangJie/minigame-std/blob/d5a0bd55450bd8f6d3ddbc9f604a3e15ebaebf6d/src/std/socket/socket_define.ts#L45)

***

### open()

```ts
open(): void
```

当 WebSocket 连接成功打开时触发。

#### Returns

`void`

#### Defined in

[src/std/socket/socket\_define.ts:32](https://github.com/JiangJie/minigame-std/blob/d5a0bd55450bd8f6d3ddbc9f604a3e15ebaebf6d/src/std/socket/socket_define.ts#L32)
