<?php

namespace App\Service;

use App\Entity\ItemMarketData;
use App\Repository\ItemMarketDataRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Contracts\HttpClient\HttpClientInterface;

class ItemMarketService
{
    private const CITIES = 'Caerleon,Bridgewatch,Fort Sterling,Lymhurst,Martlock,Thetford,Brecilien,Black Market';
    private const PRICES_URL = 'https://www.albion-online-data.com/api/v2/stats/prices/%s.json?locations=%s&qualities=%d';
    private const HISTORY_URL = 'https://www.albion-online-data.com/api/v2/stats/history/%s.json?locations=%s&qualities=%d&time-scale=24';

    public function __construct(
        private readonly HttpClientInterface $client,
        private readonly EntityManagerInterface $em,
        private readonly ItemMarketDataRepository $repo
    ) {}

    public function getMarketData(string $uniqueName, int $quality = 1): array
    {
        $record = $this->repo->findByItemAndQuality($uniqueName, $quality);

        if (!$record) {
            $record = $this->fetch($uniqueName, $quality);
        }

        return $this->serialize($record);
    }

    public function refreshMarketData(string $uniqueName, int $quality = 1): array
    {
        $record = $this->repo->findByItemAndQuality($uniqueName, $quality);

        if ($record && !$record->canRefresh()) {
            return array_merge($this->serialize($record), ['refreshBlocked' => true, 'minutesLeft' => $record->minutesUntilRefresh()]);
        }

        $record = $this->fetch($uniqueName, $quality, $record);
        return $this->serialize($record);
    }

    private function fetch(string $uniqueName, int $quality, ?ItemMarketData $record = null): ItemMarketData
    {
        $cities = self::CITIES;

        $pricesResp  = $this->client->request('GET', sprintf(self::PRICES_URL, $uniqueName, urlencode($cities), $quality));
        $historyResp = $this->client->request('GET', sprintf(self::HISTORY_URL, $uniqueName, urlencode($cities), $quality));

        if (!$record) {
            $record = new ItemMarketData();
            $record->setUniqueName($uniqueName);
            $record->setQuality($quality);
        }

        $record->setPrices($pricesResp->toArray(false));
        $record->setHistory($historyResp->toArray(false));
        $record->setUpdatedAt(new \DateTimeImmutable());

        $this->em->persist($record);
        $this->em->flush();

        return $record;
    }

    private function serialize(ItemMarketData $record): array
    {
        return [
            'uniqueName'   => $record->getUniqueName(),
            'quality'      => $record->getQuality(),
            'prices'       => $record->getPrices(),
            'history'      => $record->getHistory(),
            'updatedAt'    => $record->getUpdatedAt()->format('c'),
            'canRefresh'   => $record->canRefresh(),
            'minutesLeft'  => $record->minutesUntilRefresh(),
            'refreshBlocked' => false,
        ];
    }
}
