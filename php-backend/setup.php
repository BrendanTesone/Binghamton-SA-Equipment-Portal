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

CREATE TABLE IF NOT EXISTS club_accounts (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    club_name VARCHAR(255) NOT NULL UNIQUE,
    account_number VARCHAR(50) NOT NULL
);
SQL;

$seed_sql = <<<SQL
SET FOREIGN_KEY_CHECKS = 0;
DELETE FROM order_line_items;
DELETE FROM equipment;
DELETE FROM orders;
DELETE FROM club_accounts;
ALTER TABLE order_line_items AUTO_INCREMENT = 1;
ALTER TABLE equipment AUTO_INCREMENT = 1;
ALTER TABLE orders AUTO_INCREMENT = 1;
ALTER TABLE club_accounts AUTO_INCREMENT = 1;
SET FOREIGN_KEY_CHECKS = 1;
SQL;

/*
INSERT INTO orders (id, club_name, signed_name, email, club_account_number, event_date, location, b_engaged_link, timespan_description, start_date, end_date, status)
VALUES 
(2, 'Example Club', 'Alex Rivera', 'arivera@example.edu', '00122', '2025-12-15', 'Catskills High Peaks', 'https://bengaged.edu/e/catskills', '3 Days', '2025-12-15 08:00:00', '2025-12-17 17:00:00', 'Approved'),
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
*/

// Using HEREDOC for stored procedures, separated by our custom delimiter convention "||||" for splitting in PHP
// NOTE: I am removing the 'DELIMITER //' lines and just having the create statements.
// I will split them by 'END //' or just use a custom separator here relative to the PHP processing.
// Actually, simple way: Put each SP in a separate variable or array.

$procs = [];

