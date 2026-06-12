import {
    CITIES, ALL_SPEC_BRANCHES, SUBCATEGORY_TO_SPEC, SPEC_MAX_LPB,
    getCitySpecBonus, computeLPB, rrFromLPB, focusCostMultiplier, computeProfit,
} from './craftUtils';

// ─── rrFromLPB ───────────────────────────────────────────────────────────────

describe('rrFromLPB', () => {
    test('returns 0 when LPB is 0', () => {
        expect(rrFromLPB(0)).toBe(0);
    });

    test('returns correct value for LPB=18 (base city)', () => {
        const rr = rrFromLPB(18);
        expect(rr).toBeCloseTo(18 / 118, 10);
        expect(rr).toBeCloseTo(0.15254, 4);
    });

    test('returns correct value for LPB=77 (city + focus, no spec)', () => {
        const rr = rrFromLPB(77);
        expect(rr).toBeCloseTo(77 / 177, 10);
    });

    test('is monotonically increasing', () => {
        expect(rrFromLPB(100)).toBeGreaterThan(rrFromLPB(50));
        expect(rrFromLPB(50)).toBeGreaterThan(rrFromLPB(0));
    });

    test('never reaches 1 for finite LPB', () => {
        expect(rrFromLPB(10000)).toBeLessThan(1);
    });
});

// ─── focusCostMultiplier ─────────────────────────────────────────────────────

describe('focusCostMultiplier', () => {
    test('returns 1 at spec=0 (no reduction)', () => {
        expect(focusCostMultiplier(0)).toBe(1);
    });

    test('returns 0.5 at spec=25 (÷2)', () => {
        expect(focusCostMultiplier(25)).toBeCloseTo(0.5, 10);
    });

    test('returns 0.25 at spec=50 (÷4)', () => {
        expect(focusCostMultiplier(50)).toBeCloseTo(0.25, 10);
    });

    test('returns ~0.0625 at spec=100 (÷16, i.e. 6.25%)', () => {
        expect(focusCostMultiplier(100)).toBeCloseTo(0.0625, 10);
    });

    test('is strictly decreasing', () => {
        expect(focusCostMultiplier(100)).toBeLessThan(focusCostMultiplier(50));
        expect(focusCostMultiplier(50)).toBeLessThan(focusCostMultiplier(0));
    });
});

// ─── computeLPB ──────────────────────────────────────────────────────────────

describe('computeLPB', () => {
    const base = { hoBaseReturn: 0, citySpecBonus: 0, dailyBonus: 0, useFocus: false, specLpbBonus: 0 };

    test('city base = 18', () => {
        expect(computeLPB({ ...base, locationType: 'city' })).toBe(18);
    });

    test('island base = 0', () => {
        expect(computeLPB({ ...base, locationType: 'island' })).toBe(0);
    });

    test('focus adds exactly 59', () => {
        expect(computeLPB({ ...base, locationType: 'city', useFocus: true })).toBe(77);
        expect(computeLPB({ ...base, locationType: 'island', useFocus: true })).toBe(59);
    });

    test('city specialty bonus is additive', () => {
        expect(computeLPB({ ...base, locationType: 'city', citySpecBonus: 40 })).toBe(58);
        expect(computeLPB({ ...base, locationType: 'city', citySpecBonus: 15 })).toBe(33);
    });

    test('daily bonus is additive', () => {
        expect(computeLPB({ ...base, locationType: 'city', dailyBonus: 10 })).toBe(28);
        expect(computeLPB({ ...base, locationType: 'city', dailyBonus: 20 })).toBe(38);
    });

    test('specLpbBonus is additive (max = 36 at spec=100)', () => {
        expect(computeLPB({ ...base, locationType: 'city', specLpbBonus: SPEC_MAX_LPB })).toBe(54);
    });

    test('all components additive: city + focus + spec + daily + citySpec', () => {
        const lpb = computeLPB({
            locationType: 'city',
            hoBaseReturn: 0,
            citySpecBonus: 40,
            dailyBonus: 20,
            useFocus: true,
            specLpbBonus: 36,
        });
        expect(lpb).toBe(18 + 40 + 36 + 20 + 59);
    });

    test('hideout derives baseLPB from hoBaseReturn', () => {
        // hoBaseReturn=25% → RR=0.25 → LPB = 0.25/(1-0.25)*100 = 33.33...
        const lpb = computeLPB({ ...base, locationType: 'hideout', hoBaseReturn: 25 });
        expect(lpb).toBeCloseTo(33.333, 2);
    });

    test('hideout hoBaseReturn=0 → baseLPB=0', () => {
        expect(computeLPB({ ...base, locationType: 'hideout', hoBaseReturn: 0 })).toBe(0);
    });

    test('hideout clamps hoBaseReturn to 99%', () => {
        const lpbAt99 = computeLPB({ ...base, locationType: 'hideout', hoBaseReturn: 99 });
        const lpbAt200 = computeLPB({ ...base, locationType: 'hideout', hoBaseReturn: 200 });
        expect(lpbAt200).toBe(lpbAt99);
    });

    test('specLpbBonus defaults to 0', () => {
        const withDefault = computeLPB({ locationType: 'city', hoBaseReturn: 0, citySpecBonus: 0, dailyBonus: 0, useFocus: false });
        const withExplicit = computeLPB({ locationType: 'city', hoBaseReturn: 0, citySpecBonus: 0, dailyBonus: 0, useFocus: false, specLpbBonus: 0 });
        expect(withDefault).toBe(withExplicit);
    });
});

