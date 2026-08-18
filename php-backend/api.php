<?php
// backend/api.php

header('Content-Type: application/json');
require_once __DIR__ . '/cors.php';

require 'database.php';

// Helper to send errors
function sendError($message, $code = 500)
{
    http_response_code($code);
    echo json_encode(['success' => false, 'error' => $message]);
    exit;
}

// Helper to send success
function sendSuccess($data = null)
{
    // Clear any previous output (whitespace, warnings) that breaks JSON
    if (ob_get_length())
        ob_clean();

    echo json_encode(['success' => true, 'data' => $data], JSON_THROW_ON_ERROR);
    exit;
}

// Get Action
$action = $_GET['action'] ?? '';
$input = json_decode(file_get_contents('php://input'), true) ?? [];

// --- RBAC: Backend Action Validation ---
require_once __DIR__ . '/session.php';
$userRole = $_SESSION['user']['role'] ?? 'unlogged';

$admin_actions = [
    'add_equipment',
    'delete_equipment',
    'update_order_times',
    'update_order_status',
    'add_order_equipment',
    'remove_order_equipment',
    'checkout_equipment',
    'checkin_equipment',
    'mark_unavailable',
    'mark_available',
    'bulk_checkin',
    'bulk_checkout',
    'get_admins',
    'add_admin',
    'remove_admin',
    'send_rejection_email',
    'send_approval_email',
    'add_club_account',
    'delete_club_account'
];

if (in_array($action, $admin_actions) && $userRole !== 'admin') {
    sendError("Unauthorized. Admin access required.", 403);
}
// --- END RBAC ---