$procs[] = "DROP PROCEDURE IF EXISTS sp_AddEquipment";
$procs[] = "CREATE PROCEDURE sp_AddEquipment(IN p_name VARCHAR(255), IN p_status VARCHAR(50))
BEGIN
    IF TRIM(p_name) = '' THEN
        SIGNAL SQLSTATE '45000' 
        SET MESSAGE_TEXT = 'Error: Equipment name cannot be empty';
    END IF;
    
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

    DECLARE exit handler for sqlexception
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;

    START TRANSACTION;
        
        -- Lock the row to prevent another user from checking it out at this exact millisecond
        SELECT current_status INTO v_current_status 
        FROM equipment 
        WHERE id = p_equipment_id FOR UPDATE;
        
        IF v_current_status IS NULL THEN
             SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Error: Equipment not found';
        END IF;
        
        -- Enforce your original rule: don't delete if it's physically out of the office
        IF v_current_status = 'Picked Up' THEN
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Error: Cannot delete equipment that is currently Picked Up';
        END IF;

        -- Execute the deletion (this will CASCADE and wipe it from all pending, approved, and completed orders)
        DELETE FROM equipment WHERE id = p_equipment_id;
        
    COMMIT;
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
    DECLARE v_req_count INT DEFAULT 0;
    DECLARE v_locked_count INT;
    DECLARE v_parse_str TEXT;
    
    -- Graceful error handling
    DECLARE exit handler for sqlexception
    BEGIN
        ROLLBACK;
        DROP TEMPORARY TABLE IF EXISTS temp_req_ids;
        RESIGNAL;
    END;

    -- Basic timeline validation
    IF p_start >= p_end THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Error: Start time must be before end time';
    END IF;

    IF WEEKDAY(p_start) > 4 OR WEEKDAY(p_end) > 4 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Error: Weekend Selection Not Allowed for Pickup/Dropoff (Must be Mon-Fri)';
    END IF;

    -- Parse CSV of IDs into temporary table
    CREATE TEMPORARY TABLE IF NOT EXISTS temp_req_ids (equip_id INT UNSIGNED);
    TRUNCATE TABLE temp_req_ids;

    SET v_parse_str = CONCAT(p_equipment_ids, ',');
    
    WHILE LENGTH(v_parse_str) > 0 DO
        SET v_comma_pos = LOCATE(',', v_parse_str);
        IF v_comma_pos > 0 THEN
            SET v_id_str = SUBSTRING(v_parse_str, 1, v_comma_pos - 1);
            IF LENGTH(TRIM(v_id_str)) > 0 THEN
                INSERT INTO temp_req_ids (equip_id) VALUES (CAST(v_id_str AS UNSIGNED));
                SET v_req_count = v_req_count + 1;
            END IF;
            SET v_parse_str = SUBSTRING(v_parse_str, v_comma_pos + 1);
        ELSE
            SET v_parse_str = '';
        END IF;
    END WHILE;

    IF v_req_count = 0 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Error: No valid equipment IDs provided';
    END IF;

    START TRANSACTION;
        
        -- 1. CONCURRENCY FIX: Lock the equipment rows FIRST.
        -- If another transaction is currently booking any of these items, 
        -- this statement will pause and wait for the other to finish.
        SELECT COUNT(*) INTO v_locked_count 
        FROM equipment 
        WHERE id IN (SELECT equip_id FROM temp_req_ids) 
        FOR UPDATE;
        
        -- Validate all requested IDs actually exist in the database
        IF v_locked_count != v_req_count THEN
             SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Error: One or more requested equipment items do not exist';
        END IF;

        -- 2. Verify none of the items are disabled by the admin
        SELECT COUNT(*) INTO v_conflict_count
        FROM equipment 
        WHERE id IN (SELECT equip_id FROM temp_req_ids) 
        AND current_status = 'In Office - Unavailable';

        IF v_conflict_count > 0 THEN
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Error: One or more requested items are marked as Unavailable by administrators';
        END IF;

        -- 3. Now that the rows are locked, safely check for calendar conflicts
        SELECT COUNT(*) INTO v_conflict_count
        FROM temp_req_ids t
        JOIN order_line_items oli ON t.equip_id = oli.equipment_id
        JOIN orders o ON oli.order_id = o.id
        WHERE o.status NOT IN ('Denied', 'Completed')
        AND o.start_date < p_end 
        AND o.end_date > p_start;
        
        IF v_conflict_count > 0 THEN
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Error: One or more requested items are unavailable (overlapping existing orders)';
        END IF;
        
        -- 4. Proceed with insertion
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

    DECLARE exit handler for sqlexception
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;

    -- Basic timeline validation
    IF p_new_start >= p_new_end THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Error: Start time must be before end time';
    END IF;

    IF WEEKDAY(p_new_start) > 4 OR WEEKDAY(p_new_end) > 4 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Error: Weekend Selection Not Allowed (Must be Mon-Fri)';
    END IF;

    START TRANSACTION;

        -- 1. Lock the order itself to prevent concurrent edits to this specific order
        SELECT status INTO v_current_status 
        FROM orders 
        WHERE id = p_order_id FOR UPDATE;
        
        IF v_current_status IS NULL THEN
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Error: Order not found';
        END IF;

        IF v_current_status = 'Completed' THEN
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Error: Cannot modify times for a Completed order';
        END IF;

        -- 2. Update the times
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
    DECLARE v_current_status VARCHAR(50);

    DECLARE exit handler for sqlexception
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;

    -- 1. Positive Validation: Only allow specific ENUM values
    IF p_new_status NOT IN ('Approved', 'Completed', 'Denied') THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Error: Invalid status. Must be Approved, Completed, or Denied';
    END IF;

    START TRANSACTION;

        -- 2. Lock the order and check its current state
        SELECT status INTO v_current_status FROM orders WHERE id = p_order_id FOR UPDATE;
        
        IF v_current_status IS NULL THEN
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Error: Order not found';
        END IF;

        IF v_current_status = p_new_status THEN
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Error: Order is already in this status';
        END IF;

        -- 3. Perform the update
        UPDATE orders SET status = p_new_status WHERE id = p_order_id;
        
        -- 4. Release equipment holds if the order is closing out (Completed OR Denied)
        IF p_new_status IN ('Completed', 'Denied') THEN
            UPDATE equipment e
            JOIN order_line_items oli ON e.id = oli.equipment_id
            SET 
                -- Only revert 'Picked Up' to 'Available'. If an admin already marked 
                -- it 'In Office - Unavailable' due to damage, preserve that status.
                e.current_status = CASE 
                    WHEN e.current_status = 'Picked Up' THEN 'Available' 
                    ELSE e.current_status 
                END,
                e.active_order_id = NULL
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
        e.current_status AS equipment_status,
        e.active_order_id AS equipment_active_order_id
    FROM orders o
    LEFT JOIN order_line_items oli ON o.id = oli.order_id
    LEFT JOIN equipment e ON oli.equipment_id = e.id
    ORDER BY o.id;
