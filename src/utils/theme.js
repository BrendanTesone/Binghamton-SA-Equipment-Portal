import { createTheme } from '@mui/material/styles';

const theme = createTheme({
    palette: {
        primary: {
            main: '#005a43', // Custom main color
            light: '#337b69', // Lighter shade for hover/accents
            dark: '#003e2e',  // Darker shade for active states
            contrastText: '#ffffff',
        },
        secondary: {
            main: '#be123c', // Dark red / Rose-700
        },
        warning: {
            main: '#d97706', // Orange / Amber-600
            contrastText: '#ffffff',
        },
        error: {
            main: '#be123c', // Dark red / Rose-700
            contrastText: '#ffffff',
        },
        background: {
            default: '#ffffff',
            level1: '#f5f5f5', // Light gray for content areas
            paper: '#ffffff',
        },
        success: {
            main: '#005a43', // Custom primary green
            light: '#337b69',
            dark: '#003e2e',
            contrastText: '#ffffff',
        },
    },
    typography: {
        // You can centralize font settings here if needed
        fontWeightBold: 700,
    },
    components: {
        MuiCssBaseline: {
            styleOverrides: {
                body: {
                    backgroundColor: '#ffffff', // Ensure body is neutral
                }
            }
        },
        MuiButton: {
            defaultProps: {
                variant: 'contained',
            },
            styleOverrides: {
                root: {
                    borderRadius: 8,
                    textTransform: 'none',
                    fontWeight: 'bold',
                },
            },
        },
        MuiChip: {
            defaultProps: {
                variant: 'outlined',
            },
            styleOverrides: {
                root: {
                    fontWeight: 'bold',
                },
            },
        },
        MuiTableHead: {
            styleOverrides: {
                root: {
                    backgroundColor: '#f5f5f5', // Matches palette.background.level1
                    '& .MuiTableCell-root': {
                        fontWeight: 'bold',
                        color: 'rgba(0, 0, 0, 0.87)',
                    },
                },
            },
        },
        MuiTableCell: {
            styleOverrides: {
                head: {
                    fontWeight: 'bold',
                    backgroundColor: '#f5f5f5',
                },
                root: {
                    padding: '8px 16px', // Standardize padding
                },
            },
        },
        MuiTabs: {
            styleOverrides: {
                indicator: {
                    backgroundColor: '#ffffff',
                },
            },
        },
        MuiTab: {
            styleOverrides: {
                root: {
                    fontWeight: 'bold',
                    textTransform: 'none',
                    color: 'rgba(255, 255, 255, 0.7)',
                    '&.Mui-selected': {
                        color: '#ffffff',
                    },
                },
            },
        },
    },
});

export default theme;
