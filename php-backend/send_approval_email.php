<?php
// backend/send_approval_email.php

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

require_once __DIR__ . '/../vendor/autoload.php';

// Locate the secrets folder
$config_path = __DIR__ . '/../secrets/smtp_config.php';
if (!file_exists($config_path)) {
    $config_path = __DIR__ . '/secrets/smtp_config.php';
}
require_once $config_path;

function sendEquipmentApprovedEmail($recipientEmail, $recipientName, $approvalNotes, $equipmentItems, $pickupTime, $dropoffTime)
{
    global $smtp_host, $smtp_user, $smtp_pass, $smtp_from_email, $smtp_from_name;

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
    $subject = 'Student Association - Equipment Request Approved';

    // HTML Body
    $htmlBody = '
    <div><u></u><div style="background-color:#f6f6f6;font-family:sans-serif;font-size:14px;line-height:1.4;margin:0;padding:0"><table border="0" cellpadding="0" cellspacing="0" style="border-collapse:separate;background-color:#f6f6f6;width:100%"><tbody><tr><td style="font-family:sans-serif;font-size:14px;vertical-align:top">&nbsp;</td><td style="font-family:sans-serif;font-size:14px;vertical-align:top;display:block;max-width:580px;padding:10px;width:580px;Margin:0 auto!important"><div style="box-sizing:border-box;display:block;Margin:0 auto;max-width:580px;padding:10px"><span style="color:transparent;display:none;height:0;max-height:0;max-width:0;opacity:0;overflow:hidden;width:0">Student Association Equipment Request Approved</span><table style="border-collapse:separate;background:#fff;border-radius:3px;width:100%"><tbody><tr><td style="font-family:sans-serif;font-size:14px;vertical-align:top;box-sizing:border-box;padding:20px"><table border="0" cellpadding="0" cellspacing="0" style="border-collapse:separate;width:100%"><tbody><tr><td style="font-family:sans-serif;font-size:14px;vertical-align:top"><img src="https://forms.binghamtonsa.org/media/SA_Logo.png" height="110px" class="CToWUd" data-bit="iit"><hr><p style="font-family:sans-serif;font-size:14px;font-weight:normal;margin:0;Margin-bottom:15px">Hi ' . htmlspecialchars($recipientName) . ',</p><p style="font-family:sans-serif;font-size:14px;font-weight:normal;margin:0;Margin-bottom:15px">Good news! The equipment request you submitted has been <strong>approved</strong> by the administrator.</p>';

    if (!empty($approvalNotes)) {
        $htmlBody .= '<p style="font-family:sans-serif;font-size:14px;font-weight:bold;margin:0;Margin-bottom:15px">Admin Notes:</p><p style="font-family:sans-serif;font-size:14px;font-weight:normal;margin:0;Margin-bottom:15px">' . htmlspecialchars($approvalNotes) . '</p>';
    }

    $htmlBody .= '<p style="font-family:sans-serif;font-size:14px;font-weight:bold;margin:0;Margin-bottom:5px">Requested Details:</p><p style="font-family:sans-serif;font-size:14px;font-weight:normal;margin:0;Margin-bottom:5px"><strong>Pickup:</strong> ' . htmlspecialchars($pickupTime) . '<br><strong>Dropoff:</strong> ' . htmlspecialchars($dropoffTime) . '</p>' . $itemsListHtml . '<p style="font-family:sans-serif;font-size:14px;font-weight:normal;margin:0;Margin-bottom:15px">Please ensure you arrive precisely during your scheduled pickup window to collect your rental.</p><p style="font-family:sans-serif;font-size:14px;font-weight:normal;margin:0;Margin-bottom:15px">If you have any questions, please email <a href="mailto:evp@binghamtonsa.org" target="_blank">evp@binghamtonsa.org</a>.</p></td></tr></tbody></table></td></tr></tbody></table><div style="clear:both;padding-top:10px;text-align:center;width:100%"><table border="0" cellpadding="0" cellspacing="0" style="border-collapse:separate;width:100%"><tbody><tr><td style="font-family:sans-serif;font-size:14px;vertical-align:top;color:#999999;font-size:12px;text-align:center"><span style="color:#999999;font-size:12px;text-align:center">Student Association of Binghamton University<br>4400 Vestal Parkway East<br>Binghamton, NY 13902</span></td></tr></tbody></table></div></div></td><td style="font-family:sans-serif;font-size:14px;vertical-align:top">&nbsp;</td></tr></tbody></table></div><div class="yj6qo"></div><div class="adL"></div></div>
    ';

    // Plain text fallback
    $notesText = !empty($approvalNotes) ? "\nAdmin Notes:\n$approvalNotes\n" : "";
    $textBody = "Hi $recipientName,\n\nThe equipment request you submitted has been approved.\n$notesText\nRequested Details:\nPickup: $pickupTime\nDropoff: $dropoffTime\n\nItems Request:\n$itemsListText\n\nPlease ensure you arrive precisely during your scheduled pickup window.\n\nIf you have any questions, please email evp@binghamtonsa.org.";

    $mail = new PHPMailer(true);

    try {
        $mail->isSMTP();
        $mail->Host       = $host;
        $mail->SMTPAuth   = true;
        $mail->Username   = $smtp_user;
        $mail->Password   = $smtp_pass;
        $mail->SMTPSecure = PHPMailer::ENCRYPTION_SMTPS;
        $mail->Port       = 465;

        $mail->setFrom($smtp_from_email, $smtp_from_name);
        $mail->addAddress($recipientEmail, $recipientName);

        $mail->isHTML(true);
        $mail->Subject = $subject;
        $mail->Body    = $htmlBody;
        $mail->AltBody = $textBody;

        $mail->send();
        return ['success' => true, 'message' => 'Approval email sent successfully'];
    } catch (Exception $e) {
        error_log("PHPMailer Error: {$mail->ErrorInfo}");
        return ['success' => false, 'error' => $mail->ErrorInfo];
    } catch (\Exception $e) {
        error_log("General Error: " . $e->getMessage());
        return ['success' => false, 'error' => $e->getMessage()];
    }
}
?>