try {
    switch ($action) {
        // --- 1. Get Admin Data (Complex Read) ---
        case 'get_admin_data':
            $stmt = $pdo->query("CALL sp_GetAdminData()");

            // Result 1: Inventory
            $inventory = $stmt->fetchAll();
            $stmt->nextRowset();

            // Result 2: Orders (Flat)
            $flatOrders = $stmt->fetchAll();
            $stmt->closeCursor();

            // Group Orders
            $groupedOrders = [];
            foreach ($flatOrders as $row) {
                $id = $row['order_id'];
                if (!isset($groupedOrders[$id])) {
                    $groupedOrders[$id] = $row;
                    $groupedOrders[$id]['equipment_items'] = [];
                    unset($groupedOrders[$id]['equipment_id']);
                    unset($groupedOrders[$id]['equipment_name']);
                    unset($groupedOrders[$id]['equipment_status']);
                    unset($groupedOrders[$id]['equipment_active_order_id']);
                }
                if (!empty($row['equipment_id'])) {
                    $groupedOrders[$id]['equipment_items'][] = [
                        'id'              => $row['equipment_id'],
                        'name'            => $row['equipment_name'],
                        'status'          => $row['equipment_status'],
                        'active_order_id' => $row['equipment_active_order_id']
                    ];
                }
            }

            sendSuccess([
                'inventory' => $inventory,
                'orders' => array_values($groupedOrders)
            ]);
            break;

        // --- 2. Add Equipment ---
        case 'add_equipment':
            $stmt = $pdo->prepare("CALL sp_AddEquipment(?, ?)");
            $stmt->execute([$input['name'], $input['status']]);
            sendSuccess("Equipment added");
            break;

        // --- 3. Delete Equipment ---
        case 'delete_equipment':
            $stmt = $pdo->prepare("CALL sp_DeleteEquipment(?)");
            $stmt->execute([$input['id']]);
            sendSuccess("Equipment deleted");
            break;

        // --- 4. Create Order ---
        case 'create_order':
            $stmt = $pdo->prepare("CALL sp_CreateOrder(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
            $stmt->execute([
                $input['club_name'],
                $input['signed_name'],
                $input['email'],
                $input['club_account_number'] ?? null,
                $input['event_date'],
                $input['location'],
                $input['b_engaged_link'],
                $input['timespan_description'],
                $input['start_date'],
                $input['end_date'],
                $input['equipment_ids']
            ]);
            sendSuccess("Order created");
            break;

        // --- 5. Update Order Times ---
        case 'update_order_times':
            $stmt = $pdo->prepare("CALL sp_UpdateOrderTimes(?, ?, ?)");
            $stmt->execute([$input['order_id'], $input['new_start'], $input['new_end']]);
            sendSuccess("Order times updated");
            break;

        // --- 6. Update Order Status ---
        case 'update_order_status':
            $stmt = $pdo->prepare("CALL sp_UpdateOrderStatus(?, ?)");
            $stmt->execute([$input['order_id'], $input['new_status']]);
            sendSuccess("Order status updated");
            break;

        // --- 7a. Add Order Equipment ---
        case 'add_order_equipment':
            $stmt = $pdo->prepare("CALL sp_AddOrderEquipment(?, ?)");
            $stmt->execute([$input['order_id'], $input['equipment_id']]);
            sendSuccess("Item added to order");
            break;

        // --- 7b. Remove Order Equipment ---
        case 'remove_order_equipment':
            $stmt = $pdo->prepare("CALL sp_RemoveOrderEquipment(?, ?)");
            $stmt->execute([$input['order_id'], $input['equipment_id']]);
            sendSuccess("Item removed from order");
            break;

        // --- 8. Checkout Single Item ---
        case 'checkout_equipment':
            $stmt = $pdo->prepare("CALL sp_ProcessEquipmentCheckOut(?, ?)");
            $stmt->execute([$input['equipment_id'], $input['order_id']]);
            sendSuccess("Equipment checked out");
            break;

        // --- 9. Checkin Single Item ---
        case 'checkin_equipment':
        case 'mark_available': // Alias for checkout since both set to Available usually, but checkin is from user flow
            $stmt = $pdo->prepare("CALL sp_ProcessEquipmentCheckIn(?)");
            $stmt->execute([$input['equipment_id']]);
            sendSuccess("Equipment checked in");
            break;

        // --- 10. Mark Unavailable (In Office) ---
        case 'mark_unavailable':
            $stmt = $pdo->prepare("CALL sp_MarkItemUnavailable(?)");
            $stmt->execute([$input['equipment_id']]);
            sendSuccess("Equipment marked unavailable");
            break;

        // --- 11. Bulk Checkin ---
        case 'bulk_checkin':
            $stmt = $pdo->prepare("CALL sp_BulkOrderCheckIn(?)");
            $stmt->execute([$input['order_id']]);
            sendSuccess("Bulk checkin complete");
            break;

        // --- 12. Bulk Checkout ---
        case 'bulk_checkout':
            $stmt = $pdo->prepare("CALL sp_BulkOrderCheckOut(?)");
            $stmt->execute([$input['order_id']]);
            sendSuccess("Bulk checkout complete");
            break;

        // --- 13. Get Admins ---
        case 'get_admins':
            $stmt = $pdo->query("CALL sp_GetAdmins()");
            $admins = $stmt->fetchAll();
            sendSuccess($admins);
            break;

        // --- 14. Add Admin ---
        case 'add_admin':
            if (!isset($input['email']))
                sendError("Email is required", 400);
            $stmt = $pdo->prepare("CALL sp_AddAdmin(?)");
            $stmt->execute([$input['email']]);
            sendSuccess("Admin added");
            break;

        // --- 15. Remove Admin ---
        case 'remove_admin':
            if (!isset($input['email']))
                sendError("Email is required", 400);
            $stmt = $pdo->prepare("CALL sp_RemoveAdmin(?)");
            $stmt->execute([$input['email']]);
            sendSuccess("Admin removed");
            break;

        // --- 16. Send Rejection Email ---
        case 'send_rejection_email':
            require_once __DIR__ . '/send_rejection_email.php';
            if (!isset($input['recipientEmail'], $input['recipientName'], $input['rejectionReason'])) {
                sendError("Missing required fields for email", 400);
            }
            $result = sendEquipmentRejectedEmail(
                $input['recipientEmail'],
                $input['recipientName'],
                $input['rejectionReason'],
                $input['equipmentItems'] ?? [],
                $input['pickupTime'] ?? '',
                $input['dropoffTime'] ?? ''
            );

            if ($result['success']) {
                sendSuccess("Rejection email sent");
            } else {
                sendError("Failed: " . $result['error']);
            }
            break;

        // --- 17. Send Approval Email ---
        case 'send_approval_email':
            require_once __DIR__ . '/send_approval_email.php';
            if (!isset($input['recipientEmail'], $input['recipientName'])) {
                sendError("Missing required fields for approval email", 400);
            }
            $result = sendEquipmentApprovedEmail(
                $input['recipientEmail'],
                $input['recipientName'],
                $input['approvalNotes'] ?? '', // Optional note
                $input['equipmentItems'] ?? [],
                $input['pickupTime'] ?? '',
                $input['dropoffTime'] ?? ''
            );

            if ($result['success']) {
                sendSuccess("Approval email sent");
            } else {
                sendError("Failed: " . $result['error']);
            }
            break;

        // --- 18. Get Club Accounts (Public) ---
        case 'get_club_accounts':
            $stmt = $pdo->query("CALL sp_GetClubAccounts()");
            $accounts = $stmt->fetchAll();
            sendSuccess($accounts);
            break;

        // --- 19. Add / Update Club Account (Admin) ---
        case 'add_club_account':
            if (empty($input['club_name']) || empty($input['account_number'])) {
                sendError("Club name and account number are required", 400);
            }
            $stmt = $pdo->prepare("CALL sp_AddClubAccount(?, ?)");
            $stmt->execute([$input['club_name'], $input['account_number']]);
            sendSuccess("Club account saved");
            break;

        // --- 20. Delete Club Account (Admin) ---
        case 'delete_club_account':
            if (empty($input['id'])) {
                sendError("Club account ID is required", 400);
            }
            $stmt = $pdo->prepare("CALL sp_DeleteClubAccount(?)");
            $stmt->execute([$input['id']]);
            sendSuccess("Club account deleted");
            break;
    }
} catch (PDOException $e) {
    sendError("Database Error: " . $e->getMessage());
} catch (Exception $e) {
    sendError("Server Error: " . $e->getMessage());
}
?>