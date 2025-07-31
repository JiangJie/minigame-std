[**minigame-std**](../README.md)

***

[minigame-std](../README.md) / SocketListenerMap

# Interface: SocketListenerMap

Defined in: [src/std/socket/socket\_define.ts:29](https://github.com/JiangJie/minigame-std/blob/fdb22241c47c2e98329a4c62befde728957e03ee/src/std/socket/socket_define.ts#L29)

WebSocket 事件监听器映射接口，定义了与 WebSocket 事件对应的回调函数类型。

## Methods

### close()

```ts
close(code, reason): void
```

Defined in: [src/std/socket/socket\_define.ts:40](https://github.com/JiangJie/minigame-std/blob/fdb22241c47c2e98329a4c62befde728957e03ee/src/std/socket/socket_define.ts#L40)

当 WebSocket 连接关闭时触发。

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `code` | `number` | 表示关闭连接的状态码。 |
| `reason` | `string` | 表示关闭连接的原因。 |

#### Returns

`void`

***

### error()

```ts
error(err): void
```

Defined in: [src/std/socket/socket\_define.ts:52](https://github.com/JiangJie/minigame-std/blob/fdb22241c47c2e98329a4c62befde728957e03ee/src/std/socket/socket_define.ts#L52)

当 WebSocket 连接发生错误时触发。

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `err` | `Error` | 发生的错误对象。 |

#### Returns

`void`

***

### message()

```ts
message(data): void
```

Defined in: [src/std/socket/socket\_define.ts:46](https://github.com/JiangJie/minigame-std/blob/fdb22241c47c2e98329a4c62befde728957e03ee/src/std/socket/socket_define.ts#L46)

当 WebSocket 接收到消息时触发。

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `data` | `string` \| `ArrayBuffer` | 接收到的消息数据，可以是字符串或者 ArrayBuffer。 |

#### Returns

`void`

***

### open()

```ts
open(): void
```

Defined in: [src/std/socket/socket\_define.ts:33](https://github.com/JiangJie/minigame-std/blob/fdb22241c47c2e98329a4c62befde728957e03ee/src/std/socket/socket_define.ts#L33)

当 WebSocket 连接成功打开时触发。

#### Returns

`void`