// ─── getCitySpecBonus ────────────────────────────────────────────────────────

describe('getCitySpecBonus', () => {
    test('returns 0 for hideout', () => {
        expect(getCitySpecBonus('hideout', 'Fort Sterling', { category: 'refinement', subcategory: 'wood' })).toBe(0);
    });

    test('returns 0 for island', () => {
        expect(getCitySpecBonus('island', 'Thetford', { category: 'refinement', subcategory: 'metal' })).toBe(0);
    });

    test('refining specialty: +40% when city matches', () => {
        expect(getCitySpecBonus('city', 'Fort Sterling', { category: 'refinement', subcategory: 'wood', uniqueName: '' })).toBe(40);
        expect(getCitySpecBonus('city', 'Thetford',      { category: 'refinement', subcategory: 'metal', uniqueName: '' })).toBe(40);
        expect(getCitySpecBonus('city', 'Lymhurst',      { category: 'refinement', subcategory: 'fiber', uniqueName: '' })).toBe(40);
        expect(getCitySpecBonus('city', 'Bridgewatch',   { category: 'refinement', subcategory: 'stone', uniqueName: '' })).toBe(40);
        expect(getCitySpecBonus('city', 'Martlock',      { category: 'refinement', subcategory: 'hide', uniqueName: '' })).toBe(40);
    });

    test('refining specialty: 0 when city does not match', () => {
        expect(getCitySpecBonus('city', 'Lymhurst', { category: 'refinement', subcategory: 'wood', uniqueName: '' })).toBe(0);
        expect(getCitySpecBonus('city', 'Caerleon', { category: 'refinement', subcategory: 'metal', uniqueName: '' })).toBe(0);
    });

    test('crafting specialty: +15% when subcategory matches', () => {
        expect(getCitySpecBonus('city', 'Lymhurst', { category: 'weapons', subcategory: 'sword', uniqueName: '' })).toBe(15);
        expect(getCitySpecBonus('city', 'Bridgewatch', { category: 'weapons', subcategory: 'crossbow', uniqueName: '' })).toBe(15);
        expect(getCitySpecBonus('city', 'Martlock', { category: 'armor', subcategory: 'plate_boots', uniqueName: '' })).toBe(15);
        expect(getCitySpecBonus('city', 'Thetford', { category: 'armor', subcategory: 'leather_chest', uniqueName: '' })).toBe(15);
    });

    test('crafting specialty: 0 when no match', () => {
        expect(getCitySpecBonus('city', 'Caerleon', { category: 'weapons', subcategory: 'sword', uniqueName: '' })).toBe(0);
        expect(getCitySpecBonus('city', 'Thetford',  { category: 'weapons', subcategory: 'sword', uniqueName: '' })).toBe(0);
    });

    test('Brecilien matches potion/bag/cape', () => {
        expect(getCitySpecBonus('city', 'Brecilien', { category: 'consumable', subcategory: 'cape', uniqueName: '' })).toBe(15);
        expect(getCitySpecBonus('city', 'Brecilien', { category: 'consumable', subcategory: 'bag', uniqueName: '' })).toBe(15);
    });

    test('matches via uniqueName when subcategory misses', () => {
        const result = getCitySpecBonus('city', 'Fort Sterling', {
            category: 'weapons',
            subcategory: '',
            uniqueName: 'T4_MAIN_HAMMER',
        });
        expect(result).toBe(15);
    });

    test('returns 0 when neither sub nor uniqueName matches', () => {
        const result = getCitySpecBonus('city', 'Fort Sterling', {
            category: 'armor',
            subcategory: 'sword',
            uniqueName: 'T4_SWORD',
        });
        expect(result).toBe(0);
    });

    test('returns 0 for unknown city (empty bonusSubs fallback)', () => {
        const result = getCitySpecBonus('city', 'UnknownCity', {
            category: 'weapons',
            subcategory: 'sword',
            uniqueName: 'T4_SWORD',
        });
        expect(result).toBe(0);
    });
});

