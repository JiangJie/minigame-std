**minigame-std** • **Docs**

***

# minigame-std

## Namespaces

| Namespace | Description |
| ------ | ------ |
| [clipboard](namespaces/clipboard/README.md) | - |
| [fs](namespaces/fs/README.md) | - |
| [platform](namespaces/platform/README.md) | - |
| [storage](namespaces/storage/README.md) | - |

## Enumerations

| Enumeration | Description |
| ------ | ------ |
| [SocketReadyState](enumerations/SocketReadyState.md) | WebSocket 连接状态，小游戏环境可用。 |

## Interfaces

| Interface | Description |
| ------ | ------ |
| [ISocket](interfaces/ISocket.md) | WebSocket 接口定义，描述了 WebSocket 的基本操作方法。 |
| [MinaFetchInit](interfaces/MinaFetchInit.md) | 微信小游戏网络请求初始化配置接口，继承自微信小游戏请求选项，除去'url'和'responseType'。 |
| [SocketListenerMap](interfaces/SocketListenerMap.md) | WebSocket 事件监听器映射接口，定义了与 WebSocket 事件对应的回调函数类型。 |

## Type Aliases

| Type alias | Description |
| ------ | ------ |
| [NetworkType](type-aliases/NetworkType.md) | 网络状态，混合了 web 和小游戏环境。 |
| [SocketOptions](type-aliases/SocketOptions.md) | 创建Socket的可选参数。 |
| [UnionFetchInit](type-aliases/UnionFetchInit.md) | 联合网络请求初始化配置类型，结合了 FetchInit 和 MinaFetchInit。 |

## Functions

| Function | Description |
| ------ | ------ |
| [addErrorListener](functions/addErrorListener.md) | 添加错误监听器，用于监听标准的错误事件。 |
| [addNetworkChangeListener](functions/addNetworkChangeListener.md) | 监听网络状态变化。 |
| [addUnhandledrejectionListener](functions/addUnhandledrejectionListener.md) | 添加未处理的 Promise 拒绝事件监听器。 |
| [assertSafeSocketUrl](functions/assertSafeSocketUrl.md) | 断言传入的 WebSocket URL 是否为 `wss` 协议。 |
| [assertSafeUrl](functions/assertSafeUrl.md) | 断言传入的 URL 是否为 `https` 协议。 |
| [assertString](functions/assertString.md) | 断言传入的是一个字符串。 |
| [base64FromArrayBuffer](functions/base64FromArrayBuffer.md) | Converts Uint8Array into a base64 encoded string. |
| [base64ToArrayBuffer](functions/base64ToArrayBuffer.md) | Converts a base64 encoded string to an Uint8Array |
| [connectSocket](functions/connectSocket.md) | 创建并返回一个 WebSocket 连接。 |
| [decode](functions/decode.md) | 将二进制数据解码为字符串。 |
| [decodeBase64](functions/decodeBase64.md) | 将 Base64 格式的字符串数据解码。 |
| [encode](functions/encode.md) | 将字符串数据编码为 `Uint8Array` |
| [encodeBase64](functions/encodeBase64.md) | 将字符串数据编码为 Base64 格式。 |
| [fetchT](functions/fetchT.md) | 发起一个可中断的文本类型响应的网络请求。 |
| [getNetworkType](functions/getNetworkType.md) | 获取网络状态。 |
| [miniGameFailureToError](functions/miniGameFailureToError.md) | 将小游戏失败回调的结果转换为 `Error` 类型。 |
| [miniGameFailureToResult](functions/miniGameFailureToResult.md) | 将错误对象转换为 IOResult 类型。 |
| [tryDOMAsyncOp](functions/tryDOMAsyncOp.md) | 执行异步函数，预期异常都是 `DOMException`。 |
| [tryDOMSyncOp](functions/tryDOMSyncOp.md) | 执行同步函数，预期异常都是 `DOMException`。 |
| [tryGeneralAsyncOp](functions/tryGeneralAsyncOp.md) | 执行异步函数，预期异常都是 `WechatMinigame.GeneralCallbackResult`。 |
| [tryGeneralSyncOp](functions/tryGeneralSyncOp.md) | 执行同步函数，预期异常都是 `WechatMinigame.GeneralCallbackResult`。 |
