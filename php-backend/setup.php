<?php
// setup.php
// Standalone script to initialize the database
header("Content-Type: text/html; charset=UTF-8");

require_once __DIR__ . '/session.php';
$userRole = $_SESSION['user']['role'] ?? 'unlogged';

if ($userRole !== 'admin') {
    die("
    <!DOCTYPE html>
    <html lang='en'>
    <head>
        <meta charset='UTF-8'>
        <title>Database Setup - Unauthorized</title>
        <style>
            body { font-family: sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; background-color: #f0f2f5; margin: 0; }
            .card { background: white; padding: 2.5rem; border-radius: 8px; box-shadow: 0 8px 16px rgba(0,0,0,0.1); text-align: center; max-width: 500px; }
            h1 { color: #c62828; margin-top: 0; }
            p { color: #555; line-height: 1.5; }
        </style>
    </head>
    <body>
        <div class='card'>
            <h1>Access Denied</h1>
            <p>You must be a verified system administrator to execute raw server database controls.</p>
            <p><strong>Please log into the main Management Dashboard to sync your secure session, then return to this page.</strong></p>
        </div>
    </body>
    </html>
    ");
}

$schema_sql = <<<SQL
SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS order_line_items;
DROP TABLE IF EXISTS equipment;
DROP TABLE IF EXISTS orders;
DROP TABLE IF EXISTS admins;
SET FOREIGN_KEY_CHECKS = 1;

CREATE TABLE IF NOT EXISTS orders (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    club_name VARCHAR(255) NOT NULL,
    signed_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    club_account_number VARCHAR(50),
    event_date DATE NOT NULL,
    location VARCHAR(255) NOT NULL,
    b_engaged_link VARCHAR(512) NOT NULL,
    timespan_description VARCHAR(100) NOT NULL,
    start_date DATETIME NOT NULL,
    end_date DATETIME NOT NULL,
    status ENUM('Pending Approval', 'Approved', 'Completed', 'Denied') DEFAULT 'Pending Approval'
);

CREATE TABLE IF NOT EXISTS equipment (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    current_status ENUM('Available', 'Picked Up', 'In Office - Unavailable') DEFAULT 'Available',
    active_order_id INT UNSIGNED DEFAULT NULL,
    FOREIGN KEY (active_order_id) REFERENCES orders(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS order_line_items (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    order_id INT UNSIGNED NOT NULL,
    equipment_id INT UNSIGNED NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (equipment_id) REFERENCES equipment(id) ON DELETE CASCADE 
);

CREATE TABLE IF NOT EXISTS admins (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE
);
SQL;

$seed_sql = <<<SQL
SET FOREIGN_KEY_CHECKS = 0;
DELETE FROM order_line_items;
DELETE FROM equipment;
DELETE FROM orders;
ALTER TABLE order_line_items AUTO_INCREMENT = 1;
ALTER TABLE equipment AUTO_INCREMENT = 1;
ALTER TABLE orders AUTO_INCREMENT = 1;
SET FOREIGN_KEY_CHECKS = 1;

INSERT INTO orders (id, club_name, signed_name, email, club_account_number, event_date, location, b_engaged_link, timespan_description, start_date, end_date, status)
VALUES 
(2, 'Hiking Club', 'Alex Rivera', 'arivera@example.edu', '00122', '2025-12-15', 'Catskills High Peaks', 'https://bengaged.edu/e/catskills', '3 Days', '2025-12-15 08:00:00', '2025-12-17 17:00:00', 'Approved'),
(3, 'Outdoors Club', 'Brendan Tesone', 'btesone@example.edu', '00452', '2025-12-16', 'Local Park', 'https://bengaged.edu/e/local', 'Day Trip', '2025-12-16 09:00:00', '2025-12-16 18:00:00', 'Approved'),
(4, 'Photography Club', 'Sarah Chen', 'schen@example.edu', '00981', '2025-12-22', 'Nature Preserve', 'https://bengaged.edu/e/photo', 'Full Day', '2025-12-22 07:00:00', '2025-12-22 20:00:00', 'Pending Approval'),
(5, 'Drama Club', 'John Smith', 'jsmith@example.edu', '00333', '2025-12-01', 'Main Stage', 'https://bengaged.edu/e/drama', 'Evening', '2025-12-01 16:00:00', '2025-12-01 23:00:00', 'Completed');

INSERT INTO equipment (id, name, current_status, active_order_id) VALUES 
(1, '2-Person Tent (MSR)', 'Available', NULL),
(2, '2-Person Tent (MSR)', 'Available', NULL),
(3, '4-Person Tent (REI)', 'In Office - Unavailable', NULL),
(4, '4-Person Tent (REI)', 'Picked Up', 2),
(5, 'Sleeping Bag (0°F)', 'Available', NULL),
(6, 'Sleeping Bag (0°F)', 'Available', NULL),
(7, 'Sleeping Bag (20°F)', 'Available', NULL),
(8, 'Sleeping Bag (20°F)', 'Available', NULL),
(9, 'MSR PocketRocket Stove', 'Available', NULL),
(10, 'Bear Canister (Large)', 'Picked Up', 2),
(11, 'Bear Canister (Small)', 'Available', NULL),
(12, 'Bear Canister (Small)', 'Available', NULL),
(13, 'Black Diamond Headlamp', 'Available', NULL),
(14, 'Black Diamond Headlamp', 'Available', NULL),
(15, 'External Frame Pack', 'In Office - Unavailable', NULL),
(16, 'Propane Lantern', 'Available', NULL),
(17, 'Water Filter (Katadyn)', 'Available', NULL),
(18, 'First Aid Kit (Large)', 'Picked Up', 3),
(19, 'Climbing Rope (60m)', 'Available', NULL),
(20, 'Climbing Helmet', 'Available', NULL);

INSERT INTO order_line_items (order_id, equipment_id) VALUES 
(2, 4), (2, 10), (2, 5), (2, 9), 
(3, 18), (3, 13), 
(4, 1), (4, 14), 
(5, 16);
SQL;

// Using HEREDOC for stored procedures, separated by our custom delimiter convention "||||" for splitting in PHP
// NOTE: I am removing the 'DELIMITER //' lines and just having the create statements.
// I will split them by 'END //' or just use a custom separator here relative to the PHP processing.
// Actually, simple way: Put each SP in a separate variable or array.

$procs = [];

$procs[] = "DROP PROCEDURE IF EXISTS sp_AddEquipment";
$procs[] = "CREATE PROCEDURE sp_AddEquipment(IN p_name VARCHAR(255), IN p_status VARCHAR(50))
BEGIN
    IF p_status = 'Picked Up' THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Initial status must be In Office or Available';
    ELSE
    INSERT INTO equipment (name, current_status) VALUES (p_name, p_status);
    END IF;
END";

$procs[] = "DROP PROCEDURE IF EXISTS sp_DeleteEquipment";
$procs[] = "CREATE PROCEDURE sp_DeleteEquipment(IN p_equipment_id INT UNSIGNED)
BEGIN
    DECLARE v_current_status VARCHAR(50);
    SELECT current_status INTO v_current_status 
    FROM equipment WHERE id = p_equipment_id;
    IF v_current_status IS NULL THEN
         SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Error: Equipment not found';
    END IF;
    IF v_current_status = 'Picked Up' THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Error: Cannot delete equipment that is currently Picked Up';
    ELSE
        DELETE FROM equipment WHERE id = p_equipment_id;
    END IF;
END";

$procs[] = "DROP PROCEDURE IF EXISTS sp_CreateOrder";
$procs[] = "CREATE PROCEDURE sp_CreateOrder(
    IN p_club_name VARCHAR(255),
    IN p_signed_name VARCHAR(255),
    IN p_email VARCHAR(255),
    IN p_account VARCHAR(50),
    IN p_event_date DATE,
    IN p_loc VARCHAR(255),
    IN p_link VARCHAR(512),
    IN p_timespan VARCHAR(100),
    IN p_start DATETIME,
    IN p_end DATETIME,
    IN p_equipment_ids TEXT
)
BEGIN
    DECLARE v_comma_pos INT;
    DECLARE v_id_str VARCHAR(255);
    DECLARE v_new_order_id INT;
    DECLARE v_conflict_count INT;
    DECLARE v_parse_str TEXT;
    
    DECLARE exit handler for sqlexception
    BEGIN
        ROLLBACK;
        DROP TEMPORARY TABLE IF EXISTS temp_req_ids;
        RESIGNAL;
    END;

    CREATE TEMPORARY TABLE IF NOT EXISTS temp_req_ids (equip_id INT UNSIGNED);
    TRUNCATE TABLE temp_req_ids;

    SET v_parse_str = CONCAT(p_equipment_ids, ',');
    
    WHILE LENGTH(v_parse_str) > 0 DO
        SET v_comma_pos = LOCATE(',', v_parse_str);
        IF v_comma_pos > 0 THEN
            SET v_id_str = SUBSTRING(v_parse_str, 1, v_comma_pos - 1);
            IF LENGTH(TRIM(v_id_str)) > 0 THEN
                INSERT INTO temp_req_ids (equip_id) VALUES (CAST(v_id_str AS UNSIGNED));
            END IF;
            SET v_parse_str = SUBSTRING(v_parse_str, v_comma_pos + 1);
        ELSE
            SET v_parse_str = '';
        END IF;
    END WHILE;

    START TRANSACTION;
        IF WEEKDAY(p_start) > 4 OR WEEKDAY(p_end) > 4 THEN
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Error: Weekend Selection Not Allowed for Pickup/Dropoff (Must be Mon-Fri)';
        END IF;

        SELECT COUNT(*) INTO v_conflict_count
        FROM temp_req_ids t
        JOIN order_line_items oli ON t.equip_id = oli.equipment_id
        JOIN orders o ON oli.order_id = o.id
        WHERE o.status != 'Denied'
        AND o.start_date < p_end 
        AND o.end_date > p_start;
        
        IF v_conflict_count > 0 THEN
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Error: One or more requested items are unavailable (overlapping existing orders)';
        END IF;
        
        INSERT INTO orders (club_name, signed_name, email, club_account_number, event_date, location, b_engaged_link, timespan_description, start_date, end_date)
        VALUES (p_club_name, p_signed_name, p_email, p_account, p_event_date, p_loc, p_link, p_timespan, p_start, p_end);
        
        SET v_new_order_id = LAST_INSERT_ID();
        
        INSERT INTO order_line_items (order_id, equipment_id)
        SELECT v_new_order_id, equip_id FROM temp_req_ids;
        
    COMMIT;
    
    DROP TEMPORARY TABLE IF EXISTS temp_req_ids;
END";

$procs[] = "DROP PROCEDURE IF EXISTS sp_UpdateOrderTimes";
$procs[] = "CREATE PROCEDURE sp_UpdateOrderTimes(
    IN p_order_id INT UNSIGNED,
    IN p_new_start DATETIME,
    IN p_new_end DATETIME
)
BEGIN
    DECLARE v_current_status VARCHAR(50);
    DECLARE v_conflict_count INT;

    DECLARE exit handler for sqlexception
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;

    START TRANSACTION;

        SELECT status INTO v_current_status FROM orders WHERE id = p_order_id FOR UPDATE;
        
        IF v_current_status IS NULL THEN
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Error: Order not found';
        END IF;

        IF v_current_status = 'Completed' THEN
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Error: Cannot modify times for a Completed order';
        END IF;

        IF WEEKDAY(p_new_start) > 4 OR WEEKDAY(p_new_end) > 4 THEN
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Error: Weekend Selection Not Allowed (Must be Mon-Fri)';
        END IF;

        SELECT COUNT(*) INTO v_conflict_count
        FROM order_line_items oli_this
        JOIN order_line_items oli_other ON oli_this.equipment_id = oli_other.equipment_id
        JOIN orders o_other ON oli_other.order_id = o_other.id
        WHERE oli_this.order_id = p_order_id
        AND o_other.id != p_order_id
        AND o_other.status != 'Denied'
        AND o_other.start_date < p_new_end 
        AND o_other.end_date > p_new_start;

        IF v_conflict_count > 0 THEN
             SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Error: Rescheduling causes equipment conflict with existing orders';
        END IF;

        UPDATE orders 
        SET start_date = p_new_start, end_date = p_new_end
        WHERE id = p_order_id;

    COMMIT;
END";

$procs[] = "DROP PROCEDURE IF EXISTS sp_UpdateOrderStatus";
$procs[] = "CREATE PROCEDURE sp_UpdateOrderStatus(
    IN p_order_id INT UNSIGNED,
    IN p_new_status VARCHAR(50)
)
BEGIN
    DECLARE exit handler for sqlexception
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;

    START TRANSACTION;

        IF p_new_status = 'Pending Approval' THEN
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Error: Cannot manually revert status to Pending Approval';
        END IF;

        UPDATE orders SET status = p_new_status WHERE id = p_order_id;
        
        IF p_new_status = 'Completed' THEN
            UPDATE equipment e
            JOIN order_line_items oli ON e.id = oli.equipment_id
            SET e.current_status = 'Available', e.active_order_id = NULL
            WHERE oli.order_id = p_order_id;
        END IF;

    COMMIT;
END";

$procs[] = "DROP PROCEDURE IF EXISTS sp_AddOrderEquipment";
$procs[] = "CREATE PROCEDURE sp_AddOrderEquipment(
    IN p_order_id INT UNSIGNED,
    IN p_equipment_id INT UNSIGNED
)
BEGIN
    DECLARE v_start DATETIME;
    DECLARE v_end DATETIME;
    DECLARE v_status VARCHAR(50);
    DECLARE v_conflict_count INT;
    
    DECLARE exit handler for sqlexception
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;

    START TRANSACTION;
        
        SELECT start_date, end_date, status INTO v_start, v_end, v_status
        FROM orders WHERE id = p_order_id FOR UPDATE;
        
        IF v_start IS NULL THEN
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Error: Order not found';
        END IF;

        IF v_status = 'Completed' THEN
             SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Error: Cannot add equipment to a Completed order';
        END IF;

        SELECT COUNT(*) INTO v_conflict_count
        FROM order_line_items oli
        JOIN orders o ON oli.order_id = o.id
        WHERE oli.equipment_id = p_equipment_id
        AND o.id != p_order_id
        AND o.status != 'Denied' 
        AND o.start_date < v_end 
        AND o.end_date > v_start;
        
        IF v_conflict_count > 0 THEN
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Error: Item is unavailable during this time overlap';
        END IF;

        IF EXISTS (SELECT 1 FROM order_line_items WHERE order_id = p_order_id AND equipment_id = p_equipment_id) THEN
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Error: Item is already part of this order';
        END IF;

        INSERT INTO order_line_items (order_id, equipment_id)
        VALUES (p_order_id, p_equipment_id);

    COMMIT;
END";

$procs[] = "DROP PROCEDURE IF EXISTS sp_RemoveOrderEquipment";
$procs[] = "CREATE PROCEDURE sp_RemoveOrderEquipment(
    IN p_order_id INT UNSIGNED,
    IN p_equipment_id INT UNSIGNED
)
BEGIN
    DECLARE v_status VARCHAR(50);
    
    DECLARE exit handler for sqlexception
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;

    START TRANSACTION;
        
        SELECT status INTO v_status FROM orders WHERE id = p_order_id FOR UPDATE;
        
        IF v_status IS NULL THEN
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Error: Order not found';
        END IF;

        IF v_status = 'Completed' THEN
             SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Error: Cannot remove equipment from a Completed order';
        END IF;

        DELETE FROM order_line_items 
        WHERE order_id = p_order_id 
        AND equipment_id = p_equipment_id;

    COMMIT;
END";

$procs[] = "DROP PROCEDURE IF EXISTS sp_ProcessEquipmentCheckOut";
$procs[] = "CREATE PROCEDURE sp_ProcessEquipmentCheckOut(
    IN p_equipment_id INT UNSIGNED,
    IN p_order_id INT UNSIGNED
)
BEGIN
    DECLARE v_order_status VARCHAR(50);
    
    SELECT status INTO v_order_status FROM orders WHERE id = p_order_id;
    
    IF v_order_status IS NULL THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Error: Order not found';
    END IF;
    
    IF v_order_status != 'Approved' THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Error: Cannot check out equipment for an order that is not Approved';
    END IF;

    UPDATE equipment
    SET current_status = 'Picked Up',
        active_order_id = p_order_id
    WHERE id = p_equipment_id;
