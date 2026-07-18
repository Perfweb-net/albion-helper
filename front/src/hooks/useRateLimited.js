import { useEffect, useState } from 'react';
import { isRateLimited, subscribeRateLimited } from '../utils/rateLimitBus';

/** État global "quota dépassé" (cf. rateLimitBus), réactif pour un composant React. */
export function useRateLimited() {
    const [limited, setLimited] = useState(isRateLimited());

    useEffect(() => subscribeRateLimited(setLimited), []);

    return limited;
}
