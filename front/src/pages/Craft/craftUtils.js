// Pure craft-calculator utilities — exported for testing and shared with Craft.jsx.

export const CITIES = ['Caerleon', 'Fort Sterling', 'Lymhurst', 'Bridgewatch', 'Martlock', 'Thetford', 'Brecilien'];

export const REFINING_SPECIALTY = {
    'Fort Sterling': 'wood',
    'Lymhurst':      'fiber',
    'Martlock':      'hide',
    'Bridgewatch':   'stone',
    'Thetford':      'metal',
};

export const CRAFTING_SPECIALTY = {
    'Fort Sterling': ['hammer', 'spear', 'holy', 'plate_helmet', 'cloth_chest'],
    'Lymhurst':      ['sword', 'bow', 'arcane', 'leather_helmet', 'leather_shoes'],
    'Bridgewatch':   ['crossbow', 'dagger', 'curse', 'plate_chest', 'cloth_shoes'],
    'Martlock':      ['axe', 'quarterstaff', 'frost', 'plate_boots', 'offhand'],
    'Thetford':      ['mace', 'fire', 'nature', 'leather_chest', 'cloth_helmet'],
    'Caerleon':      ['war_gloves', 'shapeshifter', 'food', 'stew', 'omelette', 'tools'],
    'Brecilien':     ['cape', 'bag', 'potion'],
};

export const WEAPON_BRANCHES = [
    'sword', 'axe', 'mace', 'hammer', 'spear', 'crossbow',
    'bow', 'dagger', 'quarterstaff', 'arcane', 'curse', 'fire',
    'frost', 'holy', 'nature', 'wargloves', 'shapeshifter',
];
export const ARMOR_BRANCHES = [
    'plate_helmet', 'plate_chest', 'plate_boots',
    'leather_helmet', 'leather_chest', 'leather_boots',
    'cloth_helmet', 'cloth_chest', 'cloth_boots',
];
export const ACCESSORY_BRANCHES = ['offhand', 'bag', 'cape'];
export const FOOD_BRANCHES = ['pie', 'omelette', 'stew', 'salad', 'roast', 'soup', 'sandwich'];
export const POTION_BRANCHES = ['healing_potion', 'energy_potion', 'stoneskin_potion', 'resistance_potion', 'gigantify_potion', 'berserk_potion'];
export const REFINING_BRANCHES = ['wood', 'metal', 'hide', 'fiber', 'stone'];

export const ALL_SPEC_BRANCHES = [
    ...WEAPON_BRANCHES, ...ARMOR_BRANCHES, ...ACCESSORY_BRANCHES,
    ...FOOD_BRANCHES, ...POTION_BRANCHES, ...REFINING_BRANCHES,
];

export const SUBCATEGORY_TO_SPEC = {
    sword: 'sword', axe: 'axe', mace: 'mace', hammer: 'hammer',
    spear: 'spear', crossbow: 'crossbow', bow: 'bow', dagger: 'dagger',
    quarterstaff: 'quarterstaff', arcane: 'arcane', curse: 'curse',
    fire: 'fire', frost: 'frost', holy: 'holy', nature: 'nature',
    wargloves: 'wargloves', shapeshifter: 'shapeshifter',
    plate_helmet: 'plate_helmet', plate_chest: 'plate_chest', plate_boots: 'plate_boots',
    leather_helmet: 'leather_helmet', leather_chest: 'leather_chest', leather_boots: 'leather_boots',
    cloth_helmet: 'cloth_helmet', cloth_chest: 'cloth_chest', cloth_boots: 'cloth_boots',
    plate: 'plate_chest', leather: 'leather_chest', cloth: 'cloth_chest',
    offhand: 'offhand', bag: 'bag', cape: 'cape',
    pie: 'pie', omelette: 'omelette', stew: 'stew',
    salad: 'salad', roast: 'roast', soup: 'soup', sandwich: 'sandwich',
    food: 'stew',
    healing_potion: 'healing_potion', energy_potion: 'energy_potion',
    stoneskin_potion: 'stoneskin_potion', resistance_potion: 'resistance_potion',
    gigantify_potion: 'gigantify_potion', berserk_potion: 'berserk_potion',
    potion: 'healing_potion',
    wood: 'wood', metal: 'metal', hide: 'hide', fiber: 'fiber', stone: 'stone',
    refinement: 'wood',
};

/**
 * City specialty LPB bonus for a given recipe.
 * Refining: +40% if city matches resource type.
 * Crafting:  +15% if city matches item subcategory.
 * HO/island: 0.
 */
