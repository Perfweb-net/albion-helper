<?php

namespace App\Service;

use Symfony\Component\HttpFoundation\Request;

/**
 * Serveurs de jeu Albion Online. Chaque région a ses propres endpoints
 * (gameinfo pour joueurs/guildes/batailles, albion-online-data pour les prix).
 *
 * Le serveur est transmis par le front via l'en-tête X-Albion-Server.
 * Données concernées : joueurs, guildes, batailles, items/prix, routes.
 * Données globales (non concernées) : compositions, cartes (markers/mobs).
 */
final class ServerRegion
{
    public const DEFAULT = 'europe';

    private const REGIONS = [
        'americas' => [
            'label' => 'Americas',
            'gameinfo' => 'https://gameinfo.albiononline.com/api/gameinfo/',
            'market' => 'https://west.albion-online-data.com/api/v2/stats/',
        ],
        'europe' => [
            'label' => 'Europe',
            'gameinfo' => 'https://gameinfo-ams.albiononline.com/api/gameinfo/',
            'market' => 'https://europe.albion-online-data.com/api/v2/stats/',
        ],
        'asia' => [
            'label' => 'Asia',
            'gameinfo' => 'https://gameinfo-sgp.albiononline.com/api/gameinfo/',
            'market' => 'https://east.albion-online-data.com/api/v2/stats/',
        ],
    ];

    /** Ramène n'importe quelle valeur à un serveur connu (défaut Europe). */
    public static function normalize(?string $server): string
    {
        $server = strtolower(trim((string) $server));
        return isset(self::REGIONS[$server]) ? $server : self::DEFAULT;
    }

    /** Base URL gameinfo (joueurs, guildes, batailles) pour le serveur. */
    public static function gameinfo(?string $server): string
    {
        return self::REGIONS[self::normalize($server)]['gameinfo'];
    }

    /** Base URL des prix de marché pour le serveur. */
    public static function market(?string $server): string
    {
        return self::REGIONS[self::normalize($server)]['market'];
    }

    /** Lit le serveur depuis l'en-tête X-Albion-Server (fallback query ?server=). */
    public static function fromRequest(Request $request): string
    {
        return self::normalize(
            $request->headers->get('X-Albion-Server') ?? $request->query->get('server')
        );
    }

    /** @return array<int,array{key:string,label:string}> liste pour le front */
    public static function all(): array
    {
        return array_map(
            static fn($key, $r) => ['key' => $key, 'label' => $r['label']],
            array_keys(self::REGIONS),
            array_values(self::REGIONS),
        );
    }
}
