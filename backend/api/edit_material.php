<?php
require_once '../config.php';
if ($_SERVER['REQUEST_METHOD'] !== 'POST') { echo json_encode(['success'=>false]); exit; }

$data = json_decode(file_get_contents('php://input'), true);
$db   = getDB();
$type = $data['type'] ?? '';

if ($type === 'fish_scale') {
    $id       = (int)$data['id'];
    $scale    = $data['fish_scale_type']  ?? '';
    $source   = $data['source_location']  ?? '';
    $qty      = (float)$data['quantity_kg'];
    $date     = $data['date_collected']   ?? '';
    $status   = $qty <= 0 ? 'depleted' : ($qty < 1 ? 'low_stock' : 'available');

    $stmt = $db->prepare("UPDATE materials SET fish_scale_type=?, source_location=?, quantity_kg=?, date_collected=?, status=? WHERE material_id=?");
    $stmt->bind_param('ssdssi', $scale, $source, $qty, $date, $status, $id);

} elseif ($type === 'additive') {
    $id    = (int)$data['id'];
    $name  = $data['additive_name']  ?? '';
    $qty   = (float)$data['quantity_ml'];
    $min   = (float)$data['minimum_level'];
    $last  = $data['last_restocked'] ?? date('Y-m-d');

    $stmt = $db->prepare("UPDATE additives SET additive_name=?, quantity_ml=?, minimum_level=?, last_restocked=? WHERE additive_id=?");
    $stmt->bind_param('sddsi', $name, $qty, $min, $last, $id);

} else {
    echo json_encode(['success'=>false, 'message'=>'Invalid type']); exit;
}

$ok = $stmt->execute();
echo json_encode(['success'=>$ok, 'message'=> $ok ? 'Updated' : $db->error]);
$db->close();
?>