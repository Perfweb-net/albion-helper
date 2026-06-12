// Canvas-based JPEG export for compositions.
// Uses /api/proxy/icon/{uniqueName} to bypass CORS on the Albion CDN.

const SLOT_ORDER = ['weapon', 'offhand', 'head', 'armor', 'boots', 'cape', 'food', 'potion', 'mount'];
const SLOT_LABELS = {
    weapon: 'Arme', offhand: 'OH', head: 'Tête', armor: 'Armure',
    boots: 'Bottes', cape: 'Cape', food: 'Nourrit.', potion: 'Potion', mount: 'Monture',
};

const BG      = '#0d1117';
const CELL_BG = '#161b22';
const GOLD    = '#c9a84c';
const WHITE   = '#e8dcc8';
const GRAY    = '#8b949e';
const SWAP_BG = '#1c2128';

const COLS       = 5;
const CELL_W     = 260;
const CELL_H     = 190;
const PAD        = 12;
const ICON_SIZE  = 28;
const SWAP_SIZE  = 20;
const HEADER_H   = 72;
const FOOTER_H   = 32;
const PAGE_SIZE  = 20; // players per page

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

function proxyUrl(uniqueName) {
    return `${API_BASE}/proxy/icon/${uniqueName}`;
}

function loadImage(src) {
    return new Promise((resolve) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload  = () => resolve(img);
        img.onerror = () => resolve(null);
        img.src = src;
    });
}

async function preloadIcons(players) {
    const names = new Set();
    for (const p of players) {
        for (const slot of SLOT_ORDER) {
            if (p[slot]?.uniqueName) names.add(p[slot].uniqueName);
            if (p.swaps?.[slot]?.uniqueName) names.add(p.swaps[slot].uniqueName);
        }
    }
    const entries = await Promise.all(
        [...names].map(async (n) => [n, await loadImage(proxyUrl(n))])
    );
    return Object.fromEntries(entries);
}

function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
}

function drawIconSlot(ctx, img, x, y, size, isEmpty) {
    // background square
    ctx.fillStyle = '#21262d';
    roundRect(ctx, x, y, size, size, 3);
    ctx.fill();
    if (img) {
        ctx.drawImage(img, x, y, size, size);
    } else if (isEmpty) {
        ctx.strokeStyle = '#30363d';
        ctx.lineWidth = 1;
        roundRect(ctx, x + 1, y + 1, size - 2, size - 2, 3);
        ctx.stroke();
    }
}

function drawSwapArrow(ctx, x, y) {
    ctx.fillStyle = GOLD;
    ctx.font = 'bold 9px sans-serif';
    ctx.fillText('⇄', x, y + 9);
}

