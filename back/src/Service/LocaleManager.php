<?php

namespace App\Service;

use Symfony\Component\DependencyInjection\Attribute\Autowire;

/**
 * Gère les fichiers de traduction (i18n) stockés sous data/locales/<code>.json.
 *
 * La langue de référence (fr) sert de modèle : toute nouvelle langue est créée
 * en clonant l'intégralité de ses clés avec des valeurs vides, prêtes à traduire.
 */
class LocaleManager
{
    public const REFERENCE = 'fr';
    private const CODE_PATTERN = '/^[a-z]{2}(-[a-z]{2})?$/';

    private readonly string $dir;

    public function __construct(
        #[Autowire(param: 'kernel.project_dir')] string $projectDir,
    ) {
        $this->dir = $projectDir . '/data/locales';
    }

    /** Codes des langues disponibles (basé sur les fichiers présents). */
    public function listCodes(): array
    {
        if (!is_dir($this->dir)) {
            return [];
        }
        $codes = [];
        foreach (glob($this->dir . '/*.json') ?: [] as $path) {
            $codes[] = basename($path, '.json');
        }
        sort($codes);

        return $codes;
    }

    public function exists(string $code): bool
    {
        return is_file($this->pathFor($this->normalize($code)));
    }

    /** Contenu (objet de traductions) d'une langue. */
    public function get(string $code): array
    {
        $code = $this->normalize($code);
        $path = $this->pathFor($code);
        if (!is_file($path)) {
            throw new \RuntimeException(sprintf('Langue "%s" introuvable.', $code), 404);
        }

        return json_decode((string) file_get_contents($path), true, flags: JSON_THROW_ON_ERROR);
    }

    /**
     * Crée une nouvelle langue en clonant les clés de la référence (valeurs vides).
     * @return array Le contenu créé.
     */
    public function create(string $code): array
    {
        $code = $this->normalize($code);
        if (!preg_match(self::CODE_PATTERN, $code)) {
            throw new \InvalidArgumentException('Code de langue invalide (ex : de, es, pt-br).', 422);
        }
        if ($this->exists($code)) {
            throw new \RuntimeException(sprintf('La langue "%s" existe déjà.', $code), 409);
        }
        $template = $this->emptyClone($this->get(self::REFERENCE));
        $this->write($code, $template);

        return $template;
    }

    /**
     * Met à jour les valeurs d'une langue (fusion profonde sur les clés existantes).
     * @return array Le contenu mis à jour.
     */
    public function update(string $code, array $values): array
    {
        $code = $this->normalize($code);
        if (!$this->exists($code)) {
            throw new \RuntimeException(sprintf('Langue "%s" introuvable.', $code), 404);
        }
        $merged = $this->deepMerge($this->get($code), $values);
        $this->write($code, $merged);

        return $merged;
    }

    public function delete(string $code): void
    {
        $code = $this->normalize($code);
        if ($code === self::REFERENCE) {
            throw new \RuntimeException('La langue de référence ne peut pas être supprimée.', 409);
        }
        if (!$this->exists($code)) {
            throw new \RuntimeException(sprintf('Langue "%s" introuvable.', $code), 404);
        }
        unlink($this->pathFor($code));
    }

    private function normalize(string $code): string
    {
        return strtolower(trim($code));
    }

    private function pathFor(string $code): string
    {
        return $this->dir . '/' . $code . '.json';
    }

    private function write(string $code, array $data): void
    {
        if (!is_dir($this->dir) && !mkdir($this->dir, 0775, true) && !is_dir($this->dir)) {
            throw new \RuntimeException('Impossible de créer le dossier des traductions.');
        }
        file_put_contents(
            $this->pathFor($code),
            json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES) . "\n",
        );
    }

    /** Clone récursif en remplaçant chaque feuille par une chaîne vide. */
    private function emptyClone(array $ref): array
    {
        $out = [];
        foreach ($ref as $key => $value) {
            $out[$key] = is_array($value) ? $this->emptyClone($value) : '';
        }

        return $out;
    }

    /** Fusion profonde : les valeurs de $patch écrasent celles de $base. */
    private function deepMerge(array $base, array $patch): array
    {
        foreach ($patch as $key => $value) {
            if (is_array($value) && isset($base[$key]) && is_array($base[$key])) {
                $base[$key] = $this->deepMerge($base[$key], $value);
            } else {
                $base[$key] = $value;
            }
        }

        return $base;
    }
}
