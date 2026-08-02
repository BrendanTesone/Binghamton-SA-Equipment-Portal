import { Box } from '@mui/material';
import Sidebar from './Sidebar';
import { Outlet } from 'react-router-dom';

const MainLayout = ({ role }) => {
    return (
        <Box sx={{ display: 'flex' }}>
            <Sidebar role={role} />
            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    p: '2vw',
                    width: '80vw', // Ensures main wrapper doesn't push past viewport
                    boxSizing: 'border-box',
                    overflowX: 'hidden'
                }}
            >
                <Outlet />
            </Box>
        </Box>
    );
};

export default MainLayout;
