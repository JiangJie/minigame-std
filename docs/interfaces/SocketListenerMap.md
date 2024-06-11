[**minigame-std**](../index.md) • **Docs**

***

[minigame-std](../index.md) / SocketListenerMap

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
| :------ | :------ | :------ |
| `code` | `number` | 表示关闭连接的状态码。 |
| `reason` | `string` | 表示关闭连接的原因。 |

#### Returns

`void`

#### Source

[src/std/socket/socket\_define.ts:17](https://github.com/JiangJie/minigame-std/blob/fe87039c9bf9e09f2936bdac3b9a02fcf5e4b50c/src/std/socket/socket_define.ts#L17)

***

### error()

```ts
error(err): void
```

当 WebSocket 连接发生错误时触发。

#### Parameters

| Parameter | Type | Description |
| :------ | :------ | :------ |
| `err` | `Error` | 发生的错误对象。 |

#### Returns

`void`

#### Source

[src/std/socket/socket\_define.ts:29](https://github.com/JiangJie/minigame-std/blob/fe87039c9bf9e09f2936bdac3b9a02fcf5e4b50c/src/std/socket/socket_define.ts#L29)

***

### message()

```ts
message(data): void
```

当 WebSocket 接收到消息时触发。

#### Parameters

| Parameter | Type | Description |
| :------ | :------ | :------ |
| `data` | `string` \| `ArrayBuffer` | 接收到的消息数据，可以是字符串或者 ArrayBuffer。 |

#### Returns

`void`

#### Source

[src/std/socket/socket\_define.ts:23](https://github.com/JiangJie/minigame-std/blob/fe87039c9bf9e09f2936bdac3b9a02fcf5e4b50c/src/std/socket/socket_define.ts#L23)

***

### open()

```ts
open(): void
```

当 WebSocket 连接成功打开时触发。

#### Returns

`void`

#### Source

[src/std/socket/socket\_define.ts:10](https://github.com/JiangJie/minigame-std/blob/fe87039c9bf9e09f2936bdac3b9a02fcf5e4b50c/src/std/socket/socket_define.ts#L10)
