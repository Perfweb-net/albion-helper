<?php
require '/app/vendor/autoload.php';

use Doctrine\DBAL\DriverManager;
use Symfony\Component\HttpClient\HttpClient;

// Load .env
$dotenv = Symfony\Component\Dotenv\Dotenv::class;
if (class_exists($dotenv)) {
    (new $dotenv())->loadEnv('/app/.env');
}

$dsnRaw = $_ENV['DATABASE_URL'] ?? getenv('DATABASE_URL') ?? 'postgresql://app:app@db:5432/app';
$params = parse_url($dsnRaw);

$conn = DriverManager::getConnection([
    'driver'   => 'pdo_pgsql',
    'host'     => $params['host'],
    'port'     => $params['port'] ?? 5432,
    'dbname'   => ltrim($params['path'], '/'),
    'user'     => $params['user'],
    'password' => $params['pass'],
]);

$client = HttpClient::create();
$response = $client->request('GET', 'https://raw.githubusercontent.com/ao-data/ao-bin-dumps/master/formatted/items.json');
$raw = json_decode($response->getContent(), true);

echo "Fetched " . count($raw) . " items\n";

$inserted = 0; $updated = 0; $i = 0;
foreach ($raw as $data) {
    $uniqueName = $data['UniqueName'] ?? null;
    if (!$uniqueName) continue;
    $names = json_encode($data['LocalizedNames'] ?? []);
    preg_match('/^T(\d)_/', $uniqueName, $m);
    $tier = isset($m[1]) ? (int)$m[1] : null;
    
    $exists = $conn->fetchOne("SELECT id FROM item WHERE unique_name = ?", [$uniqueName]);
    if (!$exists) {
        $conn->executeStatement(
            "INSERT INTO item (unique_name, localized_names, tier, synced_at) VALUES (?,?::jsonb,?,NOW())",
            [$uniqueName, $names, $tier]
        );
        $inserted++;
    } else {
        $conn->executeStatement(
            "UPDATE item SET localized_names=?::jsonb, tier=?, synced_at=NOW() WHERE unique_name=?",
            [$names, $tier, $uniqueName]
        );
        $updated++;
    }
    if (++$i % 500 === 0) echo "Progress: $i\n";
}
echo json_encode(['inserted' => $inserted, 'updated' => $updated, 'total' => $inserted + $updated]);
