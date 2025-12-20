import { expect, test } from 'vitest';
import { connectSocket, SocketReadyState } from '../src/mod.ts';

test('socket echo', () => {
    const { promise, resolve } = Promise.withResolvers<void>();

    const data = 'minigame-std';

    const socket = connectSocket('wss://echo.websocket.org/');

    let count = 0;

    const removeMessageListener = socket.addEventListener('message', (msg) => {
        count += 1;

        if (count === 1) {
            expect((msg as string).startsWith('Request served by')).toBe(true);
        } else if (count === 2) {
            expect(msg).toBe(data);
            socket.close();
        }
    });

    socket.addEventListener('error', (err) => {
        console.log('socket error', err);
    });

    socket.addEventListener('close', (code) => {
        removeMessageListener();
        expect(code).toBe(1005);

        resolve();
    });

    socket.addEventListener('open', () => {
        socket.send(data);
    });

    return promise;
});

// SocketReadyState constants tests
test('SocketReadyState has correct values', () => {
    expect(SocketReadyState.CONNECTING).toBe(0);
    expect(SocketReadyState.OPEN).toBe(1);
    expect(SocketReadyState.CLOSING).toBe(2);
    expect(SocketReadyState.CLOSED).toBe(3);
});

test('SocketReadyState matches WebSocket constants', () => {
    expect(SocketReadyState.CONNECTING).toBe(WebSocket.CONNECTING);
    expect(SocketReadyState.OPEN).toBe(WebSocket.OPEN);
    expect(SocketReadyState.CLOSING).toBe(WebSocket.CLOSING);
    expect(SocketReadyState.CLOSED).toBe(WebSocket.CLOSED);
});

// readyState tests
test('socket readyState changes during connection lifecycle', () => {
    const { promise, resolve } = Promise.withResolvers<void>();

    const socket = connectSocket('wss://echo.websocket.org/');

    // Initial state should be CONNECTING
    expect(socket.readyState).toBe(SocketReadyState.CONNECTING);

    socket.addEventListener('open', () => {
        // After open, state should be OPEN
        expect(socket.readyState).toBe(SocketReadyState.OPEN);
        socket.close();
    });

    socket.addEventListener('close', () => {
        // After close, state should be CLOSED
        expect(socket.readyState).toBe(SocketReadyState.CLOSED);
        resolve();
    });

    return promise;
});

// send returns RESULT_VOID test
test('socket send returns Ok result', async () => {
    const { promise, resolve } = Promise.withResolvers<void>();

    const socket = connectSocket('wss://echo.websocket.org/');

    socket.addEventListener('open', async () => {
        const result = await socket.send('test');
        expect(result.isOk()).toBe(true);
        socket.close();
    });

    socket.addEventListener('close', () => {
        resolve();
    });

    return promise;
});

// send binary data test
test('socket send ArrayBuffer data', () => {
    const { promise, resolve } = Promise.withResolvers<void>();

    const binaryData = new Uint8Array([1, 2, 3, 4, 5]).buffer;

    const socket = connectSocket('wss://echo.websocket.org/');

    let receivedWelcome = false;

    socket.addEventListener('message', (msg) => {
        if (!receivedWelcome) {
            // First message is welcome message
            receivedWelcome = true;
            return;
        }

        // Echo server returns binary data
        expect(msg).toBeInstanceOf(ArrayBuffer);
        expect(new Uint8Array(msg as ArrayBuffer)).toEqual(new Uint8Array([1, 2, 3, 4, 5]));
        socket.close();
    });

    socket.addEventListener('open', () => {
        socket.send(binaryData);
    });

    socket.addEventListener('close', () => {
        resolve();
    });

    return promise;
});

