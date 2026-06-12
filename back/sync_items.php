<?php
require '/app/vendor/autoload.php';
use Symfony\Component\HttpClient\HttpClient;
use Doctrine\ORM\EntityManagerInterface;

$_SERVER['APP_ENV'] = 'dev';
$_SERVER['APP_DEBUG'] = '1';

$kernel = new App\Kernel('dev', true);
$kernel->boot();
$container = $kernel->getContainer();
$service = $container->get('App\Service\ItemSyncService');
$result = $service->syncItems();
echo json_encode($result);
