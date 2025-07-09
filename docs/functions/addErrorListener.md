[**minigame-std**](../README.md)

***

[minigame-std](../README.md) / addErrorListener

# Function: addErrorListener()

```ts
function addErrorListener(listener): () => void
```

Defined in: [src/std/event/mod.ts:18](https://github.com/JiangJie/minigame-std/blob/c702c23d8258d9dd96d873df515d0027c84fb302/src/std/event/mod.ts#L18)

添加错误监听器，用于监听标准的错误事件。

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `listener` | (`ev`) => `void` | 错误事件的回调函数。 |

## Returns

`Function`

返回一个函数，调用该函数可以移除监听器。

### Returns

`void`
