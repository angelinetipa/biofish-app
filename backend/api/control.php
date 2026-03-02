<?php
require_once '../config.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    $command = $data['command'] ?? '';
    
    // Valid commands: start, pause, stop, cleaning
    $validCommands = ['start', 'pause', 'stop', 'cleaning'];
    
    if (!in_array($command, $validCommands)) {
        echo json_encode(['success' => false, 'message' => 'Invalid command']);
        exit;
    }
    
    // Send command to ESP32
    $url = 'http://' . ESP32_IP . ':' . ESP32_PORT . '/control?cmd=' . $command;
    
    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_TIMEOUT, 5);
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    
    if ($httpCode === 200) {
        // Log to database
        $db = getDB();
        $stmt = $db->prepare("INSERT INTO command_logs (command, timestamp) VALUES (?, NOW())");
        $stmt->bind_param('s', $command);
        $stmt->execute();
        $stmt->close();
        $db->close();
        
        echo json_encode(['success' => true, 'message' => 'Command sent', 'command' => $command]);
    } else {
        echo json_encode(['success' => false, 'message' => 'ESP32 not responding']);
    }
} else {
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
}
?>