<?php
require_once '../config.php';
if ($_SERVER['REQUEST_METHOD'] !== 'POST') { echo json_encode(['success'=>false]); exit; }
$data = json_decode(file_get_contents('php://input'), true);
$db = getDB();
if ($data['item_type'] === 'fish_scales') {
    $stmt = $db->prepare("INSERT INTO materials (material_type, fish_scale_type, source_location, quantity_kg, date_collected, status) VALUES ('fish_scales',?,?,?,?,?)");
    $status = $data['quantity_kg'] >= 1 ? 'available' : 'low_stock';
    $stmt->bind_param("ssdss", $data['fish_scale_type'], $data['source_location'], $data['quantity_kg'], $data['date_collected'], $status);
} else {
    $last = $data['last_restocked'] ?? date('Y-m-d');
    // Check if exists
    $check = $db->prepare("SELECT additive_id FROM additives WHERE additive_name = ?");
    $check->bind_param("s", $data['additive_name']);
    $check->execute();
    $res = $check->get_result();
    if ($res->num_rows > 0) {
        // Add to existing stock
        $id = $res->fetch_assoc()['additive_id'];
        $stmt = $db->prepare("UPDATE additives SET quantity_ml = quantity_ml + ?, last_restocked = ? WHERE additive_id = ?");
        $stmt->bind_param("dsi", $data['quantity_ml'], $last, $id);
    } else {
        $stmt = $db->prepare("INSERT INTO additives (additive_name, quantity_ml, minimum_level, last_restocked) VALUES (?,?,?,?)");
        $stmt->bind_param("sdds", $data['additive_name'], $data['quantity_ml'], $data['minimum_level'], $last);
    }
}
$ok = $stmt->execute();
echo json_encode(['success' => $ok, 'message' => $ok ? 'Added' : $db->error]);
$db->close();
?>