END";

$procs[] = "DROP PROCEDURE IF EXISTS sp_AddAdmin";
$procs[] = "CREATE PROCEDURE sp_AddAdmin(IN p_email VARCHAR(255))
BEGIN
    -- Prevent duplicate entries gracefully
    IF EXISTS (SELECT 1 FROM admins WHERE email = p_email) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Error: Admin already exists';
    ELSE
        INSERT INTO admins (email) VALUES (p_email);
    END IF;
END";

$procs[] = "DROP PROCEDURE IF EXISTS sp_RemoveAdmin";
$procs[] = "CREATE PROCEDURE sp_RemoveAdmin(IN p_email VARCHAR(255))
BEGIN
    DECLARE v_admin_count INT;

    -- 1. Ensure the admin actually exists
    IF NOT EXISTS (SELECT 1 FROM admins WHERE email = p_email) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Error: Admin not found';
    END IF;

    -- 2. SECURITY: Prevent removing the very last admin
    SELECT COUNT(*) INTO v_admin_count FROM admins;
    
    IF v_admin_count <= 1 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Error: Cannot remove the last remaining admin system-wide';
    ELSE
        -- 3. Safe to delete
        DELETE FROM admins WHERE email = p_email;
    END IF;
END";

$procs[] = "DROP PROCEDURE IF EXISTS sp_GetAdmins";
$procs[] = "CREATE PROCEDURE sp_GetAdmins()
BEGIN
    SELECT id, email FROM admins;
END";

$procs[] = "DROP PROCEDURE IF EXISTS sp_GetClubAccounts";
$procs[] = "CREATE PROCEDURE sp_GetClubAccounts()
BEGIN
    SELECT id, club_name, account_number FROM club_accounts ORDER BY club_name ASC;
END";

$procs[] = "DROP PROCEDURE IF EXISTS sp_AddClubAccount";
$procs[] = "CREATE PROCEDURE sp_AddClubAccount(
    IN p_club_name VARCHAR(255),
    IN p_account_number VARCHAR(50)
)
BEGIN
    IF TRIM(p_club_name) = '' OR TRIM(p_account_number) = '' THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Error: Club name and account number cannot be empty';
    END IF;

    INSERT INTO club_accounts (club_name, account_number)
    VALUES (TRIM(p_club_name), TRIM(p_account_number))
    ON DUPLICATE KEY UPDATE account_number = TRIM(p_account_number);
END";

