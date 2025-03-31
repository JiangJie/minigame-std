[**minigame-std**](../../../README.md)

***

[minigame-std](../../../README.md) / [cryptos](../README.md) / Md5

# Class: Md5

Md5 hash

## Constructors

### new Md5()

```ts
new Md5(): Md5
```

#### Returns

[`Md5`](Md5.md)

## Methods

### digest()

```ts
digest(): ArrayBuffer
```

Returns final hash.

#### Returns

`ArrayBuffer`

#### Defined in

[src/std/crypto/md/md5.ts:184](https://github.com/JiangJie/minigame-std/blob/8633d80114dee6c79033ec094d8233bd8263bedc/src/std/crypto/md/md5.ts#L184)

***

### toString()

```ts
toString(): string
```

Returns hash as a hex string.

#### Returns

`string`

#### Defined in

[src/std/crypto/md/md5.ts:218](https://github.com/JiangJie/minigame-std/blob/8633d80114dee6c79033ec094d8233bd8263bedc/src/std/crypto/md/md5.ts#L218)

***

### update()

```ts
update(data): this
```

Update internal state.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `data` | [`DataSource`](../../../type-aliases/DataSource.md) | data to update, data cannot exceed 2^32 bytes. |

#### Returns

`this`

#### Defined in

[src/std/crypto/md/md5.ts:147](https://github.com/JiangJie/minigame-std/blob/8633d80114dee6c79033ec094d8233bd8263bedc/src/std/crypto/md/md5.ts#L147)
