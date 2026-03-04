<?php
require_once '../config.php';
$db = getDB();
$result = $db->query("SELECT batch_id, batch_code, DATE_FORMAT(end_time, '%b %d, %Y') as completed_date FROM batches WHERE status = 'completed' ORDER BY end_time DESC LIMIT 20");
$batches = [];
while ($row = $result->fetch_assoc()) $batches[] = $row;
echo json_encode(['success' => true, 'data' => $batches]);
$db->close();
?>