import { Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Box, Divider, Typography } from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';
import DashboardIcon from '@mui/icons-material/Dashboard';
import InventoryIcon from '@mui/icons-material/Inventory';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import NumbersIcon from '@mui/icons-material/Numbers';
import LockIcon from '@mui/icons-material/Lock';

const Sidebar = ({ role }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const DRAWER_WIDTH = '20vw';

    const menuItems = [
        { text: 'Process Forms', icon: <DashboardIcon />, path: '/process-forms', roles: ['admin'] },
        { text: 'Equipment List', icon: <InventoryIcon />, path: '/equipment-list', roles: ['admin'] },
        { text: 'Club Equipment Order', icon: <ShoppingCartIcon />, path: '/client-order', roles: ['admin', 'client'] },
        { text: 'Admin Access', icon: <AdminPanelSettingsIcon />, path: '/admin-control', roles: ['admin'] },
        { text: 'Account Numbers', icon: <NumbersIcon />, path: '/account-numbers', roles: ['admin'] },
        { text: role === 'unlogged' ? 'Sign In' : 'Sign Out', icon: <LockIcon />, path: '/auth', roles: ['admin', 'client', 'unlogged'] },
    ];

    const filteredItems = menuItems.filter(item => item.roles.includes(role));

    return (
        <Drawer
            variant="permanent"
            sx={{
                width: DRAWER_WIDTH,
                flexShrink: 0,
                '& .MuiDrawer-paper': {
                    width: DRAWER_WIDTH,
                    backgroundColor: '#005a43', // Primary Main
                    color: '#ffffff',
                    borderRight: '1px solid rgba(255, 255, 255, 0.1)',
                },
            }}
        >
            {/* Logo Section */}
            <Box sx={{ p: 1, textAlign: 'center' }}>
                <img
                    src="/SA General Logo No Background.png"
                    alt="Logo"
                    style={{ width: '80%', maxWidth: '90px', marginBottom: '8px' }}
                />
                <Typography variant="h6" fontWeight="bold" sx={{ display: 'block', whiteSpace: 'normal', lineHeight: 1.2 }}>
                    Equipment Management
                </Typography>
            </Box>

            <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.1)', mb: 2 }} />

            <List sx={{ px: 2 }}>
                {filteredItems.map((item) => {
                    const isActive = location.pathname === item.path || (item.path === '/auth' && location.pathname === '/');
                    return (
                        <ListItem key={item.text} disablePadding sx={{ mb: 1 }}>
                            <ListItemButton
                                onClick={() => navigate(item.path)}
                                sx={{
                                    borderRadius: '8px',
                                    backgroundColor: isActive ? 'rgba(255, 255, 255, 0.2)' : 'transparent',
                                    '&:hover': {
                                        backgroundColor: 'rgba(255, 255, 255, 0.1)',
                                    },
                                    display: 'flex',
                                    alignItems: 'center',
                                    py: 1.5,
                                }}
                            >
                                <ListItemIcon sx={{ color: '#fff', minWidth: '40px' }}>
                                    {item.icon}
                                </ListItemIcon>
                                <ListItemText
                                    primary={item.text}
                                    sx={{ m: 0 }}
                                    slotProps={{
                                        primary: {
                                            sx: {
                                                fontWeight: isActive ? 'bold' : 'normal',
                                                whiteSpace: 'normal', // Allow multi-line text
                                                wordBreak: 'break-word',
                                                lineHeight: 1.2,
                                                color: '#fff'
                                            }
                                        }
                                    }}
                                />
                            </ListItemButton>
                        </ListItem>
                    );
                })}
            </List>
        </Drawer>
    );
};

export default Sidebar;
