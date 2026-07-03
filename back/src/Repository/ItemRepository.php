<?php

namespace App\Repository;

use App\Entity\Item;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

class ItemRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Item::class);
    }

    public function search(string $q, ?int $tier, string $lang): array
    {
        $conn   = $this->getEntityManager()->getConnection();
        $wheres = [];
        $params = [];
        $types  = [];

        if ($q !== '') {
            $wheres[] = '(LOWER(i.unique_name) LIKE LOWER(:q) OR LOWER(i.localized_names::text) LIKE LOWER(:q))';
            $params['q'] = '%' . $q . '%';
        }

        if ($tier !== null) {
            $wheres[] = 'i.tier = :tier';
            $params['tier'] = $tier;
        }

        $where = $wheres ? 'WHERE ' . implode(' AND ', $wheres) : '';
        $sql   = "SELECT i.id FROM item i $where ORDER BY i.unique_name ASC LIMIT 100";

        $ids = $conn->executeQuery($sql, $params)->fetchFirstColumn();

        if (empty($ids)) {
            return [];
        }

        return $this->createQueryBuilder('i')
            ->where('i.id IN (:ids)')
            ->setParameter('ids', $ids)
            ->orderBy('i.uniqueName', 'ASC')
            ->getQuery()
            ->getResult();
    }

    public function countAll(): int
    {
        return (int) $this->createQueryBuilder('i')
            ->select('COUNT(i.id)')
            ->getQuery()
            ->getSingleScalarResult();
    }

    /**
     * Noms localisés pour une liste d'uniqueNames.
     * @param string[] $uniqueNames
     * @return array<string,array> uniqueName => localizedNames
     */
    public function localizedNamesFor(array $uniqueNames): array
    {
        if (!$uniqueNames) {
            return [];
        }
        $rows = $this->createQueryBuilder('i')
            ->select('i.uniqueName', 'i.localizedNames')
            ->where('i.uniqueName IN (:names)')
            ->setParameter('names', array_values(array_unique($uniqueNames)))
            ->getQuery()
            ->getArrayResult();

        $map = [];
        foreach ($rows as $row) {
            $map[$row['uniqueName']] = $row['localizedNames'] ?? [];
        }
        return $map;
    }
}
