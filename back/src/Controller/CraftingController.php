<?php

namespace App\Controller;

use App\Entity\CraftingRecipe;
use App\Entity\CraftingRecipeIngredient;
use App\Repository\CraftingRecipeRepository;
use App\Repository\ItemRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;

class CraftingController extends AbstractController
{
    /** Mapping code i18n -> clé de noms localisés de l'API Albion. */
    private const LANG_MAP = [
        'fr' => 'FR-FR', 'en' => 'EN-US', 'de' => 'DE-DE', 'es' => 'ES-ES',
        'pt' => 'PT-BR', 'ru' => 'RU-RU', 'it' => 'IT-IT', 'pl' => 'PL-PL',
        'zh' => 'ZH-CN', 'ko' => 'KO-KR', 'ja' => 'JA-JP', 'tr' => 'TR-TR',
        'ar' => 'AR-SA', 'id' => 'ID-ID',
    ];

    public function __construct(
        private readonly CraftingRecipeRepository $repo,
        private readonly ItemRepository $itemRepo,
        private readonly EntityManagerInterface $em
    ) {}

    #[Route('/api/crafting/recipes', methods: ['GET'])]
    public function list(Request $request): JsonResponse
    {
        $category = $request->query->get('category', '');
        $recipes = $category
            ? $this->repo->findByCategory($category)
            : $this->repo->findAllWithIngredients();

        $langKey = self::LANG_MAP[$request->query->get('lang', 'en')] ?? 'EN-US';

        // Noms localisés des recettes + ingrédients en un seul appel
        $uniqueNames = [];
        foreach ($recipes as $r) {
            $uniqueNames[] = $r->getUniqueName();
            foreach ($r->getIngredients() as $i) {
                $uniqueNames[] = $i->getUniqueName();
            }
        }
        $names = $this->itemRepo->localizedNamesFor($uniqueNames);

        return new JsonResponse(array_map(fn($r) => $this->serialize($r, $names, $langKey), $recipes));
    }

    #[Route('/api/crafting/recipes/{id}', methods: ['GET'])]
    public function show(int $id, Request $request): JsonResponse
    {
        $recipe = $this->repo->find($id);
        if (!$recipe) {
            return new JsonResponse(['error' => 'Not found'], 404);
        }
        $langKey = self::LANG_MAP[$request->query->get('lang', 'en')] ?? 'EN-US';
        $uniqueNames = [$recipe->getUniqueName()];
        foreach ($recipe->getIngredients() as $i) {
            $uniqueNames[] = $i->getUniqueName();
        }
        $names = $this->itemRepo->localizedNamesFor($uniqueNames);
        return new JsonResponse($this->serialize($recipe, $names, $langKey));
    }

    #[Route('/api/crafting/recipes', methods: ['POST'])]
    public function create(Request $request): JsonResponse
    {
        $this->denyAccessUnlessGranted('ROLE_ADMIN');
        $data = json_decode($request->getContent(), true);
        $recipe = $this->buildRecipe(new CraftingRecipe(), $data);
        $this->em->persist($recipe);
        $this->em->flush();
        return new JsonResponse($this->serialize($recipe), 201);
    }

    #[Route('/api/crafting/recipes/{id}', methods: ['PUT'])]
    public function update(int $id, Request $request): JsonResponse
    {
        $this->denyAccessUnlessGranted('ROLE_ADMIN');
        $recipe = $this->repo->find($id);
        if (!$recipe) {
            return new JsonResponse(['error' => 'Not found'], 404);
        }
        // Remove old ingredients
        foreach ($recipe->getIngredients() as $ing) {
            $this->em->remove($ing);
        }
        $this->em->flush();

        $data = json_decode($request->getContent(), true);
        $this->buildRecipe($recipe, $data);
        $this->em->flush();
        return new JsonResponse($this->serialize($recipe));
    }

    #[Route('/api/crafting/recipes/{id}', methods: ['DELETE'])]
    public function delete(int $id): JsonResponse
    {
        $this->denyAccessUnlessGranted('ROLE_ADMIN');
        $recipe = $this->repo->find($id);
        if (!$recipe) {
            return new JsonResponse(['error' => 'Not found'], 404);
        }
        $this->em->remove($recipe);
        $this->em->flush();
        return new JsonResponse(['status' => 'deleted']);
    }

    private function buildRecipe(CraftingRecipe $recipe, array $data): CraftingRecipe
    {
        $recipe->setUniqueName($data['uniqueName'] ?? '');
        $recipe->setName($data['name'] ?? null);
        $recipe->setCategory($data['category'] ?? 'other');
        $recipe->setSubcategory($data['subcategory'] ?? null);
        $recipe->setTier((int) ($data['tier'] ?? 4));
        $recipe->setOutputAmount((int) ($data['outputAmount'] ?? 1));
        $recipe->setFocusCostBase((int) ($data['focusCostBase'] ?? 0));
        $recipe->setBonusCity($data['bonusCity'] ?? null);

        foreach ($data['ingredients'] ?? [] as $ing) {
            $ingredient = new CraftingRecipeIngredient();
            $ingredient->setUniqueName($ing['uniqueName']);
            $ingredient->setAmount((int) $ing['amount']);
            $recipe->addIngredient($ingredient);
            $this->em->persist($ingredient);
        }

        return $recipe;
    }

    /**
     * @param array<string,array> $names   uniqueName => localizedNames
     * @param string              $langKey clé de langue (ex. EN-US)
     */
    private function serialize(CraftingRecipe $r, array $names = [], string $langKey = 'EN-US'): array
    {
        $localized = fn(string $u, ?string $fallback) =>
            $names[$u][$langKey] ?? $names[$u]['EN-US'] ?? $fallback ?? $u;

        return [
            'id'            => $r->getId(),
            'uniqueName'    => $r->getUniqueName(),
            'name'          => $localized($r->getUniqueName(), $r->getName()),
            'category'      => $r->getCategory(),
            'subcategory'   => $r->getSubcategory(),
            'tier'          => $r->getTier(),
            'outputAmount'  => $r->getOutputAmount(),
            'focusCostBase' => $r->getFocusCostBase(),
            'bonusCity'     => $r->getBonusCity(),
            'ingredients'   => array_map(fn($i) => [
                'uniqueName' => $i->getUniqueName(),
                'name'       => $localized($i->getUniqueName(), null),
                'amount'     => $i->getAmount(),
            ], $r->getIngredients()->toArray()),
        ];
    }
}
