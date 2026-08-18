import React, { useState, useEffect, useMemo } from 'react';
import {
    Box,
    Typography,
    TextField,
    Button,
    List,
    ListItem,
    ListItemText,
    IconButton,
    Paper,
    Alert,
    Divider,
    Avatar,
    InputAdornment,
    Fade,
    Chip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions
} from '@mui/material';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import NumbersIcon from '@mui/icons-material/Numbers';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import SearchIcon from '@mui/icons-material/Search';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import DomainIcon from '@mui/icons-material/Domain';

const ConfirmationModal = ({ open, onClose, onConfirm, club }) => {
    return (
        <Dialog open={open} onClose={onClose}>
            <DialogTitle sx={{ fontWeight: 'bold' }}>Confirm Deletion</DialogTitle>
            <DialogContent>
                <DialogContentText>
                    Are you sure you want to remove the account number mapping for <strong>{club?.club_name}</strong> (Account #{club?.account_number})?
                </DialogContentText>
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 2 }}>
                <Button onClick={onClose} color="inherit">Cancel</Button>
                <Button onClick={() => { onConfirm(); onClose(); }} color="error" variant="contained" autoFocus>
                    Delete Mapping
                </Button>
            </DialogActions>
        </Dialog>
    );
};

const AccountNumbersTab = () => {
    const [clubAccounts, setClubAccounts] = useState([]);
    const [clubName, setClubName] = useState('');
    const [accountNumber, setAccountNumber] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [deletingClub, setDeletingClub] = useState(null);

    const fetchClubAccounts = async () => {
        try {
            const response = await fetch('https://equipment.binghamtonsa.org/api.php?action=get_club_accounts', {
                credentials: 'include'
            });
            const data = await response.json();
            if (data.success && Array.isArray(data.data)) {
                setClubAccounts(data.data);
            }
        } catch (err) {
            console.error('Failed to fetch club accounts:', err);
        }
    };

    useEffect(() => {
        fetchClubAccounts();
    }, []);

    const handleSaveClubAccount = async () => {
        if (!clubName.trim() || !accountNumber.trim()) {
            setError('Please enter both a Club Name and an Account Number');
            return;
        }
        setError('');
        setSuccess('');

        try {
            const response = await fetch('https://equipment.binghamtonsa.org/api.php?action=add_club_account', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    club_name: clubName.trim(),
                    account_number: accountNumber.trim()
                })
            });
            const data = await response.json();

            if (data.success) {
                setSuccess(`Account number for "${clubName.trim()}" saved successfully`);
                setClubName('');
                setAccountNumber('');
                fetchClubAccounts();
            } else {
                setError(data.error || 'Failed to save club account');
            }
        } catch {
            setError('Network error saving club account');
        }
    };

    const confirmDeleteClubAccount = async () => {
        if (!deletingClub) return;

        try {
            const response = await fetch('https://equipment.binghamtonsa.org/api.php?action=delete_club_account', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ id: deletingClub.id })
            });
            const data = await response.json();

            if (data.success) {
                setSuccess(`Deleted account number for "${deletingClub.club_name}"`);
                fetchClubAccounts();
            } else {
                setError(data.error || 'Failed to delete club account');
            }
        } catch {
            setError('Network error deleting club account');
        } finally {
            setDeletingClub(null);
        }
    };

    const filteredClubs = useMemo(() => {
        if (!searchTerm.trim()) return clubAccounts;
        const q = searchTerm.toLowerCase().trim();
        return clubAccounts.filter(c =>
            (c.club_name && c.club_name.toLowerCase().includes(q)) ||
            (c.account_number && c.account_number.toLowerCase().includes(q))
        );
    }, [clubAccounts, searchTerm]);

    return (
        <Box sx={{ p: { xs: 2, md: 5 }, minHeight: '100%' }}>

            {/* Confirmation Dialog */}
            <ConfirmationModal
                open={Boolean(deletingClub)}
                onClose={() => setDeletingClub(null)}
                onConfirm={confirmDeleteClubAccount}
                club={deletingClub}
            />

            {/* Add / Update Mapping Card */}
            <Fade in={true} timeout={500}>
                <Paper
                    elevation={0}
                    sx={{
                        p: 4,
                        mb: 4,
                        borderRadius: '24px',
                        border: '1px solid rgba(0,0,0,0.05)',
                        boxShadow: '0 10px 40px -10px rgba(0,0,0,0.05)',
                        background: 'linear-gradient(145deg, #ffffff, #f8fcfb)'
                    }}
                >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
                        <AddCircleOutlineIcon sx={{ color: '#005a43', fontSize: 28 }} />
                        <Typography variant="h6" fontWeight="bold">
                            Add or Update Club Account Number
                        </Typography>
                    </Box>

                    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '2fr 1fr auto' }, gap: 2, alignItems: 'center' }}>
                        <TextField
                            fullWidth
                            variant="outlined"
                            label="Club / Organization Name"
                            value={clubName}
                            onChange={(e) => setClubName(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSaveClubAccount()}
                            placeholder="e.g. Outdoors Club"
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <DomainIcon color="action" />
                                    </InputAdornment>
                                ),
                                sx: { borderRadius: '12px', backgroundColor: '#fff' }
                            }}
                        />

                        <TextField
                            fullWidth
                            variant="outlined"
                            label="Account Number"
                            value={accountNumber}
                            onChange={(e) => setAccountNumber(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSaveClubAccount()}
                            placeholder="e.g. 00452"
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <NumbersIcon color="action" />
                                    </InputAdornment>
                                ),
                                sx: { borderRadius: '12px', backgroundColor: '#fff' }
                            }}
                        />

                        <Button
                            variant="contained"
                            onClick={handleSaveClubAccount}
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
                            Save Mapping
                        </Button>
                    </Box>

                    {error && <Alert severity="error" sx={{ mt: 3, borderRadius: '12px' }}>{error}</Alert>}
                    {success && <Alert severity="success" sx={{ mt: 3, borderRadius: '12px' }}>{success}</Alert>}
                </Paper>
            </Fade>

            {/* Club Directory Card */}
            <Fade in={true} timeout={800}>
                <Paper
                    elevation={0}
                    sx={{
                        borderRadius: '24px',
                        border: '1px solid rgba(0,0,0,0.05)',
                        boxShadow: '0 10px 40px -10px rgba(0,0,0,0.05)',
                        overflow: 'hidden'
                    }}
                >
                    {/* Header */}
                    <Box
                        sx={{
                            p: 3,
                            background: 'linear-gradient(135deg, #005a43 0%, #003d2e 100%)',
                            color: 'white',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            flexWrap: 'wrap',
                            gap: 2
                        }}
                    >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <AccountBalanceWalletIcon sx={{ fontSize: 28, color: '#4caf50' }} />
                            <Typography variant="h6" fontWeight="bold">
                                Club Account Directory
                            </Typography>
                            <Chip
                                label={`${clubAccounts.length} Total`}
                                size="small"
                                sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: '#fff', fontWeight: 'bold' }}
                            />
                        </Box>

                        {/* Search Input */}
                        <TextField
                            size="small"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search club or account #..."
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchIcon sx={{ color: '#64748b' }} />
                                    </InputAdornment>
                                ),
                                sx: {
                                    backgroundColor: '#fff',
                                    borderRadius: '20px',
                                    width: { xs: '100%', sm: '260px' },
                                    fontSize: '0.875rem'
                                }
                            }}
                        />
                    </Box>

                    {/* List */}
                    <List sx={{ p: 0, backgroundColor: '#fff', maxHeight: '60vh', overflowY: 'auto' }}>
                        {filteredClubs.map((club, index) => (
                            <React.Fragment key={club.id || index}>
                                {index > 0 && <Divider sx={{ opacity: 0.6 }} />}
                                <ListItem
                                    sx={{
                                        py: 2,
                                        px: 4,
                                        transition: 'background-color 0.2s',
                                        '&:hover': { backgroundColor: '#f9fbfc' },
                                        paddingRight: '72px'
                                    }}
                                    secondaryAction={
                                        <IconButton
                                            onClick={() => setDeletingClub(club)}
                                            color="error"
                                            sx={{
                                                backgroundColor: 'rgba(211, 47, 47, 0.05)',
                                                '&:hover': { backgroundColor: 'rgba(211, 47, 47, 0.15)', transform: 'scale(1.1)' },
                                                transition: 'all 0.2s'
                                            }}
                                            title="Delete Mapping"
                                        >
                                            <DeleteOutlineIcon />
                                        </IconButton>
                                    }
                                >
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5, width: '100%' }}>
                                        <Avatar sx={{ bgcolor: '#e0efe9', color: '#005a43', fontWeight: 'bold' }}>
                                            {(club.club_name || '?').charAt(0).toUpperCase()}
                                        </Avatar>
                                        <ListItemText
                                            primary={
                                                <Typography variant="subtitle1" fontWeight="600" color="text.primary">
                                                    {club.club_name}
                                                </Typography>
                                            }
                                        />
                                        <Chip
                                            label={`Account #${club.account_number}`}
                                            size="small"
                                            variant="outlined"
                                            sx={{
                                                fontWeight: 700,
                                                borderColor: '#005a43',
                                                color: '#005a43',
                                                bgcolor: '#f0fdf4'
                                            }}
                                        />
                                    </Box>
                                </ListItem>
                            </React.Fragment>
                        ))}

                        {filteredClubs.length === 0 && (
                            <Box sx={{ p: 6, textAlign: 'center', color: 'text.secondary' }}>
                                <AccountBalanceWalletIcon sx={{ fontSize: 48, color: '#e0e0e0', mb: 2 }} />
                                <Typography variant="h6" color="text.disabled">
                                    {searchTerm ? 'No clubs matching search query' : 'No club account numbers configured'}
                                </Typography>
                            </Box>
                        )}
                    </List>
                </Paper>
            </Fade>
        </Box>
    );
};

export default AccountNumbersTab;
