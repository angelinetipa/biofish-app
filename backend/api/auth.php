<?php
require_once '../config.php';

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') exit(0);

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    $username = $data['username'] ?? '';
    $password = $data['password'] ?? '';

    $db = getDB();
    $stmt = $db->prepare("SELECT user_id, username, full_name, role FROM users WHERE username = ?");
    $stmt->bind_param("s", $username);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows === 1) {
        $user = $result->fetch_assoc();
        // Demo: plain password check. Replace with password_verify() if hashed.
        if ($password === 'password123') {
            echo json_encode([
                'success' => true,
                'message' => 'Login successful',
                'user' => [
                    'id'       => $user['user_id'],
                    'username' => $user['username'],
                    'name'     => $user['full_name'],
                    'role'     => $user['role'],
                ]
            ]);
        } else {
            echo json_encode(['success' => false, 'message' => 'Invalid username or password']);
        }
    } else {
        echo json_encode(['success' => false, 'message' => 'Invalid username or password']);
    }

    $stmt->close();
    $db->close();
} else {
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
}
?>