<?php
require_once '../config.php';
if ($_SERVER['REQUEST_METHOD'] !== 'POST') { echo json_encode(['success'=>false]); exit; }
$data = json_decode(file_get_contents('php://input'), true);
$db = getDB();

if (empty($data['batch_id']) || empty($data['rating']) || empty($data['user_name'])) {
    echo json_encode(['success' => false, 'message' => 'Batch, rating and name are required.']);
    exit;
}
if (empty($data['comments']) && empty($data['bug_report']) && empty($data['feature_request'])) {
    echo json_encode(['success' => false, 'message' => 'At least one feedback section is required.']);
    exit;
}

$stmt = $db->prepare("INSERT INTO feedback (batch_id, rating, user_name, comments, bug_report, feature_request, submitted_at) VALUES (?,?,?,?,?,?,NOW())");
$stmt->bind_param("iissss", $data['batch_id'], $data['rating'], $data['user_name'], $data['comments'], $data['bug_report'], $data['feature_request']);
$ok = $stmt->execute();
echo json_encode(['success' => $ok, 'message' => $ok ? 'Feedback submitted!' : $db->error]);
$db->close();
?>