import { lbs } from 'minigame-std';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';

// Store original geolocation
let originalGeolocation: Geolocation;

beforeEach(() => {
    originalGeolocation = navigator.geolocation;
});

afterEach(() => {
    Object.defineProperty(navigator, 'geolocation', {
        value: originalGeolocation,
        configurable: true,
    });
});

test('getCurrentPosition returns position on success', async () => {
    const mockPosition: GeolocationPosition = {
        coords: {
            latitude: 39.9042,
            longitude: 116.4074,
            accuracy: 10,
            altitude: null,
            altitudeAccuracy: null,
            heading: null,
            speed: null,
            toJSON() {
                return mockPosition.coords;
            },
        },
        timestamp: Date.now(),
        toJSON() {
            return mockPosition;
        },
    };

    const mockGetCurrentPosition = vi.fn().mockImplementation((success) => {
        success(mockPosition);
    });

    Object.defineProperty(navigator, 'geolocation', {
        value: {
            getCurrentPosition: mockGetCurrentPosition,
        },
        configurable: true,
    });

    const result = await lbs.getCurrentPosition();

    expect(result.isOk()).toBe(true);
    expect(result.unwrap()).toEqual({
        latitude: 39.9042,
        longitude: 116.4074,
    });
    expect(mockGetCurrentPosition).toHaveBeenCalled();
});

test('getCurrentPosition returns error on failure', async () => {
    const mockError: GeolocationPositionError = {
        code: 1, // PERMISSION_DENIED
        message: 'User denied geolocation',
        PERMISSION_DENIED: 1,
        POSITION_UNAVAILABLE: 2,
        TIMEOUT: 3,
    };

    const mockGetCurrentPosition = vi.fn().mockImplementation((_, error) => {
        error(mockError);
    });

    Object.defineProperty(navigator, 'geolocation', {
        value: {
            getCurrentPosition: mockGetCurrentPosition,
        },
        configurable: true,
    });

    const result = await lbs.getCurrentPosition();

    expect(result.isErr()).toBe(true);
    expect(result.unwrapErr().message).toBe('User denied geolocation');
});

test('getCurrentPosition handles POSITION_UNAVAILABLE error', async () => {
    const mockError: GeolocationPositionError = {
        code: 2, // POSITION_UNAVAILABLE
        message: 'Position unavailable',
        PERMISSION_DENIED: 1,
        POSITION_UNAVAILABLE: 2,
        TIMEOUT: 3,
    };

    const mockGetCurrentPosition = vi.fn().mockImplementation((_, error) => {
        error(mockError);
    });

    Object.defineProperty(navigator, 'geolocation', {
        value: {
            getCurrentPosition: mockGetCurrentPosition,
        },
        configurable: true,
    });

    const result = await lbs.getCurrentPosition();

    expect(result.isErr()).toBe(true);
    expect(result.unwrapErr().message).toBe('Position unavailable');
});

test('getCurrentPosition handles TIMEOUT error', async () => {
    const mockError: GeolocationPositionError = {
        code: 3, // TIMEOUT
        message: 'Geolocation timeout',
        PERMISSION_DENIED: 1,
        POSITION_UNAVAILABLE: 2,
        TIMEOUT: 3,
    };

    const mockGetCurrentPosition = vi.fn().mockImplementation((_, error) => {
        error(mockError);
    });

    Object.defineProperty(navigator, 'geolocation', {
        value: {
            getCurrentPosition: mockGetCurrentPosition,
        },
        configurable: true,
    });

    const result = await lbs.getCurrentPosition();

    expect(result.isErr()).toBe(true);
    expect(result.unwrapErr().message).toBe('Geolocation timeout');
});

test('getCurrentPosition returns correct coordinates for different locations', async () => {
    // Test with Tokyo coordinates
    const tokyoPosition: GeolocationPosition = {
        coords: {
            latitude: 35.6762,
            longitude: 139.6503,
            accuracy: 5,
            altitude: null,
            altitudeAccuracy: null,
            heading: null,
            speed: null,
            toJSON() {
                return tokyoPosition.coords;
            },
        },
        timestamp: Date.now(),
        toJSON() {
            return tokyoPosition;
        },
    };

    const mockGetCurrentPosition = vi.fn().mockImplementation((success) => {
        success(tokyoPosition);
    });

    Object.defineProperty(navigator, 'geolocation', {
        value: {
            getCurrentPosition: mockGetCurrentPosition,
        },
        configurable: true,
    });

    const result = await lbs.getCurrentPosition();

    expect(result.isOk()).toBe(true);
    const pos = result.unwrap();
    expect(pos.latitude).toBe(35.6762);
    expect(pos.longitude).toBe(139.6503);
});

test('GeoPosition type is exported correctly', () => {
    // Type check - this test ensures the type is exported
    const position: lbs.GeoPosition = {
        latitude: 0,
        longitude: 0,
    };

    expect(position.latitude).toBe(0);
    expect(position.longitude).toBe(0);
});