$procs[] = "DROP PROCEDURE IF EXISTS sp_DeleteClubAccount";
$procs[] = "CREATE PROCEDURE sp_DeleteClubAccount(IN p_id INT UNSIGNED)
BEGIN
    IF NOT EXISTS (SELECT 1 FROM club_accounts WHERE id = p_id) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Error: Club account mapping not found';
    END IF;

    DELETE FROM club_accounts WHERE id = p_id;
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
        $admins = ['evp@binghamtonsa.org', 'equipment@binghamtonsa.org','btesone@binghamton.edu','getinvolved@binghamtonsa.org','oharvey@binghamton.edu','vpf@binghamtonsa.org'];
        foreach ($admins as $admin_email) {
            // Check if exists first to avoid dupes if run multiple times (though seed clears it usually? No seed clears orders, not admins... wait check seed)
            // Seed does not clear admins table based on file content. Schema creates it.
            // Let's just insert ignore
            $stmt = $pdo->prepare("INSERT IGNORE INTO admins (email) VALUES (?)");
            $stmt->execute([$admin_email]);
        }
        $message .= "Admins added.<br>";

        // 3b. Seed Club Accounts if empty
        $club_count_stmt = $pdo->query("SELECT COUNT(*) FROM club_accounts");
        if ($club_count_stmt->fetchColumn() == 0) {
            $clubs_file = __DIR__ . '/clubs_seed.json';
            $initial_clubs = [];
            if (file_exists($clubs_file)) {
                $initial_clubs = json_decode(file_get_contents($clubs_file), true);
            }
            if (empty($initial_clubs)) {
                $clubs_json = <<<'JSON'
[["Accounting Association","4840"],["ACS - Relay for Life Event Fund (CAC)","9880"],["Active Minds","8345"],["Actuarial Association","6990"],["African Student Organization (ASO)","4660"],["Aiding Hearts (BAH)","4065"],["Albanian Student Association (ASA)","5335"],["Alzheimer's Foundation of America On Campus","4675"],["American Cancer Society On Campus (ACS)","5970"],["American Medical Women's Association (AMWA)","8235"],["American Parliamentary Debate Association (BAPDA)","8455"],["American Red Cross Club","6360"],["American Sign Language Club (ASL)","8355"],["American Society of Mechanical Engineering (ASME)","4060"],["Anime Club","4060"],["APICS - Association for Operations Mgmt","5779"],["Arab Cultural Student Association (ACSA)","4155"],["Art Club","4080"],["Art Co-op","4650"],["Asian Pacific American Medical Student Association","4825"],["Association for Applied Behavioral Sciences - AABS","4025"],["Association for Women in Mathematics (AWM)","4787"],["Association of Latino Professionals in Finance and Accounting (ALPFA)","5740"],["Astronomy Club","5745"],["ASU - Asian Outlook - Asian Student Union","6150A"],["ASU - Binghamton University Japanese Association - Asian Student Union (BUJA)","6150B"],["ASU - Chinese American Student Union - Asian Student Union (CASU)","6150C"],["ASU - Korean American Student Association - Asian Student Union (KASA)","6150D"],["ASU - Philippine-American League - Asian Student Union (PAL)","6150E"],["ASU - Primary - Asian Student Union","6150"],["ASU - Taiwanese American Student Coalition - Asian Student Union (TASC)","6150F"],["ASU - Vietnamese Student Association - Asian Student Union (VSA)","6150G"],["Audubon Society","5075"],["Automotive Enthusiasts Club","5088"],["Bake Back America","6185"],["Ballroom Dance Association (BDA)","4250"],["Bangali Student Assoc (BSA)","4255"],["BEAM","5625"],["Best Buddies","4395"],["Bhangra","5060"],["Bicycle Co-op","5085"],["Bing Real Estate (BRES)","4630"],["Bing Swifties","5325"],["Binghamton Abortion Advocacy Coalition (BAAC)","5450"],["Binghamton Association for Transfer Students (BATS)","4085"],["Binghamton Buddies","5515"],["Binghamton e-NABLE","4970"],["Binghamton Poetry Club (Slam Poetry)","8105"],["Binghamton Review","6860"],["Binghamton Sound Stage & Lighting (BSSL)","7400"],["Binghamton Tech Collective (BTC) (merged with PMDP)","6560"],["Binghamton University Bees","6155"],["Binghamton University Times Tribune (BUTT)","8415"],["Binghamton Up-cycle (BUP)","5040"],["Binghamtonics","7130"],["Biochemistry Club","5260"],["Biological Science Club","8145"],["Biomedical Engineering Society (BMES)","4235"],["Black Dance Repertoire (BDR)","4000"],["Black Student Union (BSU)","4040"],["Board Game Group (BGG)","5280"],["Bookworms (The)","8370"],["Bowling Club","6335"],["Boys and Girls Club Mentors (BGCM)","7930"],["Brazilian and Portuguese Student Association (BAPSA)","5654"],["BU Association of Mixed Students (BAMS)","7610"],["BU Bouncers","6162"],["BU Science","8375"],["Business Fashion Society (BUBFS)","6160"],["Campus Survival Games (CSG)","4770"],["Candela: Latin Dance Club","4925"],["Candid Photography Club","4320"],["Caribbean Student Association","4700"],["Casino in the Woods Committee","5550"],["Chabad","5650"],["Change of Tone","6145"],["Charles Drew Minority Pre-Health Society","6190"],["Cheese Club","6180"],["Chess Club","6530"],["China Care Club (BCCC)","8300"],["Chinascope","7090"],["Chinese Christian Fellowship (CCF)","6170"],["Circle K","4200"],["Citizens' Climate Lobby (CCL)","5265"],["Club Sports","7570"],["Collectible Card Game Association (CCGA)","6390"],["College Democrats","6590"],["College In The Woods Council (CIW)","4530"],["College Republicans","5410"],["ColorStack BU","4705"],["Comic Book Club","8155"],["Consult Your Community (CYC)","4215"],["Corazoncitos","8420"],["Crosbys","4030"],["Dickinson Community Players (DCP)","7970"],["Dickinson Town Council (DTC)","4590"],["Disabled Student Union (DSU)","6370"],["Dominican Student Association (DSA)","7283"],["DOVE","8472"],["Economics Club","7140"],["Education Club","8150"],["EndAlz","5032"],["Entrepreneur Connect","5045"],["Environmental CHANGE","6240"],["ESCAPE Bus Company","4210"],["Evolution Dance Company (EDC)","5240"],["Evolutionary Studies Student Association","8335"],["Explorchestra ","4260"],["Feminist Collective (FemCo)","4490"],["Film and Production Society (FPS) (BTV6)","4810"],["Finance Society","6440"],["Financial Literacy for the Youth (FLY)","8352"],["Food Co-Op","7160"],["Food Recovery Network (FRN)","7230"],["Free Press (Media Group)","5200"],["Friends of MSF at Binghamton University","6855"],["Fujianese Union (FJU)","7105"],["Gardening Club","4505"],["Gift of Life","5225"],["Global Medical Missions Alliance (GMMA)","7665"],["Guitar Club","6880"],["Habitat For Humanity","6110"],["Haitian Student Association (HASA)","6840"],["Happy Medium","4875"],["Happy Medium subgroup: Summit on Student Political Engagement ","4875A"],["Harpur Harpeggios (pegs)","4100"],["Harpur's Ferry Student Volunteer Ambulance","4160"],["Hellenic Cultural Society (HCS)","4620"],["Henna Club","5854"],["Hillel-Jewish Student Union","4300"],["Hillside Village Council (HVC)","7380"],["Hindu Student Council (HSC)","4360"],["Hinman College Council (HCC)","4540"],["Hinman Production Company (HPC)","8315"],["History Club","4765"],["Hong Kong Exchange Square (HKES)","4780"],["Human Development Association (HDev)","5020"],["Ice Skating Club (BISC)","7175"],["Imagination Craft Works (ICW)","5470"],["Indian InternationaI Student Union (IISU)","6250"],["Informations Systems Club ","6310"],["Institute of Electrical and Electronics Engineers (IEEE)","6610"],["Interdisciplinary Research Club","5420"],["Intervarsity Christian Fellowship (IVCF)","5670"],["Intramural Freestyle Dancers (IFD)","6720"],["Intramural Sports","6070"],["Italian Student Organization (ISO)","6715"],["Juvenile Urban Multicultural Program (JUMP)","7480"],["KnitWits","7270"],["Korean American Christian Fellowship (KACF)","5320"],["Korean International Students Association (KISA)","5125"],["Korean Pop Music Club (Kpop)","6235"],["LACASA (The Central American Student Association)","5724"],["Latin American Student Union (LASU)","4220"],["Law Quarterly (BLQ)","7100"],["Mafia Club","5775"],["MajorNoir","5277"],["Management Consulting Group (MCG)","8245"],["Marine Science Club","4396"],["Marketing and Publicity Department (MAP)","9700"],["Marketing Association (BUMA)","8135"],["Mary E. Mahoney Nursing Support Group (MEM)","6510"],["MASTI","5140"],["Math Club","6260"],["Matryoshka Club","5034"],["Mechanical Contractors Association of America (MCAA)","8490"],["Medical Research Interest Club (MRIC)","5130"],["Medical Roots Project","8202"],["MEDLIFE","8435"],["Men of Color Scholastic Society (MOCS2)","8140"],["Meor","5950"],["Microbiology Club","5955"],["Minecraft Club","4755"],["Mock Trial Association","4050"],["Model United Nations Team (Model UN)","5810"],["Moot Court","6118"],["Mountainview College Council (MCC)","5440"],["Muggles","5445"],["Muslim Student Association (MSA)","4800"],["National Association for the Advancement of Colored People (NAACP)","5275"],["National Association of Black Accountants (NABA)","4390"],["National Society of Black Engineers (NSBE)","7050"],["Neurodiversity Club","7123"],["Neuroscience Club","7530"],["New York Public Interest Research Group (NYPIRG)","4570"],["Newing College Council (NCC)","4550"],["Newman Association","7540"],["No Strings Attached","6230"],["Note to Self","5560"],["Nukporfe African Dance - Drum [UYAI NNUA]","7330"],["Nursing Student Association (NSA)","4750"],["NYS Mentoring Club","7225"],["OCC Transport (OCCT)","4730"],["Off Campus College Community (OC3)","4560"],["OlamiJHealth","5028"],["One Health Medical Association (OHMA)","5618"],["Origami Club","7280"],["oSTEM","5185"],["Pakistani Students Association (PSA)","4720"],["Pappy Parker Players","4725"],["Paramoda - Moda (subgroup of Parent: Paramoda (MODA X))","4055A"],["Paramoda - Paradox (subgroup of Parent: Paramoda (MODA X))","4055B"],["Paramoda (MODA X)","4055"],["Partners in Health (PiH)","4740"],["Paws and Effect","7535"],["Pep Band","5820"],["Philosophy of Science Club - TEDx","7080"],["Pickup Soccer Club","6362"],["Pipe Dream","4270"],["Planned Parenthood Generation (PPGen)","5066"],["Plant Based Bing","7125"],["Pokemon Fan Club","7920"],["Poker Club","5620"],["Policy Project (BPP)","8281"],["Polish Student Association","8380"],["Powerful United Ladies Striving to Elevate (PULSE)","4790"],["Pre Dental Association","7360"],["Pre-Genetic Counseling Club","6570"],["Pre-Law Education Organization (PLEO)","6575"],["Pre-Medical Association","4290"],["Pre-Occupational and Physical Therapy Association (POPTA)","4285"],["Pre-Optometry Association","4680"],["Pre-Pharmacy Association","6520"],["Pre-Physician Assistant Society","4830"],["Pre-Veterinary Society","6580"],["Pretty Girls Sweat (PGS)","8122"],["Production & Mixing (BPM)","8225"],["Quimbamba","8255"],["Quiz Bowl","4645"],["Rainbow Pride Union (RPU)","4610"],["REACH","4325"],["Rena Magazine","4615"],["Rhythm Method","4340"],["ROTC Club","6165"],["SA Conduct Advocates","9510"],["SA Congress (Blake)","9200"],["SA E-Board","9810"],["SA EVP Office (Nick)","9410"],["SA INK","8500"],["SA Jennie/Ornella","9800"],["SA President Office (McKenzie)","9202"],["SA VPMA Office (Jestina)","9600"],["SA VPP Office (Atticus)","9300"],["SA VPSS Office (Kristina)","9500"],["SAPB Treasurer (POs ONLY)","9300"],["Scientista","8128"],["SEEK","4170"],["SELF - Students for Ethical Living and Food","7315"],["Semper Fi Club","5035"],["SHADES","8100"],["She's the First (STF)","8212"],["Sikh and Punjabi Student Association","5160"],["Skate Club","4035"],["SnoCats Ski & Snowboard Club","5390"],["Society for Human Resource Management (SHRM)","5050"],["Society of Asian Scientists and Engineers (SASE)","7070"],["Society of Automotive and Aerospace Engineers (SAE)","7450"],["Society of Hispanic Professional Engineers (SHPE)","7220"],["Society of Women Engineers (SWE)","7520"],["SOM Diversity, Inclusion, and Belonging Club (DIB)","6340"],["Sound of Binghamton","6435"],["Spanish Club","7300"],["Speech and Debate","6910"],["Speech and Language Association (SLA)","8215"],["Sports Management Group (SMG)","8165"],["Stand Up","6710"],["Storytelling Workshop Club","8408"],["Student Design Agency (SDA)","5690"],["Student Psychological Association (SPA)","4010"],["Student Volunteer Center (SVC)","4760"],["Students for Autism Acceptance (BSAA)","8430"],["Students for Justice in Palestine (SJP)","6120"],["Students For Sunrise","7240"],["Students of Rare Diseases (SRD)","8148"],["Sul Poong","5790"],["SUNY Kids","4820"],["Susquehanna Community Council (SCC)","6220"],["Swipe Out Hunger","8142"],["TAMID Group","6265"],["Tap That","5250"],["Teachers in Mathematics Association (TIMA)","5030"],["Thai Student Organization (TSO)","4265"],["The Medicine in Sports Club (MiS)","5025"],["Thurgood Marshall Pre-Law Soc. (TMPS)","7420"],["TOPSoccer","7425"],["Transcend","5120"],["Treblemakers","5940"],["Turkish Culture Association (TURCA)","5720"],["Ukrainian Cultural Association (UCA)","7325"],["Uncommon Grounds","7310"],["Undergraduate Art History Association (UAHA)","8395"],["Undergraduate Chemical Society (UCS)","5090"],["Undivided: Multicultural R&B Group","4605"],["UNICEF at Binghamton","5420"],["Unkai Daiko","7235"],["VGA - Binghamton Esports Club","8190A"],["VGA - Game Development Group","8190B"],["VGA - GeoGuessr Club","8190C"],["VGA - Pokemon Go Club","8190D"],["VGA - Smash & Fighting Games Club","8190E"],["Vibrations","6140"],["Video Game Association (VGA)","8190"],["Water for Life","8020"],["WHRW (Harpur Radio Workshop)","4470"],["Wishmakers on Campus","8200"],["Women in Business (WiB)","8090"],["Women in Lifting","5235"],["X-Fact'r Step Team","7290"],["Young Democratic Socialists of America (YDSA)","7085"],["Zero Hour Binghamton","7885"],["Zionist Organization (BUZO)","7880"]]
JSON;
                $initial_clubs = json_decode($clubs_json, true) ?: [];
            }
            if (!empty($initial_clubs)) {
                $stmt = $pdo->prepare("INSERT IGNORE INTO club_accounts (club_name, account_number) VALUES (?, ?)");
                foreach ($initial_clubs as $club) {
                    if (!empty($club[0]) && !empty($club[1])) {
                        $stmt->execute([$club[0], $club[1]]);
                    }
                }
                $message .= count($initial_clubs) . " club accounts seeded.<br>";
            }
        }

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