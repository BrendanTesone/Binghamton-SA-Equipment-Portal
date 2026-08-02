
import React, { useState } from 'react';
import Box from '@mui/material/Box';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import OrderDetailsModal from './OrderDetailsModal';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogActions from '@mui/material/DialogActions';
import { getStatusColor } from '../../utils/statusUtils';

import IconButton from '@mui/material/IconButton';
import SmartTooltip from '../../utils/SmartTooltip';
import DeleteIcon from '@mui/icons-material/Delete';

import CreateEquipmentModal from './CreateEquipmentModal';
import ProcessEquipmentModal from '../Form/ProcessEquipmentModal';

const ConfirmationModal = ({ open, onClose, onConfirm, title, message }) => {
    return (
        <Dialog open={open} onClose={onClose}>
            <DialogTitle>{title}</DialogTitle>
            <DialogContent>
                <DialogContentText>{message}</DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} color="primary">Cancel</Button>
                <Button onClick={() => { onConfirm(); onClose(); }} color="error" autoFocus>
                    Confirm
                </Button>
            </DialogActions>
        </Dialog>
    );
};

const WarehouseTab = ({ initialRows: rowState = [], orders = [], refreshData }) => {
    const [rows, setRows] = useState(rowState);

    React.useEffect(() => {
        setRows(rowState);
    }, [rowState]);

    const [activeModal, setActiveModal] = useState(null); // 'create', 'process', 'details', 'delete', or null
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [itemToDelete, setItemToDelete] = useState(null);


    const handleViewOrder = (row) => {
        // Find full order details using activeOrderId if available, shouldnt be able to click button if no active order
        if (!row.activeOrderId) {
            console.log("No active order ID found for equipment:", row.name);
            return;
        }
        const fullOrder = orders.find(o => o.id === row.activeOrderId);

        setSelectedOrder(fullOrder);
        setActiveModal('details');
    };

    const handleCloseModal = () => {
        setActiveModal(null);
        setSelectedOrder(null);
        setItemToDelete(null);
    };


    const handleUpdateStatus = async (rowId, newStatus) => {
        let action = '';
        if (newStatus === 'Available') action = 'checkin_equipment';
        if (newStatus === 'In Office - Unavailable') action = 'mark_unavailable';

        if (!action) return;

        try {
            const response = await fetch('https://equipment.binghamtonsa.org/api.php?action=' + action, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ equipment_id: rowId })
            });
            const res = await response.json();
            if (res.success) {
                // Refresh data to reflect changes
                refreshData();
            } else {
                console.error("Error updating status:", res.error);
                alert("Error: " + res.error);
            }
        } catch (error) {
            console.error("Network error:", error);
        }
    };

    const handleCreateEquipment = async (newItem) => {
        try {
            const response = await fetch('https://equipment.binghamtonsa.org/api.php?action=add_equipment', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ name: newItem.name, status: newItem.status })
            });

            const res = await response.json();
            if (res.success) {
                if (refreshData) refreshData();
                handleCloseModal();
            } else {
                console.error("Error creating equipment:", res.error);
                alert("Error: " + res.error);
            }
        } catch (error) {
            console.error("Network error:", error);
            alert("Network error while creating equipment.");
        }
    };


    const confirmDelete = async () => {
        if (!itemToDelete) return;

        try {
            const response = await fetch('https://equipment.binghamtonsa.org/api.php?action=delete_equipment', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ id: itemToDelete })
            });
            const res = await response.json();
            if (res.success) {
                refreshData();
            } else {
                console.error("Error deleting:", res.error);
                alert("Error deleting: " + res.error);
            }
        } catch (error) {
            console.error("Network error:", error);
        } finally {
            handleCloseModal();
        }
    };

    return (
        <Box sx={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
            {activeModal === 'create' && (
                <CreateEquipmentModal
                    open={true}
                    onClose={handleCloseModal}
                    onSubmit={handleCreateEquipment}
                />
            )}

            {activeModal === 'process' && (
                <ProcessEquipmentModal
                    open={true}
                    onClose={handleCloseModal}
                    order={selectedOrder}
                    allEquipment={rows}
                    allOrders={orders}
                    refreshData={refreshData}
                />
            )}

            {activeModal === 'details' && (
                <OrderDetailsModal
                    open={true}
                    onClose={handleCloseModal}
                    order={selectedOrder}
                    onEditEquipment={(order) => { setSelectedOrder(order); setActiveModal('process'); }}
                />
            )}

            {activeModal === 'delete' && (
                <ConfirmationModal
                    open={true}
                    onClose={handleCloseModal}
                    onConfirm={confirmDelete}
                    title="Confirm Deletion"
                    message="Are you sure you want to delete this equipment? This action cannot be undone."
                />
            )}

            <Box sx={{ p: 2, bgcolor: 'background.paper' }}>
                <Button
                    color="primary"
                    fullWidth
                    sx={{ py: 1.5, fontSize: '1rem', fontWeight: 'bold' }}
                    onClick={() => setActiveModal('create')}
                >
                    Add New Equipment
                </Button>
            </Box>

            <TableContainer component={Paper} elevation={3} sx={{ flexGrow: 1 }}>
                <Table stickyHeader sx={{ minWidth: 650 }} aria-label="warehouse equipment table">
                    <TableHead>
                        <TableRow>
                            <TableCell>Equipment Name</TableCell>
                            <TableCell>Equipment Status</TableCell>
                            <TableCell>Current Active Club</TableCell>
                            <TableCell align="center" sx={{ minWidth: 300 }}>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {rows.sort((a, b) => {
                            const priority = { 'Picked Up': 0, 'Available': 1, 'In Office - Unavailable': 2 };
                            return (priority[a.status] ?? 3) - (priority[b.status] ?? 3);//any other status shouldnt be possible
                        }).map((row) => (
                            <TableRow
                                key={row.id}
                            >
                                <TableCell sx={{ borderRight: '1px solid rgba(224, 224, 224, 0.4)' }}>
                                    {row.name}
                                </TableCell>
                                <TableCell sx={{ borderRight: '1px solid rgba(224, 224, 224, 0.4)' }}>
                                    <Chip
                                        label={row.status}
                                        color={getStatusColor(row.status)}
                                        variant="outlined"
                                        size="small"
                                    />
                                </TableCell>
                                <TableCell sx={{ borderRight: '1px solid rgba(224, 224, 224, 0.4)' }}>
                                    {row.status === 'Picked Up' ? row.club : '-'}
                                </TableCell>
                                <TableCell>
                                    <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: 1, width: '100%' }}>
                                        <SmartTooltip
                                            title={row.status !== 'Picked Up' ? "Item is not currently checked out" : ""}
                                            disabled={row.status !== 'Picked Up'}
                                        >
                                            <Button
                                                size="small"
                                                fullWidth
                                                sx={{ whiteSpace: 'nowrap' }}
                                                onClick={() => handleViewOrder(row)}
                                            >
                                                View Order
                                            </Button>
                                        </SmartTooltip>

                                        <SmartTooltip
                                            title={row.status === 'Available' ? "Item is already in office and available" : ""}
                                            disabled={row.status === 'Available'}
                                        >
                                            <Button
                                                size="small"
                                                color="success"
                                                fullWidth
                                                sx={{ whiteSpace: 'nowrap' }}
                                                onClick={() => handleUpdateStatus(row.id, 'Available')}
                                            >
                                                {row.status === 'In Office - Unavailable' ? 'Mark Available' : 'Check In'}
                                            </Button>
                                        </SmartTooltip>

                                        <SmartTooltip
                                            title={row.status === 'Picked Up'
                                                ? "Check in item before marking as unavailable"
                                                : row.status === 'In Office - Unavailable'
                                                    ? "Item is already marked unavailable"
                                                    : ""}
                                            disabled={row.status !== 'Available'}
                                        >
                                            <Button
                                                size="small"
                                                color="error"
                                                fullWidth
                                                sx={{ whiteSpace: 'nowrap' }}
                                                onClick={() => handleUpdateStatus(row.id, 'In Office - Unavailable')}
                                            >
                                                Mark Unavailable
                                            </Button>
                                        </SmartTooltip>

                                        <SmartTooltip
                                            title="Cannot delete checked out equipment"
                                            disabled={row.status === 'Picked Up'}
                                        >
                                            <IconButton
                                                size="small"
                                                color="error"
                                                onClick={() => { setItemToDelete(row.id); setActiveModal('delete'); }}
                                            >
                                                <DeleteIcon />
                                            </IconButton>
                                        </SmartTooltip>
                                    </Box>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
};

export default WarehouseTab;
