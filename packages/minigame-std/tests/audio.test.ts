import { afterAll, afterEach, beforeAll, expect, test } from 'vitest';
import { audio, fs } from '../src/mod.ts';

// Generate a simple WAV file buffer (100ms of silence)
function generateSilentWavBuffer(): ArrayBuffer {
    const sampleRate = 44100;
    const numChannels = 1;
    const bitsPerSample = 16;
    const duration = 0.1; // 100ms
    const numSamples = Math.floor(sampleRate * duration);
    const dataSize = numSamples * numChannels * (bitsPerSample / 8);
    const headerSize = 44;
    const fileSize = headerSize + dataSize;

    const buffer = new ArrayBuffer(fileSize);
    const view = new DataView(buffer);

    // RIFF header
    writeString(view, 0, 'RIFF');
    view.setUint32(4, fileSize - 8, true);
    writeString(view, 8, 'WAVE');

    // fmt subchunk
    writeString(view, 12, 'fmt ');
    view.setUint32(16, 16, true); // Subchunk1Size (16 for PCM)
    view.setUint16(20, 1, true); // AudioFormat (1 for PCM)
    view.setUint16(22, numChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * numChannels * (bitsPerSample / 8), true); // ByteRate
    view.setUint16(32, numChannels * (bitsPerSample / 8), true); // BlockAlign
    view.setUint16(34, bitsPerSample, true);

    // data subchunk
    writeString(view, 36, 'data');
    view.setUint32(40, dataSize, true);

    // Audio data (silence - all zeros)
    // Already zeros from ArrayBuffer initialization

    return buffer;
}

function writeString(view: DataView, offset: number, str: string): void {
    for (let i = 0; i < str.length; i++) {
        view.setUint8(offset + i, str.charCodeAt(i));
    }
}

const TEST_DIR = '/audio-test';

beforeAll(async () => {
    await fs.remove(TEST_DIR);
    await fs.mkdir(TEST_DIR);
});

afterAll(async () => {
    await audio.closeGlobalAudioContext();
    await fs.remove(TEST_DIR);
});

afterEach(async () => {
    // Close and reset audio context between tests
    await audio.closeGlobalAudioContext();
});

test('createWebAudioContext creates an AudioContext', () => {
    const context = audio.createWebAudioContext();

    expect(context).toBeInstanceOf(AudioContext);
    expect(context.state).toBeDefined();

    context.close();
});

test('getGlobalAudioContext returns cached AudioContext', () => {
    const context1 = audio.getGlobalAudioContext();
    const context2 = audio.getGlobalAudioContext();

    expect(context1).toBe(context2);
    expect(context1).toBeInstanceOf(AudioContext);
});

test('closeGlobalAudioContext closes the cached context', async () => {
    const context = audio.getGlobalAudioContext();
    expect(context.state).not.toBe('closed');

    const result = await audio.closeGlobalAudioContext();
    expect(result.isOk()).toBe(true);

    // After closing, getting a new context should create a new one
    const newContext = audio.getGlobalAudioContext();
    expect(newContext).not.toBe(context);
});

test('closeGlobalAudioContext handles null context gracefully', async () => {
    // First close any existing context
    await audio.closeGlobalAudioContext();

    // Calling again should not throw
    const result = await audio.closeGlobalAudioContext();
    expect(result.isOk()).toBe(true);
});

test('playWebAudioFromAudioBuffer plays audio', async () => {
    const context = audio.getGlobalAudioContext();
    const wavBuffer = generateSilentWavBuffer();
    const audioBuffer = await context.decodeAudioData(wavBuffer);

    const source = audio.playWebAudioFromAudioBuffer(audioBuffer);

    expect(source).toBeInstanceOf(AudioBufferSourceNode);
    expect(source.buffer).toBe(audioBuffer);
    expect(source.loop).toBe(false);

    source.stop();
});

test('playWebAudioFromAudioBuffer with loop option', async () => {
    const context = audio.getGlobalAudioContext();
    const wavBuffer = generateSilentWavBuffer();
    const audioBuffer = await context.decodeAudioData(wavBuffer);

    const source = audio.playWebAudioFromAudioBuffer(audioBuffer, { loop: true });

    expect(source.loop).toBe(true);

    source.stop();
});

test('playWebAudioFromAudioBuffer with autoDisconnect false', async () => {
    const context = audio.getGlobalAudioContext();
    const wavBuffer = generateSilentWavBuffer();
    const audioBuffer = await context.decodeAudioData(wavBuffer);

    const source = audio.playWebAudioFromAudioBuffer(audioBuffer, { autoDisconnect: false });

    expect(source.onended).toBe(null);

    source.stop();
});

test('playWebAudioFromAudioBuffer autoDisconnect true sets onended handler', async () => {
    const context = audio.getGlobalAudioContext();
    const wavBuffer = generateSilentWavBuffer();
    const audioBuffer = await context.decodeAudioData(wavBuffer);

    const source = audio.playWebAudioFromAudioBuffer(audioBuffer, { autoDisconnect: true });

    // onended should be set when autoDisconnect is true
    expect(source.onended).not.toBe(null);
    expect(typeof source.onended).toBe('function');

    // The onended handler should call disconnect when triggered
    // We verify this by checking the handler exists and is a function
    // The actual disconnect behavior is tested implicitly through the handler

    source.stop();
});

