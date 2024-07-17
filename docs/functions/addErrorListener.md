[**minigame-std**](../README.md) • **Docs**

***

[minigame-std](../README.md) / addErrorListener

# Function: addErrorListener()

```ts
function addErrorListener(listener): () => void
```

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

## Defined in

[event/mod.ts:10](https://github.com/JiangJie/minigame-std/blob/1187f9b62000e3d29782e461fb54ceb4107f512c/src/std/event/mod.ts#L10)
