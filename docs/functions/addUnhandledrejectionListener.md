[**minigame-std**](../README.md)

***

[minigame-std](../README.md) / addUnhandledrejectionListener

# Function: addUnhandledrejectionListener()

```ts
function addUnhandledrejectionListener(listener): () => void
```

Defined in: [src/std/event/mod.ts:38](https://github.com/JiangJie/minigame-std/blob/fdb22241c47c2e98329a4c62befde728957e03ee/src/std/event/mod.ts#L38)

添加未处理的 Promise 拒绝事件监听器。

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `listener` | (`ev`) => `void` | 未处理的 Promise 拒绝事件的回调函数。 |

## Returns

`Function`

返回一个函数，调用该函数可以移除监听器。

### Returns

`void`