test('playWebAudioFromAudioBuffer autoDisconnect false does not set onended handler', async () => {
    const context = audio.getGlobalAudioContext();
    const wavBuffer = generateSilentWavBuffer();
    const audioBuffer = await context.decodeAudioData(wavBuffer);

    const source = audio.playWebAudioFromAudioBuffer(audioBuffer, { autoDisconnect: false });

    // onended should be null when autoDisconnect is false
    expect(source.onended).toBe(null);

    source.stop();
});

test('playWebAudioFromAudioBuffer default autoDisconnect is true', async () => {
    const context = audio.getGlobalAudioContext();
    const wavBuffer = generateSilentWavBuffer();
    const audioBuffer = await context.decodeAudioData(wavBuffer);

    // Call without options - default autoDisconnect should be true
    const source = audio.playWebAudioFromAudioBuffer(audioBuffer);

    // onended should be set (default autoDisconnect is true)
    expect(source.onended).not.toBe(null);
    expect(typeof source.onended).toBe('function');

    source.stop();
});

test('playWebAudioFromAudioBuffer onended handler calls disconnect', async () => {
    const context = audio.getGlobalAudioContext();
    const wavBuffer = generateSilentWavBuffer();
    const audioBuffer = await context.decodeAudioData(wavBuffer);

    const source = audio.playWebAudioFromAudioBuffer(audioBuffer, { autoDisconnect: true });

    // Get the original onended handler
    const originalOnended = source.onended;
    expect(originalOnended).not.toBe(null);

    // Manually trigger the onended handler to verify it calls disconnect
    // Create a mock event
    const mockEvent = new Event('ended');

    // Track if disconnect was called
    let disconnectCalled = false;
    const originalDisconnect = source.disconnect.bind(source);
    source.disconnect = () => {
        disconnectCalled = true;
        originalDisconnect();
    };

    // Trigger the handler
    if (originalOnended) {
        originalOnended.call(source, mockEvent);
    }

    expect(disconnectCalled).toBe(true);

    // Clean up - stop the source (may already be stopped/disconnected)
    try {
        source.stop();
    } catch {
        // Ignore errors if already stopped
    }
});

test('playWebAudioFromArrayBuffer decodes and plays', async () => {
    const wavBuffer = generateSilentWavBuffer();

    const result = await audio.playWebAudioFromBufferSource(wavBuffer);

    expect(result.isOk()).toBe(true);

    const source = result.unwrap();
    expect(source).toBeInstanceOf(AudioBufferSourceNode);
    expect(source.buffer).not.toBeNull();

    source.stop();
});

test('playWebAudioFromArrayBuffer with Uint8Array', async () => {
    const wavBuffer = generateSilentWavBuffer();
    const uint8Array = new Uint8Array(wavBuffer);

    const result = await audio.playWebAudioFromBufferSource(uint8Array);

    expect(result.isOk()).toBe(true);

    const source = result.unwrap();
    expect(source).toBeInstanceOf(AudioBufferSourceNode);

    source.stop();
});

test('playWebAudioFromFile plays audio from file', async () => {
    const filePath = `${TEST_DIR}/test-audio.wav`;
    const wavBuffer = generateSilentWavBuffer();

    // Write the WAV file to OPFS
    const writeResult = await fs.writeFile(filePath, wavBuffer);
    expect(writeResult.isOk()).toBe(true);

    // Play from file
    const result = await audio.playWebAudioFromFile(filePath);

    expect(result.isOk()).toBe(true);

    const source = result.unwrap();
    expect(source).toBeInstanceOf(AudioBufferSourceNode);

    source.stop();
});

test('playWebAudioFromFile returns error for non-existent file', async () => {
    const result = await audio.playWebAudioFromFile('/non-existent/audio.wav');

    expect(result.isErr()).toBe(true);
});

test('playWebAudioFromFile with options', async () => {
    const filePath = `${TEST_DIR}/test-audio-options.wav`;
    const wavBuffer = generateSilentWavBuffer();

    await fs.writeFile(filePath, wavBuffer);

    const result = await audio.playWebAudioFromFile(filePath, {
        loop: true,
        autoDisconnect: false,
    });

    expect(result.isOk()).toBe(true);

    const source = result.unwrap();
    expect(source.loop).toBe(true);
    expect(source.onended).toBe(null);

    source.stop();
});

test('AudioContext can decode various audio formats', async () => {
    const context = audio.getGlobalAudioContext();
    const wavBuffer = generateSilentWavBuffer();

    // Should successfully decode WAV
    const audioBuffer = await context.decodeAudioData(wavBuffer);

    expect(audioBuffer).toBeInstanceOf(AudioBuffer);
    expect(audioBuffer.numberOfChannels).toBe(1);
    // AudioContext.decodeAudioData resamples to the context's sample rate
    expect(audioBuffer.sampleRate).toBe(context.sampleRate);
});

test('PlayOptions interface has correct defaults', async () => {
    const context = audio.getGlobalAudioContext();
    const wavBuffer = generateSilentWavBuffer();
    const audioBuffer = await context.decodeAudioData(wavBuffer);

    // Call without options - should use defaults
    const source = audio.playWebAudioFromAudioBuffer(audioBuffer);

    // Default loop is false
    expect(source.loop).toBe(false);

    // Default autoDisconnect is true - onended should be set
    expect(source.onended).not.toBe(null);

    source.stop();
});
