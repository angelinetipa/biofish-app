<?php
require_once '../config.php';
$db = getDB();

// Check if machine is busy
$busy = $db->query("SELECT COUNT(*) as cnt FROM batches WHERE status IN ('running','paused')")->fetch_assoc()['cnt'] > 0;

// Available fish scales
$matsQ = $db->query("SELECT material_id, fish_scale_type, source_location, quantity_kg FROM materials WHERE status='available' AND material_type='fish_scales' ORDER BY fish_scale_type");
$materials = [];
while ($r = $matsQ->fetch_assoc()) $materials[] = $r;

// All additives
$addQ = $db->query("SELECT additive_id, additive_name, quantity_ml, minimum_level FROM additives ORDER BY additive_name");
$additives = [];
while ($r = $addQ->fetch_assoc()) $additives[] = $r;

// Generate batch code
$count = $db->query("SELECT COUNT(*) as cnt FROM batches WHERE batch_code LIKE 'BATCH-%'")->fetch_assoc()['cnt'] + 1;
$batch_code = 'BATCH-' . str_pad($count, 4, '0', STR_PAD_LEFT);

echo json_encode([
    'success'    => true,
    'busy'       => $busy,
    'batch_code' => $batch_code,
    'materials'  => $materials,
    'additives'  => $additives,
]);
$db->close();
?>