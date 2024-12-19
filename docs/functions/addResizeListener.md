[**minigame-std**](../README.md)

***

[minigame-std](../README.md) / addResizeListener

# Function: addResizeListener()

```ts
function addResizeListener(listener): () => void
```

添加窗口大小变化监听器。

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `listener` | `OnWindowResizeCallback` | 窗口大小变化的回调函数。 |

## Returns

`Function`

返回一个函数，调用该函数可以移除监听器。

### Returns

`void`

## Defined in

[src/std/event/mod.ts:49](https://github.com/JiangJie/minigame-std/blob/eeac001add8ab13d21bab6e48cf53f07cd0a9aad/src/std/event/mod.ts#L49)
