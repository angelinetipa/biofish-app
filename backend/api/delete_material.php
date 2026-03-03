<?php
require_once '../config.php';
if ($_SERVER['REQUEST_METHOD'] !== 'POST') { echo json_encode(['success'=>false]); exit; }
$data = json_decode(file_get_contents('php://input'), true);
$db = getDB();

if ($data['type'] === 'fish_scale') {
    // Check if used in any batch
    $check = $db->prepare("SELECT COUNT(*) as cnt FROM batches WHERE material_id = ?");
    $check->bind_param("i", $data['id']);
    $check->execute();
    $cnt = $check->get_result()->fetch_assoc()['cnt'];

    if ($cnt > 0) {
        echo json_encode(['success' => false, 'message' => "Cannot delete — this material was used in {$cnt} batch(es)."]);
        $db->close(); exit;
    }

    $stmt = $db->prepare("DELETE FROM materials WHERE material_id = ?");
    $stmt->bind_param("i", $data['id']);
} else {
    $stmt = $db->prepare("DELETE FROM additives WHERE additive_id = ?");
    $stmt->bind_param("i", $data['id']);
}

$ok = $stmt->execute();
echo json_encode(['success' => $ok, 'message' => $ok ? 'Deleted' : $db->error]);
$db->close();
?>