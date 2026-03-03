<?php
require_once '../config.php';

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $type = $_GET['type'] ?? 'metrics';
    $db = getDB();
    
    if ($type === 'metrics') {
        // Get machine status
        $statusQuery = $db->query("SELECT status, batch_code, current_stage FROM batches WHERE status IN ('running', 'paused', 'cleaning') ORDER BY start_time DESC LIMIT 1");
        $statusData = $statusQuery->fetch_assoc();
        
        $machineStatus = $statusData ? $statusData['status'] : 'idle';
        $currentBatch = $statusData ? $statusData['batch_code'] : null;
        $currentStage = $statusData ? $statusData['current_stage'] : null;
        
        // Get metrics
        $totalBatches = $db->query("SELECT COUNT(*) as count FROM batches")->fetch_assoc()['count'];
        $completedBatches = $db->query("SELECT COUNT(*) as count FROM batches WHERE status='completed'")->fetch_assoc()['count'];
        $successRate = $totalBatches > 0 ? round(($completedBatches / $totalBatches) * 100) : 0;
        
        $avgTimeQuery = $db->query("SELECT AVG(TIMESTAMPDIFF(MINUTE, start_time, end_time)) as avg FROM batches WHERE status='completed'");
        $avgTime = round($avgTimeQuery->fetch_assoc()['avg'] ?? 0);
        
        $lowStockMaterials = $db->query("SELECT COUNT(*) as count FROM materials WHERE status='low_stock'")->fetch_assoc()['count'];
        $lowStockAdditives = $db->query("SELECT COUNT(*) as count FROM additives WHERE quantity_ml <= minimum_level")->fetch_assoc()['count'];
        $lowStock = $lowStockMaterials + $lowStockAdditives;
        
        echo json_encode([
            'success' => true,
            'data' => [
                'machineStatus' => $machineStatus,
                'currentBatch' => $currentBatch,
                'currentStage' => $currentStage,
                'totalBatches' => $totalBatches,
                'successRate' => $successRate,
                'avgTime' => $avgTime,
                'lowStock' => $lowStock
            ]
        ]);
    }
    elseif ($type === 'batches') {
        $result = $db->query("SELECT b.batch_code, b.status, b.start_time, b.end_time, b.current_stage, m.fish_scale_type, u.full_name as operator, DATE_FORMAT(b.start_time, '%Y-%m-%d') as date FROM batches b LEFT JOIN materials m ON b.material_id = m.material_id LEFT JOIN users u ON b.user_id = u.user_id ORDER BY b.start_time DESC LIMIT 20");
        
        $batches = [];
        while ($row = $result->fetch_assoc()) {
            $batches[] = $row;
        }
        
        echo json_encode(['success' => true, 'data' => $batches]);
    }
    elseif ($type === 'materials') {
        $fish = $db->query("SELECT material_id, fish_scale_type, source_location, quantity_kg, date_collected, status FROM materials WHERE material_type='fish_scales' ORDER BY date_collected DESC");
        $fishData = [];
        while ($r = $fish->fetch_assoc()) $fishData[] = $r;

        $additives = $db->query("SELECT additive_id, additive_name, quantity_ml, minimum_level, last_restocked, created_at FROM additives ORDER BY additive_name");
        $addData = [];
        while ($r = $additives->fetch_assoc()) $addData[] = $r;

        echo json_encode(['success' => true, 'fish_scales' => $fishData, 'additives' => $addData]);
    }
    elseif ($type === 'feedback') {
        $result = $db->query("SELECT f.rating, f.comments, b.batch_code, DATE_FORMAT(f.created_at, '%Y-%m-%d') as date FROM feedback f LEFT JOIN batches b ON f.batch_id = b.batch_id ORDER BY f.created_at DESC LIMIT 10");
        
        $feedback = [];
        while ($row = $result->fetch_assoc()) {
            $feedback[] = $row;
        }
        
        echo json_encode(['success' => true, 'data' => $feedback]);
    }
    
    $db->close();
} else {
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
}
?>