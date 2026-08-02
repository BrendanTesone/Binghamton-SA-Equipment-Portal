<?php
// backend/send_rejection_email.php

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

require_once __DIR__ . '/../vendor/autoload.php';

// Locate the secrets folder regardless of if it's in the document root or one level above
$config_path = __DIR__ . '/../secrets/smtp_config.php';
if (!file_exists($config_path)) {
    $config_path = __DIR__ . '/secrets/smtp_config.php';
}
require_once $config_path;

function sendEquipmentRejectedEmail($recipientEmail, $recipientName, $rejectionReason, $equipmentItems, $pickupTime, $dropoffTime)
{
    // The variables mapped from your smtp_config.php file
    // Ensure these match exactly what you have in your config file
    global $smtp_host, $smtp_user, $smtp_pass, $smtp_from_email, $smtp_from_name;

    // Fallback to the host Manav provided if your config doesn't have it
    $host = !empty($smtp_host) ? $smtp_host : 'email-smtp.us-east-1.amazonaws.com';

    // Format items as bulleted list
    $itemsListHtml = '<ul>';
    $itemsListText = '';
    foreach ($equipmentItems as $item) {
        $itemsListHtml .= '<li>' . htmlspecialchars($item) . '</li>';
        $itemsListText .= "- " . htmlspecialchars($item) . "\n";
    }
    $itemsListHtml .= '</ul>';

    // Subject
    $subject = 'Student Association - Equipment Request Update';

    // HTML Body
    $htmlBody = '
    <div><u></u><div style="background-color:#f6f6f6;font-family:sans-serif;font-size:14px;line-height:1.4;margin:0;padding:0"><table border="0" cellpadding="0" cellspacing="0" style="border-collapse:separate;background-color:#f6f6f6;width:100%"><tbody><tr><td style="font-family:sans-serif;font-size:14px;vertical-align:top">&nbsp;</td><td style="font-family:sans-serif;font-size:14px;vertical-align:top;display:block;max-width:580px;padding:10px;width:580px;Margin:0 auto!important"><div style="box-sizing:border-box;display:block;Margin:0 auto;max-width:580px;padding:10px"><span style="color:transparent;display:none;height:0;max-height:0;max-width:0;opacity:0;overflow:hidden;width:0">Student Association Equipment Request Denied</span><table style="border-collapse:separate;background:#fff;border-radius:3px;width:100%"><tbody><tr><td style="font-family:sans-serif;font-size:14px;vertical-align:top;box-sizing:border-box;padding:20px"><table border="0" cellpadding="0" cellspacing="0" style="border-collapse:separate;width:100%"><tbody><tr><td style="font-family:sans-serif;font-size:14px;vertical-align:top"><img src="https://forms.binghamtonsa.org/media/SA_Logo.png" height="110px" class="CToWUd" data-bit="iit"><hr><p style="font-family:sans-serif;font-size:14px;font-weight:normal;margin:0;Margin-bottom:15px">Hi ' . htmlspecialchars($recipientName) . ',</p><p style="font-family:sans-serif;font-size:14px;font-weight:normal;margin:0;Margin-bottom:15px">The equipment request you submitted has been denied for the following reason(s):</p><p style="font-family:sans-serif;font-size:14px;font-weight:bold;margin:0;Margin-bottom:15px">Reason: </p><p style="font-family:sans-serif;font-size:14px;font-weight:normal;margin:0;Margin-bottom:15px">' . htmlspecialchars($rejectionReason) . '</p><p style="font-family:sans-serif;font-size:14px;font-weight:bold;margin:0;Margin-bottom:5px">Requested Details:</p><p style="font-family:sans-serif;font-size:14px;font-weight:normal;margin:0;Margin-bottom:5px"><strong>Pickup:</strong> ' . htmlspecialchars($pickupTime) . '<br><strong>Dropoff:</strong> ' . htmlspecialchars($dropoffTime) . '</p>' . $itemsListHtml . '<p style="font-family:sans-serif;font-size:14px;font-weight:normal;margin:0;Margin-bottom:15px"> If you believe this is a mistake or would like to submit a new timeframe, please submit a new request:</p><table border="0" cellpadding="0" cellspacing="0" style="border-collapse:separate;box-sizing:border-box;width:100%"><tbody><tr><td align="left" style="font-family:sans-serif;font-size:14px;vertical-align:top;padding-bottom:15px"><table border="0" cellpadding="0" cellspacing="0" style="border-collapse:separate;width:100%;width:auto"><tbody><tr><td style="font-family:sans-serif;font-size:14px;vertical-align:top;background-color:#ffffff;border-radius:5px;text-align:center;background-color:#06422d"> <a href="https://equipment.binghamtonsa.org" style="text-decoration:underline;background-color:#ffffff;border:solid 1px #06422d;border-radius:5px;box-sizing:border-box;color:#06422d;display:inline-block;font-size:14px;font-weight:bold;margin:0;padding:12px 25px;text-decoration:none;text-transform:capitalize;background-color:#06422d;border-color:#06422d;color:#ffffff" target="_blank" data-saferedirecturl="https://www.google.com/url?q=https://equipment.binghamtonsa.org&amp;source=gmail"> Submit New Request</a> </td></tr></tbody></table></td></tr></tbody></table><p style="font-family:sans-serif;font-size:14px;font-weight:normal;margin:0;Margin-bottom:15px">If you have any questions, please email <a href="mailto:evp@binghamtonsa.org" target="_blank">evp@binghamtonsa.org</a>.</p></td></tr></tbody></table></td></tr></tbody></table><div style="clear:both;padding-top:10px;text-align:center;width:100%"><table border="0" cellpadding="0" cellspacing="0" style="border-collapse:separate;width:100%"><tbody><tr><td style="font-family:sans-serif;font-size:14px;vertical-align:top;color:#999999;font-size:12px;text-align:center"><span style="color:#999999;font-size:12px;text-align:center">Student Association of Binghamton University<br>4400 Vestal Parkway East<br>Binghamton, NY 13902</span></td></tr></tbody></table></div></div></td><td style="font-family:sans-serif;font-size:14px;vertical-align:top">&nbsp;</td></tr></tbody></table></div><div class="yj6qo"></div><div class="adL"></div></div>
    ';

    // Plain text fallback
    $textBody = "Hi $recipientName,\n\nThe equipment request you submitted has been denied for the following reason(s):\n\nReason:\n$rejectionReason\n\nRequested Details:\nPickup: $pickupTime\nDropoff: $dropoffTime\n\nItems Request:\n$itemsListText\n\nPlease submit a new request: https://equipment.binghamtonsa.org\n\nIf you have any questions, please email evp@binghamtonsa.org.";

    $mail = new PHPMailer(true);

    try {
        // Server settings
        $mail->isSMTP();                                            // Send using SMTP
        $mail->Host       = $host;                                  // Set the SMTP server to send through
        $mail->SMTPAuth   = true;                                   // Enable SMTP authentication
        $mail->Username   = $smtp_user;                             // SMTP username
        $mail->Password   = $smtp_pass;                             // SMTP password
        $mail->SMTPSecure = PHPMailer::ENCRYPTION_SMTPS;            // Enable implicit TLS encryption (SSL)
        $mail->Port       = 465;                                    // TCP port to connect to

        // Recipients
        $mail->setFrom($smtp_from_email, $smtp_from_name);
        $mail->addAddress($recipientEmail, $recipientName);

        // Content
        $mail->isHTML(true);                                        // Set email format to HTML
        $mail->Subject = $subject;
        $mail->Body    = $htmlBody;
        $mail->AltBody = $textBody;

        $mail->send();
        return ['success' => true, 'message' => 'Email sent successfully'];
    } catch (Exception $e) {
        error_log("PHPMailer Error: {$mail->ErrorInfo}");
        return ['success' => false, 'error' => $mail->ErrorInfo];
    } catch (\Exception $e) {
        error_log("General Error: " . $e->getMessage());
        return ['success' => false, 'error' => $e->getMessage()];
    }
}
?>