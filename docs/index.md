**minigame-std** • **Docs**

***

# minigame-std

## Namespaces

| Namespace | Description |
| :------ | :------ |
| [clipboard](namespaces/clipboard/index.md) | - |
| [fs](namespaces/fs/index.md) | - |
| [platform](namespaces/platform/index.md) | - |
| [storage](namespaces/storage/index.md) | - |

## Interfaces

| Interface | Description |
| :------ | :------ |
| [ISocket](interfaces/ISocket.md) | WebSocket 接口定义，描述了 WebSocket 的基本操作方法。 |
| [MinaFetchInit](interfaces/MinaFetchInit.md) | 微信小游戏网络请求初始化配置接口，继承自微信小游戏请求选项，除去'url'和'responseType'。 |
| [SocketListenerMap](interfaces/SocketListenerMap.md) | WebSocket 事件监听器映射接口，定义了与 WebSocket 事件对应的回调函数类型。 |

## Type Aliases

| Type alias | Description |
| :------ | :------ |
| [UnionFetchInit](type-aliases/UnionFetchInit.md) | 联合网络请求初始化配置类型，结合了 FetchInit 和 MinaFetchInit。 |

## Functions

| Function | Description |
| :------ | :------ |
| [addErrorListener](functions/addErrorListener.md) | 添加错误监听器，用于监听标准的错误事件。 |
| [addUnhandledrejectionListener](functions/addUnhandledrejectionListener.md) | 添加未处理的 Promise 拒绝事件监听器。 |
| [assertSafeSocketUrl](functions/assertSafeSocketUrl.md) | 断言传入的 WebSocket URL 是否为 `wss` 协议。 |
| [assertSafeUrl](functions/assertSafeUrl.md) | 断言传入的 URL 是否为 `https` 协议。 |
| [assertString](functions/assertString.md) | 断言传入的是一个字符串。 |
| [base64FromArrayBuffer](functions/base64FromArrayBuffer.md) | Converts ArrayBuffer into a base64 encoded string. |
| [base64ToArrayBuffer](functions/base64ToArrayBuffer.md) | Converts a base64 encoded string to an ArrayBuffer |
| [connectSocket](functions/connectSocket.md) | 创建并返回一个 WebSocket 连接。 |
| [decode](functions/decode.md) | 将一段`ArrayBuffer`解码为`utf8`字符串 |
| [decodeBase64](functions/decodeBase64.md) | 将 Base64 格式的字符串数据解码。 |
| [encode](functions/encode.md) | 将`utf8`字符串编码为`ArrayBuffer` |
| [encodeBase64](functions/encodeBase64.md) | 将字符串数据编码为 Base64 格式。 |
| [fetchT](functions/fetchT.md) | 发起一个可中断的文本类型响应的网络请求。 |
