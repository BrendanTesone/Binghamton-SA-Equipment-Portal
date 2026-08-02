import React, { useState, useEffect } from 'react';
import { Box, Typography, TextField, Button, List, ListItem, ListItemText, IconButton, Paper, Alert, Divider, Avatar, InputAdornment, Fade } from '@mui/material';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import PersonAddAlt1Icon from '@mui/icons-material/PersonAddAlt1';
import ShieldIcon from '@mui/icons-material/Shield';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';

const AdminControlTab = () => {
    const [admins, setAdmins] = useState([]);
    const [newAdminEmail, setNewAdminEmail] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const fetchAdmins = async () => {
        const response = await fetch('https://equipment.binghamtonsa.org/api.php?action=get_admins', {
            credentials: 'include'
        });
        const data = await response.json();
        if (data.success) {
            setAdmins(data.data);
        }
    };

    useEffect(() => {
        fetchAdmins();
    }, []);

    const handleAddAdmin = async () => {
        if (!newAdminEmail) {
            setError('Please enter an email address');
            return;
        }
        setError('');
        setSuccess('');

        try {
            const response = await fetch('https://equipment.binghamtonsa.org/api.php?action=add_admin', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ email: newAdminEmail })
            });
            const data = await response.json();

            if (data.success) {
                setSuccess('Admin added successfully');
                setNewAdminEmail('');
                fetchAdmins();
            } else {
                setError('Failed to add admin');
            }
        } catch {
            setError('Network error adding admin');
        }
    };

    const handleRemoveAdmin = async (email) => {
        if (!window.confirm(`Are you sure you want to remove ${email} from admins?`)) return;

        try {
            const response = await fetch('https://equipment.binghamtonsa.org/api.php?action=remove_admin', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ email })
            });
            const data = await response.json();

            if (data.success) {
                fetchAdmins();
            } else {
                setError('Failed to remove admin');
            }
        } catch {
            setError('Network error removing admin');
        }
    };

    return (
        <Box sx={{ p: { xs: 2, md: 5 }, minHeight: '100%' }}>

            <Fade in={true} timeout={500}>
                <Paper elevation={0} sx={{ p: 4, mb: 5, borderRadius: '24px', border: '1px solid rgba(0,0,0,0.05)', boxShadow: '0 10px 40px -10px rgba(0,0,0,0.05)', background: 'linear-gradient(145deg, #ffffff, #f8fcfb)' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
                        <PersonAddAlt1Icon sx={{ color: '#005a43' }} />
                        <Typography variant="h6" fontWeight="bold">
                            Grant Administrator Access
                        </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: { xs: 'wrap', md: 'nowrap' } }}>
                        <TextField
                            fullWidth
                            variant="outlined"
                            value={newAdminEmail}
                            onChange={(e) => setNewAdminEmail(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleAddAdmin()}
                            placeholder="user@binghamton.edu"
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <EmailOutlinedIcon color="action" />
                                    </InputAdornment>
                                ),
                                sx: { borderRadius: '12px', backgroundColor: '#fff' }
                            }}
                        />
                        <Button
                            variant="contained"
                            onClick={handleAddAdmin}
                            sx={{
                                height: 55,
                                px: 4,
                                borderRadius: '12px',
                                background: 'linear-gradient(135deg, #005a43 0%, #008a66 100%)',
                                fontWeight: 'bold',
                                fontSize: '1rem',
                                textTransform: 'none',
                                whiteSpace: 'nowrap',
                                boxShadow: '0 4px 14px rgba(0, 90, 67, 0.4)',
                                '&:hover': {
                                    background: 'linear-gradient(135deg, #004231 0%, #007052 100%)',
                                    transform: 'translateY(-2px)',
                                    boxShadow: '0 6px 20px rgba(0, 90, 67, 0.5)'
                                },
                                transition: 'all 0.2s ease-in-out'
                            }}
                        >
                            Authorize Admin
                        </Button>
                    </Box>
                    {error && <Alert severity="error" sx={{ mt: 3, borderRadius: '12px' }}>{error}</Alert>}
                    {success && <Alert severity="success" sx={{ mt: 3, borderRadius: '12px' }}>{success}</Alert>}
                </Paper>
            </Fade>

            <Fade in={true} timeout={800}>
                <Paper elevation={0} sx={{ borderRadius: '24px', border: '1px solid rgba(0,0,0,0.05)', boxShadow: '0 10px 40px -10px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
                    <Box sx={{ p: 4, background: 'linear-gradient(135deg, #005a43 0%, #003d2e 100%)', color: 'white', display: 'flex', alignItems: 'center', gap: 2 }}>
                        <ShieldIcon sx={{ fontSize: 28, color: '#4caf50' }} />
                        <Typography variant="h6" fontWeight="bold">
                            Administrators
                        </Typography>
                    </Box>
                    <List sx={{ p: 0, backgroundColor: '#fff' }}>
                        {admins.map((admin, index) => (
                            <React.Fragment key={admin.id || index}>
                                {index > 0 && <Divider sx={{ opacity: 0.6 }} />}
                                <ListItem
                                    sx={{
                                        py: 3,
                                        px: 4,
                                        transition: 'background-color 0.2s',
                                        '&:hover': { backgroundColor: '#f9fbfc' },
                                        paddingRight: '72px'
                                    }}
                                    secondaryAction={
                                        <IconButton
                                            onClick={() => handleRemoveAdmin(admin.email)}
                                            color="error"
                                            sx={{ 
                                                backgroundColor: 'rgba(211, 47, 47, 0.05)', 
                                                '&:hover': { backgroundColor: 'rgba(211, 47, 47, 0.15)', transform: 'scale(1.1)' },
                                                transition: 'all 0.2s'
                                            }}
                                            title="Revoke Access"
                                        >
                                            <DeleteOutlineIcon />
                                        </IconButton>
                                    }
                                >
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                                        <Avatar sx={{ bgcolor: '#e0efe9', color: '#005a43', fontWeight: 'bold' }}>
                                            {admin.email.charAt(0).toUpperCase()}
                                        </Avatar>
                                        <ListItemText
                                            primary={
                                                <Typography variant="subtitle1" fontWeight="600" color="text.primary">
                                                    {admin.email}
                                                </Typography>
                                            }
                                        />
                                    </Box>
                                </ListItem>
                            </React.Fragment>
                        ))}
                        {admins.length === 0 && (
                            <Box sx={{ p: 8, textAlign: 'center', color: 'text.secondary' }}>
                                <ShieldIcon sx={{ fontSize: 48, color: '#e0e0e0', mb: 2 }} />
                                <Typography variant="h6" color="text.disabled">No administrators configured</Typography>
                            </Box>
                        )}
                    </List>
                </Paper>
            </Fade>
        </Box>
    );
};

export default AdminControlTab;