END";

$procs[] = "DROP PROCEDURE IF EXISTS sp_ProcessEquipmentCheckIn";
$procs[] = "CREATE PROCEDURE sp_ProcessEquipmentCheckIn(
    IN p_equipment_id INT UNSIGNED
)
BEGIN
    UPDATE equipment
    SET current_status = 'Available',
        active_order_id = NULL
    WHERE id = p_equipment_id;
END";

$procs[] = "DROP PROCEDURE IF EXISTS sp_MarkItemUnavailable";
$procs[] = "CREATE PROCEDURE sp_MarkItemUnavailable(
    IN p_equipment_id INT UNSIGNED
)
BEGIN
    UPDATE equipment
    SET current_status = 'In Office - Unavailable',
        active_order_id = NULL
    WHERE id = p_equipment_id;
END";

$procs[] = "DROP PROCEDURE IF EXISTS sp_BulkOrderCheckIn";
$procs[] = "CREATE PROCEDURE sp_BulkOrderCheckIn(
    IN p_order_id INT UNSIGNED
)
BEGIN
    IF EXISTS (
        SELECT 1 FROM equipment e
        JOIN order_line_items oli ON e.id = oli.equipment_id
        WHERE oli.order_id = p_order_id
        AND (
            e.current_status = 'In Office - Unavailable'
            OR (e.current_status = 'Picked Up' AND e.active_order_id != p_order_id)
        )
    ) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Error: Cannot bulk check-in. Some items are unavailable or belong to another order.';
    END IF;

    UPDATE equipment e
    JOIN order_line_items oli ON e.id = oli.equipment_id
    SET e.current_status = 'Available', 
        e.active_order_id = NULL
    WHERE oli.order_id = p_order_id;
