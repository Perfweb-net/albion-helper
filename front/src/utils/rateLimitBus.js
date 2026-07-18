// Petit pub/sub global : api.js déclenche l'état "rate limited" au premier 429
// reçu, sans dépendre de React. Les composants s'y abonnent via useRateLimited().
// Redescend automatiquement après COOLDOWN_MS (aligné sur la fenêtre de 1 minute
// du rate limiter côté back, cf. back/config/packages/rate_limiter.yaml).
const COOLDOWN_MS = 60_000;

let limited = false;
let resetTimer = null;
const subscribers = new Set();

function notify() {
    subscribers.forEach(cb => cb(limited));
}

export function triggerRateLimited() {
    limited = true;
    clearTimeout(resetTimer);
    resetTimer = setTimeout(() => {
        limited = false;
        notify();
    }, COOLDOWN_MS);
    notify();
}

export function isRateLimited() {
    return limited;
}

export function subscribeRateLimited(callback) {
    subscribers.add(callback);
    return () => subscribers.delete(callback);
}