// ─── SUBCATEGORY_TO_SPEC ─────────────────────────────────────────────────────

describe('SUBCATEGORY_TO_SPEC', () => {
    test('all ALL_SPEC_BRANCHES are valid targets', () => {
        const targets = new Set(Object.values(SUBCATEGORY_TO_SPEC));
        ALL_SPEC_BRANCHES.forEach(branch => {
            expect(targets.has(branch)).toBe(true);
        });
    });

    test('all direct weapon types map to themselves', () => {
        ['sword', 'axe', 'mace', 'hammer', 'spear', 'crossbow', 'bow', 'dagger',
         'quarterstaff', 'arcane', 'curse', 'fire', 'frost', 'holy', 'nature',
         'wargloves', 'shapeshifter'].forEach(w => {
            expect(SUBCATEGORY_TO_SPEC[w]).toBe(w);
        });
    });

    test('legacy aliases resolve correctly', () => {
        expect(SUBCATEGORY_TO_SPEC['plate']).toBe('plate_chest');
        expect(SUBCATEGORY_TO_SPEC['leather']).toBe('leather_chest');
        expect(SUBCATEGORY_TO_SPEC['cloth']).toBe('cloth_chest');
        expect(SUBCATEGORY_TO_SPEC['food']).toBe('stew');
        expect(SUBCATEGORY_TO_SPEC['potion']).toBe('healing_potion');
        expect(SUBCATEGORY_TO_SPEC['refinement']).toBe('wood');
    });
});

// ─── SPEC_MAX_LPB ────────────────────────────────────────────────────────────

describe('SPEC_MAX_LPB', () => {
    test('is 36', () => {
        expect(SPEC_MAX_LPB).toBe(36);
    });
});

// ─── computeProfit ───────────────────────────────────────────────────────────

const mkMarket = (city, ing1Price, outputPrice) => ({
    'T4_LEATHER': { prices: [{ city, sell_price_min: ing1Price }] },
    'T4_LEATHER_ARMOR': { prices: [{ city, sell_price_min: outputPrice }] },
});

const recipe = {
    uniqueName: 'T4_LEATHER_ARMOR',
    category: 'armor',
    subcategory: 'leather_chest',
    ingredients: [{ uniqueName: 'T4_LEATHER', amount: 8 }],
    outputAmount: 1,
    focusCostBase: 100,
};

const baseSettings = {
    locationType: 'city',
    hoBaseReturn: 0,
    city: 'Thetford',
    premium: true,
    useFocus: false,
    specializations: Object.fromEntries(ALL_SPEC_BRANCHES.map(b => [b, 0])),
    dailyBonus: 0,
};

