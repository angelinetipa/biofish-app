<?php
require_once '../config.php';
if ($_SERVER['REQUEST_METHOD'] !== 'POST') { echo json_encode(['success'=>false]); exit; }
$data = json_decode(file_get_contents('php://input'), true);
$db = getDB();

// Check busy
$busy = $db->query("SELECT COUNT(*) as cnt FROM batches WHERE status IN ('running','paused')")->fetch_assoc()['cnt'] > 0;
if ($busy) { echo json_encode(['success'=>false,'message'=>'A batch is already running.']); exit; }

// Validate
if (empty($data['batch_code']) || empty($data['materials']) || empty($data['additives'])) {
    echo json_encode(['success'=>false,'message'=>'Batch code, materials and additives are required.']); exit;
}

$db->begin_transaction();
try {
    $primary_material_id = $data['materials'][0]['material_id'];
    $user_id = 1; // TODO: use session user when auth is added

    // Insert batch
    $stmt = $db->prepare("INSERT INTO batches (batch_code, start_time, status, current_stage, user_id, material_id) VALUES (?, NOW(), 'running', 'extraction', ?, ?)");
    $stmt->bind_param("sii", $data['batch_code'], $user_id, $primary_material_id);
    $stmt->execute();
    $batch_id = $db->insert_id;

    // Deduct fish scales
    foreach ($data['materials'] as $m) {
        $qty = floatval($m['quantity_used']);
        if ($qty <= 0) continue;
        $check = $db->prepare("SELECT quantity_kg FROM materials WHERE material_id=?");
        $check->bind_param("i", $m['material_id']);
        $check->execute();
        $current = $check->get_result()->fetch_assoc()['quantity_kg'];
        $new_qty = $current - $qty;
        $new_status = $new_qty <= 0 ? 'depleted' : ($new_qty < 1.0 ? 'low_stock' : 'available');
        $upd = $db->prepare("UPDATE materials SET quantity_kg=?, status=? WHERE material_id=?");
        $upd->bind_param("dsi", $new_qty, $new_status, $m['material_id']);
        $upd->execute();
    }

    foreach ($data['materials'] as $m) {
        $qty = floatval($m['quantity_used']);
        if ($qty <= 0) continue;
        $ins2 = $db->prepare("INSERT INTO batch_materials (batch_id, material_id, quantity_used) VALUES (?, ?, ?)");
        $ins2->bind_param("iid", $batch_id, $m['material_id'], $qty);
        $ins2->execute();
    }

    // Insert additives + deduct stock
    foreach ($data['additives'] as $a) {
        $qty = floatval($a['quantity_used']);
        if ($qty <= 0) continue;
        $ins = $db->prepare("INSERT INTO batch_additives (batch_id, additive_id, quantity_used_ml) VALUES (?,?,?)");
        $ins->bind_param("iid", $batch_id, $a['additive_id'], $qty);
        $ins->execute();
        $upd = $db->prepare("UPDATE additives SET quantity_ml = quantity_ml - ?, last_restocked = last_restocked WHERE additive_id=?");
        $upd->bind_param("di", $qty, $a['additive_id']);
        $upd->execute();
    }

    // Process log
    $log = $db->prepare("INSERT INTO process_logs (batch_id, stage, temperature_celsius, notes) VALUES (?,'extraction',0.00,'Batch started - Beginning extraction phase')");
    $log->bind_param("i", $batch_id);
    $log->execute();

    // Update machine status
    $db->query("UPDATE batches SET machine_status='running' WHERE batch_id=$batch_id");

    $db->commit();
    echo json_encode(['success'=>true,'message'=>'Batch started!','batch_code'=>$data['batch_code'],'batch_id'=>$batch_id]);
} catch (Exception $e) {
    $db->rollback();
    echo json_encode(['success'=>false,'message'=>$e->getMessage()]);
}
$db->close();
?>