function drawPage(canvas, comp, pageIndex, totalPages, icons) {
    const start = pageIndex * PAGE_SIZE;
    const pagePlayers = comp.players.slice(start, start + PAGE_SIZE);
    const rows = Math.ceil(pagePlayers.length / COLS);

    const W = COLS * CELL_W + PAD * 2;
    const H = HEADER_H + rows * CELL_H + FOOTER_H + PAD;
    canvas.width  = W;
    canvas.height = H;

    const ctx = canvas.getContext('2d');

    // Background
    ctx.fillStyle = BG;
    ctx.fillRect(0, 0, W, H);

    // Header
    ctx.fillStyle = GOLD;
    ctx.font = 'bold 26px "Cinzel Decorative", Cinzel, serif';
    ctx.textAlign = 'left';
    ctx.fillText(comp.name, PAD, 38);

    ctx.fillStyle = GRAY;
    ctx.font = '13px sans-serif';
    ctx.fillText(`par ${comp.owner}  •  ${pagePlayers.length + start}/${comp.players.length} joueurs`, PAD, 58);

    if (totalPages > 1) {
        ctx.fillStyle = GOLD;
        ctx.font = 'bold 13px sans-serif';
        ctx.textAlign = 'right';
        ctx.fillText(`Partie ${pageIndex + 1} / ${totalPages}`, W - PAD, 58);
        ctx.textAlign = 'left';
    }

    // Separator line
    ctx.strokeStyle = GOLD + '55';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(PAD, HEADER_H - 4);
    ctx.lineTo(W - PAD, HEADER_H - 4);
    ctx.stroke();

    // Player cells
    pagePlayers.forEach((player, idx) => {
        const col = idx % COLS;
        const row = Math.floor(idx / COLS);
        const cx  = PAD + col * CELL_W;
        const cy  = HEADER_H + row * CELL_H;

        // Cell background
        ctx.fillStyle = CELL_BG;
        roundRect(ctx, cx + 3, cy + 3, CELL_W - 6, CELL_H - 6, 6);
        ctx.fill();
        ctx.strokeStyle = '#30363d';
        ctx.lineWidth = 1;
        roundRect(ctx, cx + 3, cy + 3, CELL_W - 6, CELL_H - 6, 6);
        ctx.stroke();

        // Player name
        ctx.fillStyle = WHITE;
        ctx.font = 'bold 13px sans-serif';
        ctx.textAlign = 'left';
        const displayName = player.name || `Joueur ${start + idx + 1}`;
        ctx.fillText(displayName.substring(0, 22), cx + 10, cy + 22);

        // Determine visible slots
        const isTwoHanded = player.weapon?.twoHanded === true;
        const visibleSlots = SLOT_ORDER.filter(s => s !== 'offhand' || !isTwoHanded);

        // Main slots row
        const slotY = cy + 32;
        const totalSlotW = visibleSlots.length * (ICON_SIZE + 4) - 4;
        let slotX = cx + Math.max(8, (CELL_W - totalSlotW) / 2);

        for (const slot of visibleSlots) {
            const item = player[slot];
            const img  = item?.uniqueName ? icons[item.uniqueName] : null;
            drawIconSlot(ctx, img, slotX, slotY, ICON_SIZE, !item);

            // Slot label
            ctx.fillStyle = GRAY;
            ctx.font = '7px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(SLOT_LABELS[slot], slotX + ICON_SIZE / 2, slotY + ICON_SIZE + 9);
            ctx.textAlign = 'left';

            slotX += ICON_SIZE + 4;
        }

        // Swap row
        const swapSlots = visibleSlots.filter(s => player.swaps?.[s]);
        if (swapSlots.length > 0) {
            const swapY = slotY + ICON_SIZE + 14;

            // Swap background strip
            ctx.fillStyle = SWAP_BG;
            roundRect(ctx, cx + 6, swapY - 2, CELL_W - 12, SWAP_SIZE + 8, 3);
            ctx.fill();
            ctx.strokeStyle = GOLD + '44';
            ctx.lineWidth = 0.5;
            roundRect(ctx, cx + 6, swapY - 2, CELL_W - 12, SWAP_SIZE + 8, 3);
            ctx.stroke();

            // Arrow label
            drawSwapArrow(ctx, cx + 8, swapY + 1);

            const swapTotalW = swapSlots.length * (SWAP_SIZE + 3) - 3;
            let swapX = cx + 22;

            for (const slot of swapSlots) {
                const item = player.swaps[slot];
                const img  = item?.uniqueName ? icons[item.uniqueName] : null;
                drawIconSlot(ctx, img, swapX, swapY, SWAP_SIZE, false);
                swapX += SWAP_SIZE + 3;
            }
        }
    });

    // Footer
    ctx.fillStyle = GRAY;
    ctx.font = '11px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Albion Helper', W / 2, H - 10);
}

export async function exportCompositionAsJpeg(comp) {
    const icons = await preloadIcons(comp.players);
    const totalPages = Math.ceil(comp.players.length / PAGE_SIZE) || 1;

    for (let p = 0; p < totalPages; p++) {
        const canvas = document.createElement('canvas');
        drawPage(canvas, comp, p, totalPages, icons);

        const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
        const link    = document.createElement('a');
        const suffix  = totalPages > 1 ? `_partie${p + 1}` : '';
        link.download = `${comp.name.replace(/[^a-z0-9]/gi, '_')}${suffix}.jpg`;
        link.href = dataUrl;
        link.click();
    }
}
