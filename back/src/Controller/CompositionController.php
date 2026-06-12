<?php

namespace App\Controller;

use App\Entity\Composition;
use App\Repository\CompositionRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;

class CompositionController extends AbstractController
{
    public function __construct(
        private readonly CompositionRepository $repository,
        private readonly EntityManagerInterface $em,
    ) {}

    #[Route('/api/compositions', methods: ['GET'])]
    public function index(): JsonResponse
    {
        $comps = $this->repository->findBy(['owner' => $this->getUser()], ['updatedAt' => 'DESC']);
        return new JsonResponse(array_map($this->serialize(...), $comps));
    }

    #[Route('/api/compositions/public', methods: ['GET'])]
    public function publicList(): JsonResponse
    {
        $comps = $this->repository->findBy(['visibility' => Composition::VISIBILITY_PUBLIC], ['updatedAt' => 'DESC']);
        return new JsonResponse(array_map($this->serialize(...), $comps));
    }

    #[Route('/api/compositions', methods: ['POST'])]
    public function create(Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true) ?? [];
        $comp = new Composition();
        $comp->setName($data['name'] ?? 'Nouvelle composition');
        $comp->setOwner($this->getUser());
        $comp->setPlayers($data['players'] ?? []);
        $comp->setVisibility($data['visibility'] ?? Composition::VISIBILITY_PRIVATE);
        $this->em->persist($comp);
        $this->em->flush();
        return new JsonResponse($this->serialize($comp), 201);
    }

    #[Route('/api/compositions/share/{token}', methods: ['GET'])]
    public function share(string $token): JsonResponse
    {
        $comp = $this->repository->findOneBy(['shareToken' => $token]);
        if (!$comp || !$comp->isShareable()) {
            return new JsonResponse(['error' => 'Not found'], 404);
        }
        return new JsonResponse($this->serialize($comp));
    }

    #[Route('/api/compositions/{id}', methods: ['GET'])]
    public function show(int $id): JsonResponse
    {
        $comp = $this->repository->find($id);
        if (!$comp || $comp->getOwner()->getId() !== $this->getUser()->getId()) {
            return new JsonResponse(['error' => 'Not found'], 404);
        }
        return new JsonResponse($this->serialize($comp));
    }

    #[Route('/api/compositions/{id}', methods: ['PUT'])]
    public function update(int $id, Request $request): JsonResponse
    {
        $comp = $this->repository->find($id);
        if (!$comp || $comp->getOwner()->getId() !== $this->getUser()->getId()) {
            return new JsonResponse(['error' => 'Not found'], 404);
        }
        $data = json_decode($request->getContent(), true) ?? [];
        if (array_key_exists('name', $data))       $comp->setName($data['name']);
        if (array_key_exists('players', $data))    $comp->setPlayers($data['players']);
        if (array_key_exists('visibility', $data)) $comp->setVisibility($data['visibility']);
        $comp->setUpdatedAt(new \DateTimeImmutable());
        $this->em->flush();
        return new JsonResponse($this->serialize($comp));
    }

    #[Route('/api/compositions/{id}', methods: ['DELETE'])]
    public function delete(int $id): JsonResponse
    {
        $comp = $this->repository->find($id);
        if (!$comp || $comp->getOwner()->getId() !== $this->getUser()->getId()) {
            return new JsonResponse(['error' => 'Not found'], 404);
        }
        $this->em->remove($comp);
        $this->em->flush();
        return new JsonResponse(['status' => 'deleted']);
    }

    private function serialize(Composition $c): array
    {
        return [
            'id'         => $c->getId(),
            'name'       => $c->getName(),
            'owner'      => $c->getOwner()->getUsername(),
            'players'    => $c->getPlayers(),
            'shareToken' => $c->getShareToken(),
            'visibility' => $c->getVisibility(),
            'createdAt'  => $c->getCreatedAt()->format('c'),
            'updatedAt'  => $c->getUpdatedAt()->format('c'),
        ];
    }
}
