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
import MenuItem from '@mui/material/MenuItem';

// Generate time options from 6:00 AM to 10:00 PM (hourly)
const timeOptions = [];
for (let i = 6; i <= 22; i++) {
    let label = '';
    if (i < 12) label = `${i}:00 AM`;
    else if (i === 12) label = `12:00 PM`;
    else label = `${i - 12}:00 PM`;

    const pad = (n) => n.toString().padStart(2, '0');
    // We use the 24-hr layout for the backend string but the 12-hr for the label
    timeOptions.push({ value: `${pad(i)}:00`, label });
}

// Convert existing time to match our rigid hourly dropdowns
const extractDropdownHour = (dateObj) => {
    if (!dateObj) return '';
    const pad = (n) => n.toString().padStart(2, '0');
    
    // Read local hours directly 
    let hour = dateObj.getHours();

    if (hour < 6) hour = 6;
    if (hour > 22) hour = 22;
    
    return `${pad(hour)}:00`;
};

// Helper to merge LOCAL time str into Date, then output LOCAL string for MySQL
const mergeDateTimeToMySQL = (originalDateObj, timeStr) => {
    if (!originalDateObj || !timeStr) return '';
    const [hours, minutes] = timeStr.split(':');
    
    const newDate = new Date(originalDateObj.getTime());
    newDate.setHours(parseInt(hours, 10));
    newDate.setMinutes(parseInt(minutes, 10));
    newDate.setSeconds(0);
    
    const pad = (n) => n.toString().padStart(2, '0');
    return `${newDate.getFullYear()}-${pad(newDate.getMonth() + 1)}-${pad(newDate.getDate())} ${pad(newDate.getHours())}:${pad(newDate.getMinutes())}:00`;
};

const EditPickupDropoffModal = ({ open, onClose, order, refreshData }) => {
    const [pickupTime, setPickupTime] = useState('');
    const [dropoffTime, setDropoffTime] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (open && order) {
            setPickupTime(extractDropdownHour(order.pickup));
            setDropoffTime(extractDropdownHour(order.dropoff));
            setError(null);
        }
    }, [open, order]);

    const handleSave = async () => {
        if (!pickupTime || !dropoffTime) {
            setError("Both pickup and dropoff times are required.");
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const mysqlStart = mergeDateTimeToMySQL(order.pickup, pickupTime);
            const mysqlEnd = mergeDateTimeToMySQL(order.dropoff, dropoffTime);
            
            // Validate the merged datetimes strictly
            if (new Date(mysqlStart) >= new Date(mysqlEnd)) {
                setError("Dropoff must occur after pickup time.");
                setLoading(false);
                return;
            }

            const response = await fetch('https://equipment.binghamtonsa.org/api.php?action=update_order_times', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    order_id: order.id,
                    new_start: mysqlStart,
                    new_end: mysqlEnd
                })
            });

            const data = await response.json();

            if (data.success) {
                alert("Pickup and Dropoff times successfully updated!");
                refreshData();
                onClose();
            } else {
                setError(data.error || "Failed to update times.");
            }
        } catch (err) {
            setError("Network error occurred.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onClose={!loading ? onClose : undefined} fullWidth maxWidth="sm">
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pr: 2 }}>
                <DialogTitle>Edit Pickup / Dropoff Times</DialogTitle>
                {!loading && <Button variant="text" onClick={onClose} sx={{ minWidth: 'auto', fontWeight: 'bold' }}>X</Button>}
            </Box>
            <DialogContent dividers>
                {order && (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4, pt: 2 }}>
                        
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Box sx={{ flexGrow: 1 }}>
                                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                    Pickup Date (Fixed)
                                </Typography>
                                <Typography variant="body1" fontWeight="bold" sx={{ color: 'text.primary' }}>
                                    {order.pickup.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                                </Typography>
                            </Box>
                            <TextField
                                select
                                label="Pickup Time"
                                value={pickupTime}
                                onChange={(e) => setPickupTime(e.target.value)}
                                sx={{ width: 200 }}
                            >
                                {timeOptions.map((option) => (
                                    <MenuItem key={`pickup-${option.value}`} value={option.value}>
                                        {option.label}
                                    </MenuItem>
                                ))}
                            </TextField>
                        </Box>

                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Box sx={{ flexGrow: 1 }}>
                                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                    Dropoff Date (Fixed)
                                </Typography>
                                <Typography variant="body1" fontWeight="bold" sx={{ color: 'text.primary' }}>
                                    {order.dropoff.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                                </Typography>
                            </Box>
                            <TextField
                                select
                                label="Dropoff Time"
                                value={dropoffTime}
                                onChange={(e) => setDropoffTime(e.target.value)}
                                sx={{ width: 200 }}
                            >
                                {timeOptions.map((option) => (
                                    <MenuItem key={`dropoff-${option.value}`} value={option.value}>
                                        {option.label}
                                    </MenuItem>
                                ))}
                            </TextField>
                        </Box>

                        {error && <Alert severity="error" sx={{ mt: 1 }}>{error}</Alert>}
                    </Box>
                )}
            </DialogContent>
            <DialogActions sx={{ p: 2 }}>
                <Button onClick={onClose} disabled={loading} color="inherit">Cancel</Button>
                <Button onClick={handleSave} disabled={loading} variant="contained" color="primary">
                    {loading ? <CircularProgress size={24} /> : 'Save Changes'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default EditPickupDropoffModal;
