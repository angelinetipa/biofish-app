<?php
require_once '../config.php';

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    // Get status from ESP32
    $url = 'http://' . ESP32_IP . ':' . ESP32_PORT . '/status';
    
    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_TIMEOUT, 5);
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    
    if ($httpCode === 200) {
        $status = json_decode($response, true);
        echo json_encode(['success' => true, 'data' => $status]);
    } else {
        echo json_encode(['success' => false, 'message' => 'ESP32 not responding']);
    }
} else {
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
}
?>