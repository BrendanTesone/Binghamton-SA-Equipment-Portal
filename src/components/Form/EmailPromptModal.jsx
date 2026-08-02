import React, { useState, useEffect } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';

const EmailPromptModal = ({ open, onClose, order, newStatus, refreshData }) => {
    const [notes, setNotes] = useState('');
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const isDenial = newStatus === 'Denied';

    // Reset fields on distinct openings (using only 'open' so background polling doesn't wipe typing)
    useEffect(() => {
        if (open) {
            setNotes('');
            setEmail(order ? order.email : '');
            setError(null);
        }
    }, [open]);

    const handleSubmit = async () => {
        if (!email.trim()) {
            setError("A recipient email address is required.");
            return;
        }

        if (isDenial && !notes.trim()) {
            setError("A reason for denial is absolutely required.");
            return;
        }

        setLoading(true);
        setError(null);

        try {
            // 1. Permanently update the status inside the SQL database
            const statusResponse = await fetch('https://equipment.binghamtonsa.org/api.php?action=update_order_status', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ order_id: order.id, new_status: newStatus })
            });
            const statusData = await statusResponse.json();

            if (!statusData.success) {
                setError(statusData.error || "Failed to update database status.");
                setLoading(false);
                return;
            }

            // 2. Transmit Email using correct endpoint
            const emailAction = isDenial ? 'send_rejection_email' : 'send_approval_email';
            const emailPayload = {
                recipientEmail: email.trim(),
                recipientName: order.contactName,
                equipmentItems: order.equipment.map(e => e.name),
                pickupTime: order.pickup.toLocaleString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
                dropoffTime: order.dropoff.toLocaleString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })
            };

            // Inject the specific note key based on the target action
            if (isDenial) emailPayload.rejectionReason = notes;
            else emailPayload.approvalNotes = notes;

            const emailResponse = await fetch(`https://equipment.binghamtonsa.org/api.php?action=${emailAction}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(emailPayload)
            });
            const emailData = await emailResponse.json();

            if (!emailData.success) {
                setError(`Status updated, but email sending failed: ${emailData.error}`);
            } else {
                refreshData();
                onClose();
            }

        } catch (err) {
            setError("Network boundary error occurred.");
        } finally {
            setLoading(false);
        }
    };

    if (!order) return null;

    return (
        <Dialog open={open} onClose={!loading ? onClose : undefined} fullWidth maxWidth="sm">
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pr: 2, bgcolor: isDenial ? '#ffebee' : '#e8f5e9' }}>
                <DialogTitle sx={{ color: isDenial ? '#c62828' : '#2e7d32', fontWeight: 'bold' }}>
                    Confirm & {newStatus} Order
                </DialogTitle>
                {!loading && <Button variant="text" onClick={onClose} sx={{ minWidth: 'auto', fontWeight: 'bold' }}>X</Button>}
            </Box>
            <DialogContent dividers>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                        You are about to mark the order for <strong>{order.club}</strong> ({order.contactName}) as <strong>{newStatus}</strong>.
                    </Typography>
                    
                    <Typography variant="body2" color="text.secondary">
                        This action will immediately trigger an automated email notifying them of this status change. Provide any context below.
                    </Typography>

                    <TextField
                        fullWidth
                        label="Recipient Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />

                    <TextField
                        fullWidth
                        multiline
                        rows={4}
                        label={isDenial ? "Reason for Denial (Required)" : "Additional Admin Notes (Optional)"}
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder={isDenial ? "E.g., Tent 2 is double booked for this weekend..." : "E.g., We have swapped Tent 2 for Tent 3..."}
                        required={isDenial}
                    />

                    {error && <Alert severity="error">{error}</Alert>}
                </Box>
            </DialogContent>
            <DialogActions sx={{ p: 2 }}>
                <Button onClick={onClose} disabled={loading} color="inherit">Cancel</Button>
                <Button onClick={handleSubmit} disabled={loading} variant="contained" color={isDenial ? "error" : "success"}>
                    {loading ? <CircularProgress size={24} /> : `Confirm & Send Email`}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default EmailPromptModal;
