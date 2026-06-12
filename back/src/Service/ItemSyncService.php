<?php

namespace App\Service;

use App\Entity\Item;
use App\Repository\ItemRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Contracts\HttpClient\HttpClientInterface;

class ItemSyncService
{
    private const ITEMS_JSON_URL = 'https://raw.githubusercontent.com/ao-data/ao-bin-dumps/master/formatted/items.json';

    public function __construct(
        private readonly HttpClientInterface $client,
        private readonly EntityManagerInterface $em,
        private readonly ItemRepository $itemRepository,
    ) {
    }

    public function syncItems(): array
    {
        $response = $this->client->request('GET', self::ITEMS_JSON_URL);
        $raw = json_decode($response->getContent(), true);

        $inserted = 0;
        $updated = 0;
        $batchSize = 200;
        $i = 0;

        foreach ($raw as $data) {
            $uniqueName = $data['UniqueName'] ?? null;
            if (!$uniqueName) continue;

            $localizedNames = $data['LocalizedNames'] ?? [];
            $tier = $this->extractTier($uniqueName);

            $item = $this->itemRepository->findOneBy(['uniqueName' => $uniqueName]);
            if (!$item) {
                $item = new Item();
                $item->setUniqueName($uniqueName);
                $inserted++;
            } else {
                $updated++;
            }

            $item->setLocalizedNames($localizedNames);
            $item->setTier($tier);
            $item->setSyncedAt(new \DateTimeImmutable());
            $this->em->persist($item);

            if (++$i % $batchSize === 0) {
                $this->em->flush();
                $this->em->clear(Item::class);
            }
        }

        $this->em->flush();

        return ['inserted' => $inserted, 'updated' => $updated, 'total' => $inserted + $updated];
    }

    private function extractTier(string $uniqueName): ?int
    {
        if (preg_match('/^T(\d)_/', $uniqueName, $m)) {
            return (int) $m[1];
        }
        return null;
    }
}
