import { useState, useEffect } from 'react';
import { Box, Typography, Button, Paper, Alert, CircularProgress, Avatar, Fade } from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import LogoutIcon from '@mui/icons-material/Logout';

const AuthenticationTab = ({ user, onLogin, onLogout }) => {
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const GOOGLE_CLIENT_ID = "547128080802-vhddrapvl86p6gnrppcvbcd5s7ergnn3.apps.googleusercontent.com";

    useEffect(() => {
        if (!user) {
            initializeGoogleSignIn();
        }
    }, [user]);

    const initializeGoogleSignIn = () => {
        if (!window.google) {
            setTimeout(initializeGoogleSignIn, 100);
            return;
        }

        window.google.accounts.id.initialize({
            client_id: GOOGLE_CLIENT_ID,
            callback: handleCredentialResponse
        });

        window.google.accounts.id.renderButton(
            document.getElementById("google-signin-button"),
            { theme: "outline", size: "large" }
        );
    };

    const handleCredentialResponse = async (response) => {
        setLoading(true);
        setError(null);

        try {
            const res = await fetch('https://equipment.binghamtonsa.org/authentication.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded', // PHP standard
                },
                credentials: 'include', // Send secure cookie
                body: new URLSearchParams({ id_token: response.credential })
            });

            const data = await res.json();

            if (data.success) {
                onLogin(data.user);
            } else {
                setError("Authentication failed on backend");
            }
        } catch {
            setError("Network error verifying token");
        } finally {
            setLoading(false);
        }
    };

    const handleSignOut = async () => {
        setError(null);
        try {
            await fetch('https://equipment.binghamtonsa.org/logout.php', {
                method: 'POST',
                credentials: 'include'
            });
        } catch (e) {
            console.error("Logout fetch failed", e);
        }
        onLogout();
    };

    return (
        <Box sx={{
            p: 4,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '80vh',
            borderRadius: '24px',
            background: 'linear-gradient(135deg, rgba(0, 43, 32, 0.9) 0%, rgba(0, 90, 67, 0.8) 100%)',
            position: 'relative',
            overflow: 'hidden',
            boxShadow: 'inset 0 0 50px rgba(0,0,0,0.3)'
        }}>
            {/* Decorative background circles */}
            <Box sx={{ position: 'absolute', top: '-10%', left: '-10%', width: '30%', height: '30%', background: 'radial-gradient(circle, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0) 70%)', borderRadius: '50%' }} />
            <Box sx={{ position: 'absolute', bottom: '-15%', right: '-10%', width: '40%', height: '40%', background: 'radial-gradient(circle, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0) 70%)', borderRadius: '50%' }} />

            <Fade in={true} timeout={800}>
                <Paper sx={{
                    p: 5,
                    width: '100%',
                    maxWidth: 420,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 3,
                    backgroundColor: 'rgba(255, 255, 255, 0.08)',
                    backdropFilter: 'blur(24px)',
                    WebkitBackdropFilter: 'blur(24px)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    boxShadow: '0 30px 60px rgba(0, 0, 0, 0.4)',
                    borderRadius: '24px',
                    color: '#ffffff',
                    zIndex: 1
                }}>
                    {!user ? (
                        <>
                            <Box sx={{ p: 2, borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.1)', mb: 1 }}>
                                <LockOutlinedIcon sx={{ fontSize: 40, color: '#fff' }} />
                            </Box>
                            <Typography variant="h5" fontWeight="bold" sx={{ letterSpacing: 1 }}>Welcome</Typography>
                            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', textAlign: 'center', mb: 2 }}>
                                Please sign in to access the Equipment Management portal.
                            </Typography>
                            
                            <Box sx={{ minHeight: 44, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                {loading ? <CircularProgress size={28} sx={{ color: '#fff' }} /> : <div id="google-signin-button"></div>}
                            </Box>
                        </>
                    ) : (
                        <>
                            <Avatar src={user.picture} alt={user.name} sx={{ width: 90, height: 90, border: '4px solid rgba(255,255,255,0.4)', boxShadow: '0 8px 16px rgba(0,0,0,0.2)' }} />
                            <Typography variant="h5" fontWeight="bold" sx={{ letterSpacing: 1, mt: 1 }}>{user.name}</Typography>
                            
                            <Box sx={{ textAlign: 'center', width: '100%', bgcolor: 'rgba(0,0,0,0.2)', borderRadius: 3, p: 2, my: 2 }}>
                                <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: 1 }}>Email Address</Typography>
                                <Typography variant="body1" sx={{ fontWeight: 500, mt: 0.5, wordWrap: 'break-word' }}>{user.email}</Typography>
                            </Box>
                            
                            <Button
                                variant="contained"
                                onClick={handleSignOut}
                                startIcon={<LogoutIcon />}
                                sx={{
                                    mt: 1,
                                    width: '100%',
                                    py: 1.5,
                                    borderRadius: '12px',
                                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                                    color: '#005a43',
                                    fontWeight: 'bold',
                                    textTransform: 'none',
                                    fontSize: '1rem',
                                    boxShadow: '0 4px 14px rgba(0,0,0,0.2)',
                                    '&:hover': {
                                        backgroundColor: '#ffffff',
                                        transform: 'scale(1.02)',
                                        boxShadow: '0 6px 20px rgba(0,0,0,0.3)',
                                    },
                                    transition: 'all 0.2s ease-in-out'
                                }}
                            >
                                Sign Out Securely
                            </Button>
                        </>
                    )}

                    {error && (
                        <Alert severity="error" sx={{ width: '100%', borderRadius: 2, mt: 2 }}>
                            {error}
                        </Alert>
                    )}
                </Paper>
            </Fade>
        </Box>
    );
};

export default AuthenticationTab;
