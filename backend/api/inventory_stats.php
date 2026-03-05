<?php
require_once '../config.php';
$db = getDB();

// Total fish scales (kg) available
$totalFish = $db->query("SELECT COALESCE(SUM(quantity_kg),0) as total FROM materials WHERE material_type='fish_scales' AND status != 'depleted'")->fetch_assoc()['total'];

// Total additives (mL) available
$totalAdditives = $db->query("SELECT COALESCE(SUM(quantity_ml),0) as total FROM additives")->fetch_assoc()['total'];

// Low stock items with names
$lowQ = $db->query("
    SELECT fish_scale_type as name, quantity_kg as qty, 'kg' as unit FROM materials
    WHERE status='low_stock' AND material_type='fish_scales'
    UNION ALL
    SELECT additive_name as name, quantity_ml as qty, 'mL' as unit FROM additives
    WHERE quantity_ml <= minimum_level AND quantity_ml > 0
    UNION ALL
    SELECT fish_scale_type as name, 0 as qty, 'kg' as unit FROM materials WHERE status='depleted'
    UNION ALL
    SELECT additive_name as name, 0 as qty, 'mL' as unit FROM additives WHERE quantity_ml <= 0
");
$lowItems = [];
while ($r = $lowQ->fetch_assoc()) $lowItems[] = $r;

// Most used material (fish scale type used most across batches)
$mostUsed = $db->query("
    SELECT m.fish_scale_type, COUNT(bm.batch_id) as use_count
    FROM batch_materials bm
    JOIN materials m ON bm.material_id = m.material_id
    GROUP BY m.fish_scale_type
    ORDER BY use_count DESC
    LIMIT 1
")->fetch_assoc();

echo json_encode([
    'success'         => true,
    'total_fish_kg'   => round((float)$totalFish, 2),
    'total_additives_ml' => round((float)$totalAdditives, 2),
    'low_stock_count' => count($lowItems),
    'low_stock_items' => $lowItems,
    'most_used'       => $mostUsed ? $mostUsed['fish_scale_type'] . ' (' . $mostUsed['use_count'] . ' batches)' : '—',
]);
$db->close();
?>