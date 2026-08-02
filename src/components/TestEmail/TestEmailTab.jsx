import React, { useState } from 'react';
import { Box, Typography, TextField, Button, Paper, Alert, Grid } from '@mui/material';

const TestEmailTab = () => {
    const [formData, setFormData] = useState({
        recipientEmail: '',
        recipientName: '',
        rejectionReason: '',
        pickupTime: 'Wed Feb 25th 12:00 PM',
        dropoffTime: 'Thu Feb 26th 12:00 PM',
        equipmentItems: 'Bose L1 PRO Portable Line Array, Microphone Stands (x2)' // Comma separated for testing
    });

    const [loading, setLoading] = useState(false);
    const [response, setResponse] = useState(null);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSendTestEmail = async () => {
        if (!formData.recipientEmail || !formData.recipientName || !formData.rejectionReason) {
            setResponse({ success: false, error: 'Please fill out all required fields (Email, Name, Reason).' });
            return;
        }

        setLoading(true);
        setResponse(null);

        // Convert comma separated equipment back to array just for flexibility if we want
        const parsedEquipment = formData.equipmentItems.split(',').map(item => item.trim()).filter(Boolean);

        try {
            const res = await fetch('https://equipment.binghamtonsa.org/api.php?action=send_rejection_email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    recipientEmail: formData.recipientEmail,
                    recipientName: formData.recipientName,
                    rejectionReason: formData.rejectionReason,
                    pickupTime: formData.pickupTime,
                    dropoffTime: formData.dropoffTime,
                    equipmentItems: parsedEquipment
                })
            });

            const data = await res.json();
            setResponse(data);
        } catch (error) {
            console.error("Error sending test email:", error);
            setResponse({ success: false, error: 'Network error or server failed to respond.' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box sx={{ p: 4, height: '100%', overflowY: 'auto', backgroundColor: '#f4f6f8' }}>
            <Typography variant="h4" fontWeight="bold" gutterBottom>Test Rejection Email</Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
                Send a test email using the standard rejection template via Amazon SES.
            </Typography>

            <Paper elevation={3} sx={{ p: 4, borderRadius: 2, maxWidth: 800 }}>
                <Grid container spacing={3}>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            fullWidth
                            label="Recipient Email Address *"
                            name="recipientEmail"
                            value={formData.recipientEmail}
                            onChange={handleChange}
                            variant="outlined"
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            fullWidth
                            label="Recipient Name *"
                            name="recipientName"
                            value={formData.recipientName}
                            onChange={handleChange}
                            variant="outlined"
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <TextField
                            fullWidth
                            label="Reason for Denial / Message *"
                            name="rejectionReason"
                            value={formData.rejectionReason}
                            onChange={handleChange}
                            variant="outlined"
                            multiline
                            rows={4}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            fullWidth
                            label="Pickup Time string"
                            name="pickupTime"
                            value={formData.pickupTime}
                            onChange={handleChange}
                            variant="outlined"
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            fullWidth
                            label="Dropoff Time string"
                            name="dropoffTime"
                            value={formData.dropoffTime}
                            onChange={handleChange}
                            variant="outlined"
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <TextField
                            fullWidth
                            label="Equipment Items (Comma separated)"
                            name="equipmentItems"
                            value={formData.equipmentItems}
                            onChange={handleChange}
                            variant="outlined"
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <Button
                            variant="contained"
                            color="primary"
                            size="large"
                            onClick={handleSendTestEmail}
                            disabled={loading}
                            sx={{ mt: 2, px: 4, py: 1.5, fontWeight: 'bold' }}
                        >
                            {loading ? 'Sending...' : 'Send Test Email'}
                        </Button>
                    </Grid>
                </Grid>

                {response && (
                    <Box sx={{ mt: 4 }}>
                        {response.success ? (
                            <Alert severity="success">Email sent successfully!</Alert>
                        ) : (
                            <Alert severity="error">Failed to send email: {response.error}</Alert>
                        )}
                    </Box>
                )}
            </Paper>
        </Box>
    );
};

export default TestEmailTab;
