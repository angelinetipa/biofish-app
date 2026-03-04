<?php
require_once '../config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['success' => false, 'message' => 'Method not allowed']); exit;
}

$data    = json_decode(file_get_contents('php://input'), true);
$action  = $data['action']   ?? '';
$batch_id = intval($data['batch_id'] ?? 0);

if (!$batch_id) {
    echo json_encode(['success' => false, 'message' => 'batch_id required']); exit;
}

$db = getDB();

switch ($action) {
    case 'update_stage':
        $stage = $data['stage'] ?? '';
        $allowed = ['extraction', 'filtration', 'formulation', 'film_formation'];
        if (!in_array($stage, $allowed)) {
            echo json_encode(['success' => false, 'message' => 'Invalid stage']); exit;
        }
        $stmt = $db->prepare("UPDATE batches SET current_stage = ?, status = 'running' WHERE batch_id = ?");
        $stmt->bind_param("si", $stage, $batch_id);
        $stmt->execute();
        echo json_encode(['success' => true]);
        break;

    case 'complete':
        $stmt = $db->prepare("UPDATE batches SET status = 'completed', end_time = NOW() WHERE batch_id = ?");
        $stmt->bind_param("i", $batch_id);
        $stmt->execute();
        echo json_encode(['success' => true, 'message' => 'Demo batch completed']);
        break;

    case 'stop':
        $stmt = $db->prepare("UPDATE batches SET status = 'stopped', end_time = NOW() WHERE batch_id = ?");
        $stmt->bind_param("i", $batch_id);
        $stmt->execute();
        echo json_encode(['success' => true]);
        break;

    case 'pause':
        $stmt = $db->prepare("UPDATE batches SET status = 'paused' WHERE batch_id = ?");
        $stmt->bind_param("i", $batch_id);
        $stmt->execute();
        echo json_encode(['success' => true]);
        break;

    case 'resume':
        $stmt = $db->prepare("UPDATE batches SET status = 'running' WHERE batch_id = ?");
        $stmt->bind_param("i", $batch_id);
        $stmt->execute();
        echo json_encode(['success' => true]);
        break;
    
    case 'rollback':
        // Restore fish scales
        $mats = $db->query("SELECT material_id, quantity_used FROM batch_materials WHERE batch_id = $batch_id");
        if ($mats) {
            while ($r = $mats->fetch_assoc()) {
                $stmt2 = $db->prepare("UPDATE materials SET quantity_kg = quantity_kg + ?, status = 'available' WHERE material_id = ?");
                $stmt2->bind_param("di", $r['quantity_used'], $r['material_id']);
                $stmt2->execute();
            }
        }
        // Restore additives
        $adds = $db->query("SELECT additive_id, quantity_used_ml FROM batch_additives WHERE batch_id = $batch_id");
        if ($adds) {
            while ($r = $adds->fetch_assoc()) {
                $stmt3 = $db->prepare("UPDATE additives SET quantity_ml = quantity_ml + ? WHERE additive_id = ?");
                $stmt3->bind_param("di", $r['quantity_used_ml'], $r['additive_id']);
                $stmt3->execute();
            }
        }
        // Always stop the batch — this was never reaching before due to PHP crash
        $stmt4 = $db->prepare("UPDATE batches SET status = 'stopped', end_time = NOW() WHERE batch_id = ?");
        $stmt4->bind_param("i", $batch_id);
        $stmt4->execute();
        echo json_encode(['success' => true]);
        break;

    default:
        echo json_encode(['success' => false, 'message' => 'Invalid action']);
}

$db->close();
?>