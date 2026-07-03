<?php

namespace App\Controller;

use App\Service\LocaleManager;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;

class LocaleController extends AbstractController
{
    public function __construct(
        private readonly LocaleManager $locales,
    ) {}

    /** Liste publique des langues disponibles (codes). */
    #[Route('/api/locales', methods: ['GET'])]
    public function list(): JsonResponse
    {
        $codes = $this->locales->listCodes();

        return new JsonResponse([
            'reference' => LocaleManager::REFERENCE,
            'locales' => array_map(
                fn(string $code) => ['code' => $code, 'reference' => $code === LocaleManager::REFERENCE],
                $codes,
            ),
        ]);
    }

    /** Contenu d'une langue — consommé par i18next-http-backend (public). */
    #[Route('/api/locales/{code}', methods: ['GET'], requirements: ['code' => '[a-zA-Z-]+'])]
    public function get(string $code): JsonResponse
    {
        try {
            return new JsonResponse($this->locales->get($code));
        } catch (\Throwable $e) {
            return $this->error($e);
        }
    }

    /** Crée une langue en clonant toutes les clés de la référence (ROLE_ADMIN). */
    #[Route('/api/admin/locales', methods: ['POST'])]
    public function create(Request $request): JsonResponse
    {
        $code = (string) ($this->decodeBody($request)['code'] ?? '');
        try {
            $content = $this->locales->create($code);

            return new JsonResponse(
                ['code' => strtolower(trim($code)), 'translations' => $content],
                Response::HTTP_CREATED,
            );
        } catch (\Throwable $e) {
            return $this->error($e);
        }
    }

    /** Met à jour les valeurs de traduction d'une langue (ROLE_ADMIN). */
    #[Route('/api/admin/locales/{code}', methods: ['PUT'], requirements: ['code' => '[a-zA-Z-]+'])]
    public function update(string $code, Request $request): JsonResponse
    {
        $body = $this->decodeBody($request);
        // Accepte soit { translations: {...} }, soit directement l'objet de traductions.
        $values = isset($body['translations']) && is_array($body['translations'])
            ? $body['translations']
            : $body;
        try {
            return new JsonResponse($this->locales->update($code, $values));
        } catch (\Throwable $e) {
            return $this->error($e);
        }
    }

    /** Supprime une langue (sauf la référence) (ROLE_ADMIN). */
    #[Route('/api/admin/locales/{code}', methods: ['DELETE'], requirements: ['code' => '[a-zA-Z-]+'])]
    public function delete(string $code): JsonResponse
    {
        try {
            $this->locales->delete($code);

            return new JsonResponse(null, Response::HTTP_NO_CONTENT);
        } catch (\Throwable $e) {
            return $this->error($e);
        }
    }

    private function decodeBody(Request $request): array
    {
        $data = json_decode($request->getContent() ?: '{}', true);

        return is_array($data) ? $data : [];
    }

    private function error(\Throwable $e): JsonResponse
    {
        $code = $e->getCode();
        $status = is_int($code) && $code >= 400 && $code < 600 ? $code : Response::HTTP_BAD_REQUEST;

        return new JsonResponse(['error' => $e->getMessage()], $status);
    }
}
