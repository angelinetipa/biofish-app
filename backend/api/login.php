<?php
require_once '../config.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    $username = $data['username'] ?? '';
    $password = $data['password'] ?? '';
    
    // Demo credentials (replace with your actual authentication)
    $validUsers = [
        'admin' => 'password123',
        'operator1' => 'password123'
    ];
    
    if (isset($validUsers[$username]) && $validUsers[$username] === $password) {
        // Log successful login
        $db = getDB();
        $stmt = $db->prepare("INSERT INTO login_logs (username, timestamp) VALUES (?, NOW())");
        $stmt->bind_param('s', $username);
        $stmt->execute();
        $stmt->close();
        $db->close();
        
        echo json_encode([
            'success' => true,
            'message' => 'Login successful',
            'user' => $username
        ]);
    } else {
        echo json_encode([
            'success' => false,
            'message' => 'Invalid username or password'
        ]);
    }
} else {
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
}
?>