END";

$procs[] = "DROP PROCEDURE IF EXISTS sp_BulkOrderCheckOut";
$procs[] = "CREATE PROCEDURE sp_BulkOrderCheckOut(
    IN p_order_id INT UNSIGNED
)
BEGIN
    DECLARE v_status VARCHAR(50);
    
    SELECT status INTO v_status FROM orders WHERE id = p_order_id;
    IF v_status IS NULL THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Error: Order not found';
    ELSEIF v_status != 'Approved' THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Error: Only Approved orders can be checked out';
    END IF;

    IF EXISTS (
        SELECT 1 FROM equipment e
        JOIN order_line_items oli ON e.id = oli.equipment_id
        WHERE oli.order_id = p_order_id
        AND (
            e.current_status = 'In Office - Unavailable'
            OR (e.current_status = 'Picked Up' AND e.active_order_id != p_order_id)
        )
    ) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Error: Cannot bulk checkout. Some items are unavailable or checked out to another club.';
    END IF;

    UPDATE equipment e
    JOIN order_line_items oli ON e.id = oli.equipment_id
    SET e.current_status = 'Picked Up', 
        e.active_order_id = p_order_id
    WHERE oli.order_id = p_order_id;
END";

$procs[] = "DROP PROCEDURE IF EXISTS sp_GetAdminData";
$procs[] = "CREATE PROCEDURE sp_GetAdminData()
BEGIN
    SELECT id, name, current_status, active_order_id FROM equipment;

    SELECT 
        o.id AS order_id,
        o.club_name,
        o.signed_name,
        o.email,
        o.club_account_number,
        o.event_date,
        o.location,
        o.b_engaged_link,
        o.timespan_description,
        DATE_FORMAT(o.start_date, '%Y-%m-%d %H:%i:%s') as start_date,
        DATE_FORMAT(o.end_date, '%Y-%m-%d %H:%i:%s') as end_date,
        o.status,
        e.id AS equipment_id,
        e.name AS equipment_name,
        e.current_status AS equipment_status
    FROM orders o
    LEFT JOIN order_line_items oli ON o.id = oli.order_id
    LEFT JOIN equipment e ON oli.equipment_id = e.id
    ORDER BY o.id;
