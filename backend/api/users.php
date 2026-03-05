<?php
require_once '../config.php';

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') exit(0);

$db = getDB();

// ── Helper: verify caller is admin ───────────────────────────────────────────
function getRequestedBy($db) {
    $data = json_decode(file_get_contents('php://input'), true);
    // Caller must send their own user_id + role for verification
    $caller_id = (int)($data['caller_id'] ?? 0);
    if (!$caller_id) return null;
    $s = $db->prepare("SELECT role FROM users WHERE user_id = ?");
    $s->bind_param('i', $caller_id);
    $s->execute();
    $r = $s->get_result()->fetch_assoc();
    $s->close();
    return $r;
}

// ── GET: list all users ───────────────────────────────────────────────────────
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $caller_id = (int)($_GET['caller_id'] ?? 0);
    if (!$caller_id) { echo json_encode(['success'=>false,'message'=>'Unauthorized']); exit; }

    $s = $db->prepare("SELECT role FROM users WHERE user_id = ?");
    $s->bind_param('i', $caller_id); $s->execute();
    $caller = $s->get_result()->fetch_assoc(); $s->close();

    if (!$caller || $caller['role'] !== 'admin') {
        echo json_encode(['success'=>false,'message'=>'Admin access required']); exit;
    }

    $result = $db->query("SELECT user_id, username, full_name, email, role, created_at FROM users ORDER BY created_at DESC");
    echo json_encode(['success'=>true, 'data'=>$result->fetch_all(MYSQLI_ASSOC)]);
    $db->close(); exit;
}

// ── POST: add / delete / update_role ─────────────────────────────────────────
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data      = json_decode(file_get_contents('php://input'), true);
    $action    = $data['action']    ?? '';
    $caller_id = (int)($data['caller_id'] ?? 0);

    // Verify admin
    $s = $db->prepare("SELECT role FROM users WHERE user_id = ?");
    $s->bind_param('i', $caller_id); $s->execute();
    $caller = $s->get_result()->fetch_assoc(); $s->close();

    if (!$caller || $caller['role'] !== 'admin') {
        echo json_encode(['success'=>false,'message'=>'Admin access required']); exit;
    }

    // ADD USER
    if ($action === 'add_user') {
        $username  = trim($data['username']  ?? '');
        $full_name = trim($data['full_name'] ?? '');
        $email     = trim($data['email']     ?? '');
        $role      = in_array($data['role'] ?? '', ['admin','operator']) ? $data['role'] : 'operator';
        $password  = $data['password'] ?? '';

        if (!$username || !$password) {
            echo json_encode(['success'=>false,'message'=>'Username and password required']); exit;
        }

        $hashed = password_hash($password, PASSWORD_DEFAULT);
        $s = $db->prepare("INSERT INTO users (username, password, full_name, email, role) VALUES (?,?,?,?,?)");
        $s->bind_param('sssss', $username, $hashed, $full_name, $email, $role);

        if ($s->execute()) {
            echo json_encode(['success'=>true,'message'=>"User '$username' created."]);
        } else {
            echo json_encode(['success'=>false,'message'=>'Username may already exist.']);
        }
        $s->close();
    }

    // DELETE USER
    elseif ($action === 'delete_user') {
        $target_id = (int)($data['user_id'] ?? 0);
        if ($target_id === $caller_id) {
            echo json_encode(['success'=>false,'message'=>'Cannot delete your own account']); exit;
        }
        $s = $db->prepare("DELETE FROM users WHERE user_id = ?");
        $s->bind_param('i', $target_id); $s->execute(); $s->close();
        echo json_encode(['success'=>true,'message'=>'User deleted.']);
    }

    // UPDATE ROLE
    elseif ($action === 'update_role') {
        $target_id = (int)($data['user_id'] ?? 0);
        $new_role  = in_array($data['role'] ?? '', ['admin','operator']) ? $data['role'] : 'operator';
        if ($target_id === $caller_id) {
            echo json_encode(['success'=>false,'message'=>'Cannot change your own role']); exit;
        }
        $s = $db->prepare("UPDATE users SET role = ? WHERE user_id = ?");
        $s->bind_param('si', $new_role, $target_id); $s->execute(); $s->close();
        echo json_encode(['success'=>true,'message'=>'Role updated.']);
    }

    else {
        echo json_encode(['success'=>false,'message'=>'Unknown action']);
    }

    $db->close(); exit;
}

echo json_encode(['success'=>false,'message'=>'Method not allowed']);