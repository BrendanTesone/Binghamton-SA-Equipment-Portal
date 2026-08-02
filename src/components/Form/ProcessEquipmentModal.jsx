import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import Button from '@mui/material/Button';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import SmartTooltip from '../../utils/SmartTooltip';
import { getStatusColor } from '../../utils/statusUtils';

const ProcessEquipmentModal = ({ open, onClose, order, allEquipment = [], allOrders = [], refreshData }) => {
    if (!order) return null;

    const currentEquipment = order.equipment;

    const getEquipmentList = () => {
        // Filter relevant orders: Approved or Pending Approval (excluding the current one)
        const activeOrders = allOrders.filter(o =>
            (o.status === 'Approved' || o.status === 'Pending Approval') && o.id !== order.id
        );

        // Identify orders that overlap in timeframe
        const overlappingOrders = activeOrders.filter(o => {
            return o.pickup < order.dropoff && order.pickup < o.dropoff;
        });

        // Map equipment IDs to the club name that has them reserved
        const conflicts = {};
        overlappingOrders.forEach(o => {
            o.equipment.forEach(e => {
                conflicts[e.id] = o.club;
            });
        });

        // Return the master list with status flags
        return allEquipment.map(item => {
            const isUnavailable = item.status === 'In Office - Unavailable';
            const conflictClub = conflicts[item.id];
            const inCurrentOrder = currentEquipment.some(e => e.id === item.id);

            let disabledReason = "";
            if (inCurrentOrder) disabledReason = "Already added to this request";
            else if (isUnavailable) disabledReason = "Item is out of service / maintenance";
            else if (conflictClub) disabledReason = `Reserved by ${conflictClub} for this timeframe`;

            return {
                ...item,
                disabledReason
            };
        }).sort((a, b) => (a.disabledReason ? 1 : 0) - (b.disabledReason ? 1 : 0));
    };

    const displayAvailableEquipment = getEquipmentList();


    const handleAddEquipment = async (equipment) => {
        if (!order?.id) return;
        try {
            const response = await fetch('https://equipment.binghamtonsa.org/api.php?action=add_order_equipment', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    order_id: order.id,
                    equipment_id: equipment.id
                })
            });
            const res = await response.json();
            if (res.success) {
                refreshData();
            } else {
                console.error("Error adding equipment:", res.error);
                alert("Error: " + res.error);
            }
        } catch (error) {
            console.error("Network error:", error);
            alert("Network error adding equipment.");
        }
    };

    const handleDeleteEquipment = async (index) => {
        if (!order?.id) return;
        const itemToRemove = currentEquipment[index];
        if (!itemToRemove) return;

        try {
            const response = await fetch('https://equipment.binghamtonsa.org/api.php?action=remove_order_equipment', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    order_id: order.id,
                    equipment_id: itemToRemove.id
                })
            });
            const res = await response.json();
            if (res.success) {
                refreshData();
            } else {
                console.error("Error removing equipment:", res.error);
                alert("Error: " + res.error);
            }
        } catch (error) {
            console.error("Network error:", error);
            alert("Network error removing equipment.");
        }
    };

    const handleCheckAllIn = async () => {
        if (!order?.id) return;
        try {
            const response = await fetch('https://equipment.binghamtonsa.org/api.php?action=bulk_checkin', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ order_id: order.id })
            });
            const res = await response.json();
            if (res.success) {
                refreshData();
            } else {
                alert("Error: " + res.error);
            }
        } catch (error) {
            console.error("Network error:", error);
        }
    };

    const handleCheckAllOut = async () => {
        if (!order?.id) return;
        try {
            const response = await fetch('https://equipment.binghamtonsa.org/api.php?action=bulk_checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ order_id: order.id })
            });
            const res = await response.json();
            if (res.success) {
                refreshData();
            } else {
                alert("Error: " + res.error);
            }
        } catch (error) {
            console.error("Network error:", error);
        }
    };

    const handleCheckIn = async (index) => {
        const item = currentEquipment[index];
        if (!item) return;

        try {
            const response = await fetch('https://equipment.binghamtonsa.org/api.php?action=checkin_equipment', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ equipment_id: item.id })
            });
            const res = await response.json();
            if (res.success) {
                refreshData();
            } else {
                alert("Error: " + res.error);
            }
        } catch (error) {
            console.error("Network error:", error);
        }
    };

    const handleCheckOut = async (index) => {
        const item = currentEquipment[index];
        if (!item || !order?.id) return;

        try {
            const response = await fetch('https://equipment.binghamtonsa.org/api.php?action=checkout_equipment', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ equipment_id: item.id, order_id: order.id })
            });
            const res = await response.json();
            if (res.success) {
                refreshData();
            } else {
                alert("Error: " + res.error);
            }
        } catch (error) {
            console.error("Network error:", error);
        }
    };

    const hasBlockingItems = currentEquipment.some(item =>
        item.status === 'In Office - Unavailable' ||
        (item.status === 'Picked Up' && item.active_order_id && item.active_order_id !== order.id)
    );

    const canBulkCheckOut = currentEquipment.length > 0 &&
        !hasBlockingItems &&
        order.status === 'Approved' &&
        currentEquipment.some(item => item.status === 'Available');

    const canBulkCheckIn = currentEquipment.length > 0 &&
        !hasBlockingItems &&
        currentEquipment.some(item => item.status === 'Picked Up');

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="lg">
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pr: 2, bgcolor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                <DialogTitle sx={{ fontWeight: 800, color: '#1e293b' }}>Manage Equipment for {order.club}</DialogTitle>
                <Button variant="text" onClick={onClose} sx={{ minWidth: 'auto', fontWeight: 'bold', color: '#64748b' }}>X</Button>
            </Box>
            <DialogContent sx={{ p: 0, height: '70vh', display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
                {/* Left Side: Current Equipment & Checkout */}
                <Box sx={{ display: 'flex', flexDirection: 'column', borderRight: '1px solid #e2e8f0' }}>
                    <Box sx={{ p: 2, borderBottom: '1px solid #e2e8f0', bgcolor: 'white' }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                            <Typography variant="h6" sx={{ fontWeight: 700, color: '#0f172a' }}>
                                Requested Gear
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 1 }}>
                                <SmartTooltip
                                    title={order.status !== 'Approved'
                                        ? `Set order to Approved before checking out to ${order.club}`
                                        : hasBlockingItems
                                            ? `Cannot checkout: Some items are unavailable or held by another order.`
                                            : !canBulkCheckOut
                                                ? `All items are already checked out.`
                                                : ""}
                                    disabled={!canBulkCheckOut}
                                >
                                    <Button
                                        variant="contained"
                                        color="warning"
                                        size="small"
                                        onClick={handleCheckAllOut}
                                        sx={{ fontWeight: 600 }}
                                    >
                                        Check All Out
                                    </Button>
                                </SmartTooltip>

                                <SmartTooltip
                                    title={hasBlockingItems
                                        ? "Cannot check in: Some items are marked unavailable or held by another order."
                                        : !canBulkCheckIn
                                            ? "No items are currently checked out."
                                            : ""}
                                    disabled={!canBulkCheckIn}
                                >
                                    <Button
                                        variant="contained"
                                        color="success"
                                        size="small"
                                        onClick={handleCheckAllIn}
                                        sx={{ fontWeight: 600 }}
                                    >
                                        Check All In
                                    </Button>
                                </SmartTooltip>
                            </Box>
                        </Box>
                    </Box>

                    <Box sx={{ overflowY: 'auto', p: 2, flex: 1 }}>
                        {(!currentEquipment || currentEquipment.length === 0) ? (
                            <Box sx={{ textAlign: 'center', mt: 4 }}>
                                <Typography variant="body2" color="text.secondary">No equipment requested yet.</Typography>
                            </Box>
                        ) : (
                            <List sx={{ p: 0 }}>
                                {currentEquipment.map((item, index) => {
                                    const status = item.status;
                                    const canCheckOut = status === 'Available' && order?.status === 'Approved';
                                    const canCheckIn = status === 'Picked Up' || status === 'In Office - Unavailable';

                                    return (
                                        <ListItem
                                            key={index}
                                            sx={{
                                                bgcolor: 'white',
                                                mb: 1.5,
                                                borderRadius: 2,
                                                display: 'flex',
                                                flexDirection: 'column',
                                                alignItems: 'stretch',
                                                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                                                border: '1px solid #e2e8f0',
                                                p: 1.5
                                            }}
                                        >
                                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                                                <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#1e293b' }}>{item.name}</Typography>
                                                <Chip
                                                    label={status === 'Picked Up' ? `Picked Up by ${order.club}` : status}
                                                    color={getStatusColor(status)}
                                                    size="small"
                                                    variant="outlined"
                                                    sx={{ fontWeight: 600 }}
                                                />
                                            </Box>
                                            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                                                <SmartTooltip
                                                    title={order.status !== 'Approved' ? `Set order to Approved before checking out to ${order.club}` : `Item must be Available to check out to ${order.club}`}
                                                    disabled={!canCheckOut}
                                                >
                                                    <Button
                                                        size="small"
                                                        color="warning"
                                                        onClick={() => handleCheckOut(index)}
                                                        sx={{ fontWeight: 600 }}
                                                    >
                                                        Check Out
                                                    </Button>
                                                </SmartTooltip>

                                                <SmartTooltip
                                                    title="Item is already in office"
                                                    disabled={!canCheckIn}
                                                >
                                                    <Button
                                                        size="small"
                                                        color="success"
                                                        onClick={() => handleCheckIn(index)}
                                                        sx={{ fontWeight: 600 }}
                                                    >
                                                        {status === 'In Office - Unavailable' ? 'Mark Available' : 'Check In'}
                                                    </Button>
                                                </SmartTooltip>

                                                <SmartTooltip
                                                    title="Check in item before removing it from the request"
                                                    disabled={status === 'Picked Up'}
                                                >
                                                    <Button
                                                        variant="contained"
                                                        color="error"
                                                        size="small"
                                                        onClick={() => handleDeleteEquipment(index)}
                                                        sx={{ fontWeight: 600 }}
                                                    >
                                                        Remove
                                                    </Button>
                                                </SmartTooltip>
                                            </Box>
                                        </ListItem>
                                    );
                                })}
                            </List>
                        )}
                    </Box>
                </Box>

                {/* Right Side: Available Equipment to Add */}
                <Box sx={{ display: 'flex', flexDirection: 'column', bgcolor: 'white' }}>
                    <Box sx={{ p: 2, borderBottom: '1px solid #e2e8f0' }}>
                        <Typography variant="h6" sx={{ fontWeight: 700, color: '#0f172a' }}>
                            Add Equipment
                        </Typography>
                    </Box>
                    <Box sx={{ overflowY: 'auto', p: 2, flex: 1 }}>
                        <List sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                            {displayAvailableEquipment.map((item) => (
                                <ListItem
                                    key={item.id}
                                    sx={{
                                        p: 0,
                                        display: 'block'
                                    }}
                                >
                                    <Box sx={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        border: '1px solid #e2e8f0',
                                        p: 1.5,
                                        borderRadius: 2,
                                        bgcolor: item.disabledReason ? '#f1f5f9' : '#f8fafc',
                                        opacity: item.disabledReason ? 0.7 : 1,
                                        '&:hover': { bgcolor: item.disabledReason ? '#f1f5f9' : '#f1f5f9' },
                                        transition: 'background-color 0.2s'
                                    }}>
                                        <Typography variant="body2" sx={{ fontWeight: 600, color: item.disabledReason ? '#94a3b8' : '#334155' }}>
                                            {item.name}
                                        </Typography>
                                        <SmartTooltip
                                            title={item.disabledReason}
                                            disabled={Boolean(item.disabledReason)}
                                        >
                                            <Button
                                                variant="contained"
                                                size="small"
                                                onClick={() => handleAddEquipment(item)}
                                                sx={{ minWidth: 'auto', px: 2, borderRadius: 1.5 }}
                                                disabled={Boolean(item.disabledReason)}
                                            >
                                                Add
                                            </Button>
                                        </SmartTooltip>
                                    </Box>
                                </ListItem>
                            ))}
                        </List>

                    </Box>
                </Box>
            </DialogContent>
        </Dialog>
    );
};

export default ProcessEquipmentModal;