export const getCitySpecBonus = (locationType, city, recipe) => {
    if (locationType !== 'city') return 0;
    if (recipe.category === 'refinement') {
        return REFINING_SPECIALTY[city] === recipe.subcategory ? 40 : 0;
    }
    const bonusSubs = CRAFTING_SPECIALTY[city] || [];
    const sub = (recipe.subcategory || '').toLowerCase();
    const un  = (recipe.uniqueName || '').toLowerCase();
    return bonusSubs.some(s => sub.includes(s) || un.includes(s.replace('_', ''))) ? 15 : 0;
};

/** RR = LPB / (100 + LPB) */
export const rrFromLPB = (lpb) => lpb / (100 + lpb);

/** Focus cost multiplier via Destiny Board: ÷2 per 10 000 pts (max 40 000 → 6.25%). */
export const focusCostMultiplier = (spec) => 1 / Math.pow(2, (spec / 100) * 4);

/** Maximum LPB contribution from Destiny Board specialization (at spec=100). */
export const SPEC_MAX_LPB = 36;

/**
 * Compute LPB in % from all additive components.
 * Returns a raw LPB number; pass to rrFromLPB() to get return rate.
 */
export const computeLPB = ({ locationType, hoBaseReturn, citySpecBonus, dailyBonus, useFocus, specLpbBonus = 0 }) => {
    let baseLPB;
    if (locationType === 'hideout') {
        const rr = Math.max(0, Math.min(0.99, hoBaseReturn / 100));
        baseLPB = rr > 0 ? (rr / (1 - rr)) * 100 : 0;
    } else if (locationType === 'island') {
        baseLPB = 0;
    } else {
        baseLPB = 18;
    }
    return baseLPB + citySpecBonus + specLpbBonus + (dailyBonus || 0) + (useFocus ? 59 : 0);
};

/**
 * Full profit calculation for a single recipe.
 * Returns detailed breakdown including returnRate, profit, focusCost, spf.
 */
export const computeProfit = (recipe, marketData, settings, qty) => {
    const { locationType, hoBaseReturn, city, premium, useFocus, specializations, dailyBonus } = settings;
    const specBranch = SUBCATEGORY_TO_SPEC[recipe.subcategory]
        ?? (recipe.category === 'food' ? 'stew' : recipe.category === 'refinement' ? 'wood' : 'sword');
    const spec = specializations?.[specBranch] ?? 0;

    const citySpecBonus = getCitySpecBonus(locationType, city, recipe);
    const specLpbBonus = ((specializations?.[specBranch] ?? 0) / 100) * SPEC_MAX_LPB;
    const lpbNoFocus = computeLPB({ locationType, hoBaseReturn, citySpecBonus, dailyBonus, useFocus: false, specLpbBonus });
    const lpbWithFocus = computeLPB({ locationType, hoBaseReturn, citySpecBonus, dailyBonus, useFocus: true, specLpbBonus });
    const lpb = useFocus ? lpbWithFocus : lpbNoFocus;
    const returnRate = rrFromLPB(lpb);

    const tax = premium ? 0.065 : 0.105;

    let materialCost = 0;
    let allPricesAvailable = true;
    for (const ing of recipe.ingredients) {
        const cityPrices = (marketData[ing.uniqueName]?.prices || []).find(p => p.city === city);
        const buyPrice = cityPrices?.sell_price_min || 0;
        if (!buyPrice) allPricesAvailable = false;
        materialCost += buyPrice * ing.amount * qty;
    }

    const savedMaterials = materialCost * returnRate;
    const effectiveCost = materialCost - savedMaterials;

    const outPrices = (marketData[recipe.uniqueName]?.prices || []).find(p => p.city === city);
    const sellPriceUnit = outPrices?.sell_price_min || 0;
    const grossRevenue = sellPriceUnit * recipe.outputAmount * qty;
    const netRevenue = grossRevenue * (1 - tax);

    const profit = netRevenue - effectiveCost;
    const focusCost = useFocus ? Math.round(recipe.focusCostBase * focusCostMultiplier(spec) * qty) : 0;
    const spf = (focusCost > 0 && profit !== 0) ? profit / focusCost : null;

    return {
        materialCost, savedMaterials, effectiveCost,
        returnRate, lpb, lpbNoFocus, citySpecBonus,
        grossRevenue, netRevenue, profit,
        focusCost, spf,
        allPricesAvailable, sellPriceUnit,
    };
};
