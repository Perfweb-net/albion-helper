import { exportCompositionAsJpeg } from './compositionExport';

// Mock Image loading so tests run without network
beforeAll(() => {
    global.Image = class {
        constructor() {
            this.onload  = null;
            this.onerror = null;
        }
        set src(value) {
            // Resolve immediately for any URL
            setTimeout(() => this.onload && this.onload(), 0);
        }
    };

    global.URL.createObjectURL = jest.fn(() => 'blob:mock');
    global.URL.revokeObjectURL = jest.fn();
});

const mkPlayer = (name, overrides = {}) => ({
    name,
    weapon: { uniqueName: 'T4_MAIN_SWORD', name: 'Iron Sword', twoHanded: false },
    head: { uniqueName: 'T4_HEAD_PLATE', name: 'Plate Helm' },
    armor: { uniqueName: 'T4_ARMOR_PLATE', name: 'Plate Armor' },
    boots: { uniqueName: 'T4_SHOES_PLATE', name: 'Plate Boots' },
    offhand: { uniqueName: 'T4_OFF_TORCH', name: 'Torch' },
    cape: null,
    food: null,
    potion: null,
    mount: null,
    swaps: {},
    ...overrides,
});

const mkComp = (players, name = 'Test Comp') => ({
    name,
    owner: 'TestUser',
    players,
    visibility: 'url_only',
});

describe('exportCompositionAsJpeg', () => {
    let clickSpy;
    let appendSpy;
    let removeSpy;

    beforeEach(() => {
        clickSpy  = jest.fn();
        appendSpy = jest.spyOn(document.body, 'appendChild').mockImplementation(() => {});
        removeSpy = jest.spyOn(document.body, 'removeChild').mockImplementation(() => {});

        jest.spyOn(document, 'createElement').mockImplementation((tag) => {
            if (tag === 'a') return { click: clickSpy, href: '', download: '' };
            if (tag === 'canvas') {
                const canvas = {
                    width: 0,
                    height: 0,
                    getContext: jest.fn(() => ({
                        fillStyle: '',
                        strokeStyle: '',
                        lineWidth: 0,
                        font: '',
                        textAlign: '',
                        globalAlpha: 1,
                        fillRect: jest.fn(),
                        fillText: jest.fn(),
                        strokeRect: jest.fn(),
                        beginPath: jest.fn(),
                        closePath: jest.fn(),
                        moveTo: jest.fn(),
                        lineTo: jest.fn(),
                        quadraticCurveTo: jest.fn(),
                        fill: jest.fn(),
                        stroke: jest.fn(),
                        drawImage: jest.fn(),
                        measureText: jest.fn(() => ({ width: 50 })),
                        scale: jest.fn(),
                    })),
                    toDataURL: jest.fn(() => 'data:image/jpeg;base64,mock'),
                };
                return canvas;
            }
            return {};
        });
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    test('exports single page for 20 or fewer players', async () => {
        const comp = mkComp(Array.from({ length: 5 }, (_, i) => mkPlayer(`Player${i}`)));
        await exportCompositionAsJpeg(comp);
        expect(clickSpy).toHaveBeenCalledTimes(1);
    });

    test('exports multiple pages for more than 20 players', async () => {
        const comp = mkComp(Array.from({ length: 25 }, (_, i) => mkPlayer(`Player${i}`)));
        await exportCompositionAsJpeg(comp);
        expect(clickSpy).toHaveBeenCalledTimes(2);
    });

    test('handles players with swaps', async () => {
        const playerWithSwap = mkPlayer('SwapPlayer', {
            swaps: { weapon: { uniqueName: 'T4_MAIN_AXE', name: 'Iron Axe' } },
        });
        const comp = mkComp([playerWithSwap]);
        await expect(exportCompositionAsJpeg(comp)).resolves.not.toThrow();
        expect(clickSpy).toHaveBeenCalledTimes(1);
    });

    test('handles two-handed weapon (no offhand)', async () => {
        const p = mkPlayer('TwoHandPlayer', {
            weapon: { uniqueName: 'T4_2H_CLAYMORE', name: 'Claymore', twoHanded: true },
            offhand: null,
        });
        const comp = mkComp([p]);
        await expect(exportCompositionAsJpeg(comp)).resolves.not.toThrow();
    });

    test('handles empty players list (0 players)', async () => {
        const comp = mkComp([]);
        await expect(exportCompositionAsJpeg(comp)).resolves.not.toThrow();
        expect(clickSpy).toHaveBeenCalledTimes(1);
    });

    test('uses safe filename (special chars replaced)', async () => {
        const comp = mkComp([mkPlayer('P1')], 'My Comp: Test!');
        const links = [];
        jest.spyOn(document, 'createElement').mockImplementation((tag) => {
            if (tag === 'a') {
                const el = { click: jest.fn(), href: '', download: '' };
                links.push(el);
                return el;
            }
            if (tag === 'canvas') {
                return {
                    width: 0, height: 0,
                    getContext: jest.fn(() => ({
                        fillRect: jest.fn(), fillText: jest.fn(), strokeRect: jest.fn(),
                        beginPath: jest.fn(), closePath: jest.fn(), moveTo: jest.fn(),
                        lineTo: jest.fn(), quadraticCurveTo: jest.fn(), fill: jest.fn(),
                        stroke: jest.fn(), drawImage: jest.fn(),
                        measureText: jest.fn(() => ({ width: 50 })),
                        scale: jest.fn(),
                        fillStyle: '', strokeStyle: '', lineWidth: 0, font: '', textAlign: '',
                    })),
                    toDataURL: jest.fn(() => 'data:image/jpeg;base64,mock'),
                };
            }
            return {};
        });
        await exportCompositionAsJpeg(comp);
        expect(links[0].download).toMatch(/My_Comp__Test_/);
    });
});