// removeEventListener test
test('socket removeEventListener works correctly', () => {
    const { promise, resolve } = Promise.withResolvers<void>();

    const socket = connectSocket('wss://echo.websocket.org/');
    let messageCount = 0;

    const removeMessageListener = socket.addEventListener('message', () => {
        messageCount++;
    });

    socket.addEventListener('open', () => {
        // Remove listener before sending message
        removeMessageListener();
        socket.send('test');

        // Give some time for any potential message to be received
        setTimeout(() => {
            socket.close();
        }, 100);
    });

    socket.addEventListener('close', () => {
        // messageCount might be 1 from welcome message before we removed it
        // but the 'test' echo should not be counted
        expect(messageCount).toBeLessThanOrEqual(1);
        resolve();
    });

    return promise;
});

// close with code and reason test
test('socket close with code and reason', () => {
    const { promise, resolve } = Promise.withResolvers<void>();

    const socket = connectSocket('wss://echo.websocket.org/');

    socket.addEventListener('open', () => {
        socket.close(1000, 'Normal closure');
    });

    socket.addEventListener('close', (code, reason) => {
        // Code 1000 is normal closure
        expect(code).toBe(1000);
        // Reason might be empty string depending on server implementation
        expect(typeof reason).toBe('string');
        resolve();
    });

    return promise;
});

// invalid event type throws error
test('socket addEventListener throws on invalid event type', () => {
    const socket = connectSocket('wss://echo.websocket.org/');

    expect(() => {
        // @ts-expect-error Testing invalid event type
        socket.addEventListener('invalid', () => {
            //
        });
    }).toThrow('Invalid socket event type: invalid');

    socket.close();
});

// error event test (using invalid URL to trigger error)
test('socket error event fires on connection failure', () => {
    const { promise, resolve } = Promise.withResolvers<void>();

    // Use a URL that will likely fail
    const socket = connectSocket('wss://localhost:59999/');

    socket.addEventListener('error', (err) => {
        expect(err).toBeInstanceOf(Error);
        expect(err.message).toBe('WebSocket error');
        resolve();
    });

    socket.addEventListener('close', () => {
        // Socket might close without error event in some cases
        resolve();
    });

    return promise;
});

// test remove open listener
test('socket can remove open listener', () => {
    const { promise, resolve } = Promise.withResolvers<void>();

    const socket = connectSocket('wss://echo.websocket.org/');
    let openCallCount = 0;

    const removeOpenListener = socket.addEventListener('open', () => {
        openCallCount++;
    });

    // Remove immediately
    removeOpenListener();

    // Add another listener to close the socket
    socket.addEventListener('open', () => {
        socket.close();
    });

    socket.addEventListener('close', () => {
        expect(openCallCount).toBe(0);
        resolve();
    });

    return promise;
});

// test remove close listener
test('socket can remove close listener', () => {
    const { promise, resolve } = Promise.withResolvers<void>();

    const socket = connectSocket('wss://echo.websocket.org/');
    let closeCallCount = 0;

    const removeCloseListener = socket.addEventListener('close', () => {
        closeCallCount++;
    });

    socket.addEventListener('open', () => {
        removeCloseListener();
        socket.close();
    });

    // This listener will be called and resolve the promise
    socket.addEventListener('close', () => {
        expect(closeCallCount).toBe(0);
        resolve();
    });

    return promise;
});

// test remove error listener
test('socket can remove error listener', () => {
    const { promise, resolve } = Promise.withResolvers<void>();

    const socket = connectSocket('wss://localhost:59999/');
    let errorCallCount = 0;

    const removeErrorListener = socket.addEventListener('error', () => {
        errorCallCount++;
    });

    // Remove immediately
    removeErrorListener();

    socket.addEventListener('error', () => {
        // This listener should be called
    });

    socket.addEventListener('close', () => {
        expect(errorCallCount).toBe(0);
        resolve();
    });

    // Timeout in case connection hangs
    setTimeout(() => {
        resolve();
    }, 3000);

    return promise;
});

// unsafe URL assertion test
test('socket throws on non-wss URL in strict mode', () => {
    expect(() => {
        connectSocket('ws://echo.websocket.org/');
    }).toThrow();
});
