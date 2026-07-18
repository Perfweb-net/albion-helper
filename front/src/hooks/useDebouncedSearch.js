import { useEffect, useRef, useState } from 'react';
import { useRateLimited } from './useRateLimited';

/**
 * Recherche automatique dès `minLength` caractères, avec un debounce — même
 * comportement que la recherche de carte (Map.jsx) et le sélecteur d'objets de
 * composition (SlotPicker.jsx), généralisé aux autres pages de recherche.
 *
 * Quand le quota de requêtes est dépassé (cf. rateLimitBus / back:
 * ApiRateLimitSubscriber, 50 req/min), l'auto-recherche se coupe d'elle-même —
 * il faut alors cliquer sur le bouton (`triggerSearch`) comme pour une
 * recherche manuelle classique. `enabled` permet en plus de couper
 * l'auto-recherche pour d'autres raisons propres à l'appelant.
 */
export function useDebouncedSearch(onSearch, { minLength = 3, delay = 350, enabled = true } = {}) {
    const [query, setQuery] = useState('');
    const timer = useRef(null);
    const onSearchRef = useRef(onSearch);
    onSearchRef.current = onSearch;
    const rateLimited = useRateLimited();
    const autoSearchEnabled = enabled && !rateLimited;

    useEffect(() => {
        clearTimeout(timer.current);
        if (!autoSearchEnabled || query.trim().length < minLength) return undefined;
        timer.current = setTimeout(() => onSearchRef.current(query), delay);
        return () => clearTimeout(timer.current);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [query, autoSearchEnabled, minLength, delay]);

    const triggerSearch = () => {
        clearTimeout(timer.current);
        onSearchRef.current(query);
    };

    return { query, setQuery, triggerSearch, rateLimited };
}
