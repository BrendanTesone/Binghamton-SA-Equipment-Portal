import React, { useState } from 'react';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Fade from '@mui/material/Fade';
import SmartTooltip from '../../utils/SmartTooltip';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import CloseIcon from '@mui/icons-material/Close';

const STATUS_CONFIG = {
    'Pending Approval': {
        id: 'Pending Approval',
        color: '#d97706', // amber-600
        bg: '#fffbeb', // amber-50
        icon: AccessTimeIcon,
        label: 'Pending',
        unselectable: true
    },
    'Approved': {
        id: 'Approved',
        color: '#2563eb', // blue-600
        bg: '#eff6ff', // blue-50
        icon: CheckCircleOutlineIcon,
        label: 'Approved'
    },
    'Denied': {
        id: 'Denied',
        color: '#e11d48', // rose-600
        bg: '#fff1f2', // rose-50
        icon: CancelIcon,
        label: 'Denied'
    },
    'Completed': {
        id: 'Completed',
        color: '#059669', // emerald-600
        bg: '#ecfdf5', // emerald-50
        icon: CheckCircleIcon,
        label: 'Completed'
    }
};



const ApprovalStatusSelector = ({ currentStatus, onStatusChange }) => {
    const [pending, setPending] = useState(null);

    const isTerminal = currentStatus === 'Denied' || currentStatus === 'Completed';

    const handleSelect = (id) => {
        if (id === currentStatus || STATUS_CONFIG[id]?.unselectable || isTerminal) return;
        setPending(id);
    };

    const confirmChange = () => {
        onStatusChange(pending);
        setPending(null);
    };

    const cancelChange = () => {
        setPending(null);
    };

    return (
        <Box sx={{ position: 'relative', width: 150, height: 150, mb: 2, mt: 1, mr: 2 }}>

            <Paper
                elevation={1}
                sx={{
                    width: '100%',
                    height: '100%',
                    borderRadius: 2,
                    overflow: 'hidden',
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: 0.5,
                    p: 0.5,
                    transition: 'all 0.3s',
                    opacity: pending ? 0 : 1,
                    transform: pending ? 'scale(0.9)' : 'scale(1)',
                    filter: pending ? 'blur(2px)' : 'none'
                }}
            >
                {Object.values(STATUS_CONFIG).map((cfg) => {
                    const isActive = currentStatus === cfg.id;
                    const Icon = cfg.icon;

                    const isPendingRevert = cfg.id === 'Pending Approval' && currentStatus !== 'Pending Approval';
                    const isLockedByTerminal = isTerminal && !isActive;
                    const isDisabled = isPendingRevert || isLockedByTerminal;

                    let tooltipTitle = "";
                    if (isLockedByTerminal) {
                        tooltipTitle = `Cannot change status of a ${currentStatus} order`;
                    } else if (isPendingRevert) {
                        tooltipTitle = "Admin cannot revert status back to pending";
                    }

                    return (
                        <SmartTooltip
                            key={cfg.id}
                            title={tooltipTitle}
                            disabled={isDisabled}
                        >
                            <Box
                                component="button"
                                disabled={isDisabled}
                                onClick={() => handleSelect(cfg.id)}
                                sx={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    border: 'none',
                                    width: '100%',
                                    height: '100%',
                                    bgcolor: isActive ? cfg.bg : 'transparent',
                                    color: isActive ? cfg.color : (isLockedByTerminal ? '#cbd5e1' : '#94a3b8'), // slate-400 or slate-300
                                    opacity: isLockedByTerminal ? 0.35 : 1,
                                    borderRadius: 1,
                                    cursor: isDisabled ? 'not-allowed' : (cfg.unselectable ? 'default' : 'pointer'),
                                    transition: 'all 0.2s',
                                    aspectRatio: '1/1',
                                    boxShadow: isActive ? `inset 0 0 0 1px ${cfg.color}33` : 'none',
                                    '&:hover': {
                                        bgcolor: !isActive && !isDisabled && !cfg.unselectable ? '#f8fafc' : undefined,
                                        color: !isActive && !isDisabled && !cfg.unselectable ? '#475569' : undefined
                                    },
                                    '&:disabled': {
                                        opacity: isLockedByTerminal ? 0.35 : 0.6,
                                        cursor: 'not-allowed'
                                    }
                                }}
                            >
                                <Icon sx={{ fontSize: 20, strokeWidth: isActive ? 2 : 1 }} />
                                <Typography sx={{ fontSize: '0.6rem', fontWeight: 'bold', mt: 0.5, textTransform: 'uppercase', lineHeight: 1 }}>
                                    {cfg.label}
                                </Typography>
                            </Box>
                        </SmartTooltip>
                    );
                })}
            </Paper>

            {/* Overlay */}
            {pending && (
                <Fade in={!!pending}>
                    <Box
                        sx={{
                            position: 'absolute',
                            inset: 0,
                            bgcolor: '#ffffff', // white
                            borderRadius: 2,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            p: 1,
                            zIndex: 10,
                            color: '#1e293b', // slate-800
                            border: '1px solid #e2e8f0' // slate-200 border
                        }}
                    >
                        <Box sx={{ mb: 1, textAlign: 'center' }}>
                            <Typography sx={{ fontSize: '0.6rem', color: '#64748b', fontWeight: 900, letterSpacing: 1, textTransform: 'uppercase' }}>
                                Confirm
                            </Typography>
                            <Typography sx={{ fontSize: '0.65rem', fontWeight: 'bold', textTransform: 'uppercase' }}>
                                Status Change To "{STATUS_CONFIG[pending]?.label}"?
                            </Typography>
                        </Box>

                        <Box sx={{ display: 'flex', gap: 1, width: '100%' }}>
                            <Box
                                component="button"
                                onClick={cancelChange}
                                sx={{
                                    flex: 1,
                                    height: 24,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    borderRadius: 1,
                                    border: '1px solid #cbd5e1', // slate-300
                                    bgcolor: 'transparent',
                                    color: '#64748b', // slate-500
                                    cursor: 'pointer',
                                    '&:hover': { bgcolor: '#f1f5f9' } // slate-100
                                }}
                            >
                                <CloseIcon sx={{ fontSize: 16 }} />
                            </Box>
                            <Box
                                component="button"
                                onClick={confirmChange}
                                sx={{
                                    flex: 1,
                                    height: 24,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    borderRadius: 1,
                                    border: 'none',
                                    bgcolor: STATUS_CONFIG[pending]?.color,
                                    color: 'white',
                                    fontWeight: 'bold',
                                    fontSize: '0.65rem',
                                    cursor: 'pointer',
                                    boxShadow: 2,
                                    '&:hover': { opacity: 0.9 },
                                    '&:active': { transform: 'scale(0.95)' }
                                }}
                            >
                                YES
                            </Box>
                        </Box>
                    </Box>
                </Fade>
            )}
        </Box>
    );
};

export default ApprovalStatusSelector;