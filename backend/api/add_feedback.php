<?php
require_once '../config.php';
if ($_SERVER['REQUEST_METHOD'] !== 'POST') { echo json_encode(['success'=>false]); exit; }
$data = json_decode(file_get_contents('php://input'), true);
$db = getDB();
$stmt = $db->prepare("INSERT INTO feedback (batch_code, rating, comments, created_at) VALUES (?,?,?,NOW())");
$stmt->bind_param("sis", $data['batch_code'], $data['rating'], $data['comments']);
$ok = $stmt->execute();
echo json_encode(['success' => $ok, 'message' => $ok ? 'Saved' : $db->error]);
$db->close();
?>