END";

$procs[] = "DROP PROCEDURE IF EXISTS sp_AddAdmin";
$procs[] = "CREATE PROCEDURE sp_AddAdmin(IN p_email VARCHAR(255))
BEGIN
    INSERT INTO admins (email) VALUES (p_email);
END";

$procs[] = "DROP PROCEDURE IF EXISTS sp_RemoveAdmin";
$procs[] = "CREATE PROCEDURE sp_RemoveAdmin(IN p_email VARCHAR(255))
BEGIN
    DELETE FROM admins WHERE email = p_email;
END";

$procs[] = "DROP PROCEDURE IF EXISTS sp_GetAdmins";
$procs[] = "CREATE PROCEDURE sp_GetAdmins()
BEGIN
    SELECT id, email FROM admins;
END";


// --- Logic ---
$message = "";
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    require 'database.php';

    try {
        // 1. Run Schema
        $stmts = array_filter(array_map('trim', explode(';', $schema_sql)));
        foreach ($stmts as $stmt) {
            if (!empty($stmt))
                $pdo->exec($stmt);
        }
        $message .= "Tables created.<br>";

        // 2. Run Seed
        $stmts = array_filter(array_map('trim', explode(';', $seed_sql)));
        foreach ($stmts as $stmt) {
            if (!empty($stmt))
                $pdo->exec($stmt);
        }
        $message .= "Data seeded.<br>";

        // 3. Add Admins
        $admins = ['evp@binghamtonsa.org', 'equipment@binghamtonsa.org'];
        foreach ($admins as $admin_email) {
            // Check if exists first to avoid dupes if run multiple times (though seed clears it usually? No seed clears orders, not admins... wait check seed)
            // Seed does not clear admins table based on file content. Schema creates it.
            // Let's just insert ignore
            $stmt = $pdo->prepare("INSERT IGNORE INTO admins (email) VALUES (?)");
            $stmt->execute([$admin_email]);
        }
        $message .= "Admins added.<br>";

        // 4. Run Stored Procs
        foreach ($procs as $proc_sql) {
            if (!empty($proc_sql))
                $pdo->exec($proc_sql);
        }
        $message .= "Stored Procedures created.<br>";

        $message = "<div style='color: green; font-weight: bold;'>SUCCESS: " . $message . "</div>";

    } catch (PDOException $e) {
        $message = "<div style='color: red; font-weight: bold;'>ERROR: " . $e->getMessage() . "</div>";
    }
}

?>
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <title>Database Setup</title>
    <style>
        body {
            font-family: sans-serif;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            background-color: #f0f2f5;
            margin: 0;
        }

        .card {
            background: white;
            padding: 2rem;
            border-radius: 8px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            text-align: center;
        }

        button {
            background-color: #005a43;
            color: white;
            border: none;
            padding: 10px 20px;
            font-size: 16px;
            border-radius: 4px;
            cursor: pointer;
            transition: background 0.3s;
        }

        button:hover {
            background-color: #004432;
        }

        .message {
            margin-top: 1rem;
        }
    </style>
</head>

<body>
    <div class="card">
        <h1>Database Setup</h1>
        <p>Initialize the database schema, data, and stored procedures.</p>
        <form method="POST">
            <button type="submit">Install Database</button>
        </form>
        <div class="message">
            <?php echo $message; ?>
        </div>
    </div>
</body>

</html>