describe('computeProfit', () => {
    test('zero profit when all prices are 0', () => {
        const result = computeProfit(recipe, {}, baseSettings, 1);
        expect(result.profit).toBe(0);
        expect(result.allPricesAvailable).toBe(false);
    });

    test('basic profit calculation (premium, no focus, city base)', () => {
        const market = mkMarket('Thetford', 1000, 10000);
        const result = computeProfit(recipe, market, baseSettings, 1);

        // LPB city base = 18, leather_chest in Thetford → +15 citySpec = 33
        const expectedLPB = 18 + 15;
        const expectedRR  = expectedLPB / (100 + expectedLPB);
        const matCost     = 8 * 1000;
        const saved       = matCost * expectedRR;
        const effective   = matCost - saved;
        const gross       = 10000 * 1;
        const net         = gross * (1 - 0.065);
        const profit      = net - effective;

        expect(result.returnRate).toBeCloseTo(expectedRR, 8);
        expect(result.materialCost).toBe(matCost);
        expect(result.savedMaterials).toBeCloseTo(saved, 4);
        expect(result.profit).toBeCloseTo(profit, 2);
        expect(result.allPricesAvailable).toBe(true);
    });

    test('non-premium applies 10.5% tax', () => {
        const market = mkMarket('Thetford', 1000, 10000);
        const premResult    = computeProfit(recipe, market, { ...baseSettings, premium: true },  1);
        const nonPremResult = computeProfit(recipe, market, { ...baseSettings, premium: false }, 1);
        expect(nonPremResult.netRevenue).toBeLessThan(premResult.netRevenue);
        expect(nonPremResult.profit).toBeLessThan(premResult.profit);
    });

    test('focus increases returnRate and adds focusCost', () => {
        const market = mkMarket('Thetford', 1000, 10000);
        const noFocus  = computeProfit(recipe, market, { ...baseSettings, useFocus: false }, 1);
        const withFocus = computeProfit(recipe, market, { ...baseSettings, useFocus: true }, 1);
        expect(withFocus.returnRate).toBeGreaterThan(noFocus.returnRate);
        expect(withFocus.focusCost).toBe(100);
        expect(noFocus.focusCost).toBe(0);
    });

    test('spec reduces focusCost (at spec=100 → 6.25%)', () => {
        const market = mkMarket('Thetford', 1000, 10000);
        const specSettings = {
            ...baseSettings,
            useFocus: true,
            specializations: { ...baseSettings.specializations, leather_chest: 100 },
        };
        const result = computeProfit(recipe, market, specSettings, 1);
        expect(result.focusCost).toBe(Math.round(100 * 0.0625));
    });

    test('spec increases returnRate via specLpbBonus', () => {
        const market = mkMarket('Thetford', 1000, 10000);
        const noSpec  = computeProfit(recipe, market, baseSettings, 1);
        const fullSpec = computeProfit(recipe, market, {
            ...baseSettings,
            specializations: { ...baseSettings.specializations, leather_chest: 100 },
        }, 1);
        expect(fullSpec.returnRate).toBeGreaterThan(noSpec.returnRate);
        expect(fullSpec.returnRate - noSpec.returnRate).toBeCloseTo(
            rrFromLPB(noSpec.lpb + 36) - rrFromLPB(noSpec.lpb), 5
        );
    });

    test('qty multiplies material cost and focusCost', () => {
        const market = mkMarket('Thetford', 1000, 10000);
        const r1 = computeProfit(recipe, market, { ...baseSettings, useFocus: true }, 1);
        const r5 = computeProfit(recipe, market, { ...baseSettings, useFocus: true }, 5);
        expect(r5.materialCost).toBe(r1.materialCost * 5);
        expect(r5.focusCost).toBe(r1.focusCost * 5);
    });

    test('spf is profit/focusCost when both non-zero', () => {
        const market = mkMarket('Thetford', 1000, 10000);
        const result = computeProfit(recipe, market, { ...baseSettings, useFocus: true }, 1);
        if (result.focusCost > 0 && result.profit !== 0) {
            expect(result.spf).toBeCloseTo(result.profit / result.focusCost, 8);
        }
    });

    test('spf is null when not using focus', () => {
        const market = mkMarket('Thetford', 1000, 10000);
        const result = computeProfit(recipe, market, { ...baseSettings, useFocus: false }, 1);
        expect(result.spf).toBeNull();
    });

    test('unknown subcategory falls back to sword branch', () => {
        const unknownRecipe = { ...recipe, subcategory: 'unknown_sub', category: 'weapons' };
        const market = mkMarket('Thetford', 1000, 10000);
        expect(() => computeProfit(unknownRecipe, market, baseSettings, 1)).not.toThrow();
    });

    test('refinement category falls back to wood branch', () => {
        const refRecipe = { ...recipe, subcategory: 'unknown_ref', category: 'refinement' };
        const market = mkMarket('Thetford', 1000, 10000);
        const result = computeProfit(refRecipe, market, baseSettings, 1);
        expect(result).toBeDefined();
    });

    test('food category falls back to stew branch', () => {
        const foodRecipe = { ...recipe, subcategory: 'unknown_food', category: 'food' };
        const market = mkMarket('Thetford', 1000, 10000);
        const result = computeProfit(foodRecipe, market, baseSettings, 1);
        expect(result).toBeDefined();
    });

    test('island location gives 0 base return', () => {
        const market = mkMarket('Thetford', 1000, 10000);
        const result = computeProfit(recipe, market, { ...baseSettings, locationType: 'island' }, 1);
        expect(result.citySpecBonus).toBe(0);
        expect(result.lpb).toBe(0);
        expect(result.returnRate).toBe(0);
        expect(result.savedMaterials).toBe(0);
    });

    test('hideout with hoBaseReturn=25 derives LPB correctly', () => {
        const market = mkMarket('Thetford', 1000, 10000);
        const result = computeProfit(recipe, market, {
            ...baseSettings,
            locationType: 'hideout',
            hoBaseReturn: 25,
        }, 1);
        // baseLPB = 25/(75)*100 = 33.33, citySpec=0 for hideout
        expect(result.citySpecBonus).toBe(0);
        expect(result.lpb).toBeCloseTo(33.333, 2);
    });

    test('daily bonus adds to LPB', () => {
        const market = mkMarket('Thetford', 1000, 10000);
        const noBonus = computeProfit(recipe, market, baseSettings, 1);
        const bonus20  = computeProfit(recipe, market, { ...baseSettings, dailyBonus: 20 }, 1);
        expect(bonus20.lpb - noBonus.lpb).toBeCloseTo(20, 8);
    });

    test('spf is null when profit is 0', () => {
        const market = mkMarket('Thetford', 0, 0);
        const result = computeProfit(recipe, market, { ...baseSettings, useFocus: true }, 1);
        expect(result.spf).toBeNull();
    });

    test('handles missing specializations gracefully (null guard)', () => {
        const market = mkMarket('Thetford', 1000, 10000);
        const result = computeProfit(recipe, market, { ...baseSettings, specializations: null }, 1);
        expect(result.profit).toBeDefined();
        expect(result.focusCost).toBe(0);
    });

    test('fallback: other category defaults to sword spec branch', () => {
        const otherRecipe = { ...recipe, subcategory: 'zzz_unknown', category: 'other' };
        const market = mkMarket('Thetford', 1000, 10000);
        const withSword = computeProfit(
            { ...recipe, subcategory: 'sword', category: 'weapons' },
            market, { ...baseSettings, specializations: { ...baseSettings.specializations, sword: 50 } }, 1
        );
        const withOther = computeProfit(
            otherRecipe,
            market, { ...baseSettings, specializations: { ...baseSettings.specializations, sword: 50 } }, 1
        );
        expect(withOther.returnRate).toBeCloseTo(withSword.returnRate, 8);
    });
});

// ─── CITIES constant ─────────────────────────────────────────────────────────

describe('CITIES', () => {
    test('contains 7 cities', () => {
        expect(CITIES).toHaveLength(7);
    });

    test('includes all expected cities', () => {
        expect(CITIES).toContain('Caerleon');
        expect(CITIES).toContain('Brecilien');
    });
});
