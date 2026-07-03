<?php

namespace App\Service;

use App\Entity\ItemMarketData;
use App\Repository\ItemMarketDataRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Contracts\HttpClient\HttpClientInterface;

class ItemMarketService
{
    private const CITIES = 'Caerleon,Bridgewatch,Fort Sterling,Lymhurst,Martlock,Thetford,Brecilien,Black Market';

    public function __construct(
        private readonly HttpClientInterface $client,
        private readonly EntityManagerInterface $em,
        private readonly ItemMarketDataRepository $repo
    ) {}

    public function getMarketData(string $uniqueName, int $quality = 1, ?string $server = null): array
    {
        $server = ServerRegion::normalize($server);
        $record = $this->repo->findByItemQualityServer($uniqueName, $quality, $server);

        if (!$record) {
            $record = $this->fetch($uniqueName, $quality, $server);
        }

        return $this->serialize($record);
    }

    public function refreshMarketData(string $uniqueName, int $quality = 1, ?string $server = null): array
    {
        $server = ServerRegion::normalize($server);
        $record = $this->repo->findByItemQualityServer($uniqueName, $quality, $server);

        if ($record && !$record->canRefresh()) {
            return array_merge($this->serialize($record), ['refreshBlocked' => true, 'minutesLeft' => $record->minutesUntilRefresh()]);
        }

        $record = $this->fetch($uniqueName, $quality, $server, $record);
        return $this->serialize($record);
    }

    private function fetch(string $uniqueName, int $quality, string $server, ?ItemMarketData $record = null): ItemMarketData
    {
        $cities = urlencode(self::CITIES);
        $base = ServerRegion::market($server);
        $pricesUrl = sprintf('%sprices/%s.json?locations=%s&qualities=%d', $base, $uniqueName, $cities, $quality);
        $historyUrl = sprintf('%shistory/%s.json?locations=%s&qualities=%d&time-scale=24', $base, $uniqueName, $cities, $quality);

        $pricesResp  = $this->client->request('GET', $pricesUrl);
        $historyResp = $this->client->request('GET', $historyUrl);

        if (!$record) {
            $record = new ItemMarketData();
            $record->setUniqueName($uniqueName);
            $record->setQuality($quality);
            $record->setServer($server);
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
            'server'       => $record->getServer(),
            'prices'       => $record->getPrices(),
            'history'      => $record->getHistory(),
            'updatedAt'    => $record->getUpdatedAt()->format('c'),
            'canRefresh'   => $record->canRefresh(),
            'minutesLeft'  => $record->minutesUntilRefresh(),
            'refreshBlocked' => false,
        ];
    }
}
