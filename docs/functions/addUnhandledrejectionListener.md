[**minigame-std**](../README.md)

***

[minigame-std](../README.md) / addUnhandledrejectionListener

# Function: addUnhandledrejectionListener()

```ts
function addUnhandledrejectionListener(listener): () => void
```

Defined in: [src/std/event/mod.ts:38](https://github.com/JiangJie/minigame-std/blob/c702c23d8258d9dd96d873df515d0027c84fb302/src/std/event/mod.ts#L38)

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
