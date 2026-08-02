<?php
// backend/index.php

// 1. Include the database connection execution
require 'database.php';

$orders = [];
$groupedOrders = [];

// 2. Fetch data using the Stored Procedure
try {
    $stmt = $pdo->query("CALL sp_GetAdminData()");

    // Result Set 1: Inventory (Equipment) - We can ignore this for the Order View, or store it if needed later
    $inventory = $stmt->fetchAll();

    // Move to Result Set 2: Orders (Flat Join with Equipment)
    $stmt->nextRowset();
    $flatOrders = $stmt->fetchAll();

    // 3. Process Flat Data into Nested Structure (Group by Order ID)
    foreach ($flatOrders as $row) {
        $id = $row['order_id'];

        if (!isset($groupedOrders[$id])) {
            // Initialize the order object if we haven't seen this ID yet
            $groupedOrders[$id] = [
                'id' => $row['order_id'],
                'club_name' => $row['club_name'],
                'signed_name' => $row['signed_name'],
                'email' => $row['email'],
                'club_account_number' => $row['club_account_number'],
                'event_date' => $row['event_date'],
                'location' => $row['location'],
                'b_engaged_link' => $row['b_engaged_link'],
                'timespan_description' => $row['timespan_description'],
                'start_date' => $row['start_date'],
                'end_date' => $row['end_date'],
                'status' => $row['status'],
                'equipment_items' => []
            ];
        }

        // If this row has valid equipment data, add it to the list
        if (!empty($row['equipment_id'])) {
            $groupedOrders[$id]['equipment_items'][] = [
                'name' => $row['equipment_name'],
                'status' => $row['equipment_status']
            ];
        }
    }

} catch (PDOException $e) {
    echo "Error fetching data: " . $e->getMessage();
    exit;
}
?>

<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Admin Order View (PHP)</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            padding: 20px;
            background-color: #f4f6f8;
            font-size: 14px;
        }

        h1 {
            color: #333;
        }

        .table-container {
            overflow-x: auto;
        }

        table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
            background: white;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
            min-width: 1200px;
        }

        th,
        td {
            padding: 10px 12px;
            text-align: left;
            border-bottom: 1px solid #ddd;
            vertical-align: top;
        }

        th {
            background-color: #007bff;
            color: white;
            text-transform: uppercase;
            font-size: 0.75rem;
            letter-spacing: 0.5px;
            white-space: nowrap;
        }

        tr:hover {
            background-color: #f1f1f1;
        }

        .status-badge {
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 0.75rem;
            font-weight: bold;
            display: inline-block;
        }

        .status-PendingApproval {
            background-color: #fff3cd;
            color: #856404;
        }

        .status-Approved {
            background-color: #d4edda;
            color: #155724;
        }

        .status-Denied {
            background-color: #f8d7da;
            color: #721c24;
        }

        .status-Completed {
            background-color: #d1ecf1;
            color: #0c5460;
        }

        .equipment-list {
            font-size: 0.85em;
            color: #555;
        }

        .link-icon {
            text-decoration: none;
            font-size: 1.2em;
        }

        .meta-info {
            font-size: 0.85em;
            color: #777;
        }
    </style>
</head>

<body>

    <h1>📦 Incoming Orders (Full Data via Stored Procedure)</h1>
    <p>Viewing complete order details fetched using <code>sp_GetAdminData</code>.</p>

    <?php if (count($groupedOrders) > 0): ?>
        <div class="table-container">
            <table>
                <thead>
                    <tr>
                        <th width="30">ID</th>
                        <th width="80">Status</th>
                        <th>Club / Account</th>
                        <th>Contact Info</th>
                        <th>Event Details</th>
                        <th>Schedule</th>
                        <th>Requested Equipment</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    <?php foreach ($groupedOrders as $order): ?>
                        <?php
                        // Determine status class for styling
                        $statusClass = 'status-' . str_replace(' ', '', $order['status']);
                        $bEngagedLink = htmlspecialchars($order['b_engaged_link']);
                        ?>
                        <tr>
                            <td><strong>#<?php echo htmlspecialchars($order['id']); ?></strong></td>

                            <td>
                                <span class="status-badge <?php echo $statusClass; ?>">
                                    <?php echo htmlspecialchars($order['status']); ?>
                                </span>
                            </td>

                            <td>
                                <strong><?php echo htmlspecialchars($order['club_name']); ?></strong><br>
                                <span class="meta-info">Acct:
                                    <?php echo htmlspecialchars($order['club_account_number']); ?></span>
                            </td>

                            <td>
                                <strong><?php echo htmlspecialchars($order['signed_name']); ?></strong><br>
                                <a
                                    href="mailto:<?php echo htmlspecialchars($order['email']); ?>"><?php echo htmlspecialchars($order['email']); ?></a>
                            </td>

                            <td>
                                <strong>Date:</strong> <?php echo htmlspecialchars($order['event_date']); ?><br>
                                <strong>Loc:</strong> <?php echo htmlspecialchars($order['location']); ?><br>
                                <?php if ($bEngagedLink): ?>
                                    <a href="<?php echo $bEngagedLink; ?>" target="_blank" title="View B-Engaged Event">🔗 Event
                                        Link</a>
                                <?php endif; ?>
                            </td>

                            <td>
                                <div><strong>Start:</strong> <?php echo htmlspecialchars($order['start_date']); ?></div>
                                <div><strong>End:</strong> <?php echo htmlspecialchars($order['end_date']); ?></div>
                                <div class="meta-info">Duration: <?php echo htmlspecialchars($order['timespan_description']); ?>
                                </div>
                            </td>

                            <td>
                                <?php if (!empty($order['equipment_items'])): ?>
                                    <div class="equipment-list">
                                        <?php foreach ($order['equipment_items'] as $item): ?>
                                            <div>
                                                • <?php echo htmlspecialchars($item['name']); ?>
                                                <span style="color:#888;">[<?php echo htmlspecialchars($item['status']); ?>]</span>
                                            </div>
                                        <?php endforeach; ?>
                                    </div>
                                <?php else: ?>
                                    <span class="meta-info">No equipment selected</span>
                                <?php endif; ?>
                            </td>

                            <td>
                                <button style="cursor:pointer;"
                                    onclick="alert('Logic to edit order #<?php echo $order['id']; ?> would go here.')">Edit</button>
                            </td>
                        </tr>
                    <?php endforeach; ?>
                </tbody>
            </table>
        </div>
    <?php else: ?>
        <p>No orders found in the database.</p>
    <?php endif; ?>

</body>

</html>