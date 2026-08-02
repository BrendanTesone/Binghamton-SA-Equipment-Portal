import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';

import Chip from '@mui/material/Chip';

const DetailItem = ({ label, value, href }) => (
    <Grid item xs={12} sm={6}>
        <Typography variant="subtitle2" color="text.secondary">{label}</Typography>
        {href ? (
            <Typography variant="body1" component="a" href={href} target="_blank" rel="noopener noreferrer" sx={{ color: 'primary.main', textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}>
                {value}
            </Typography>
        ) : (
            <Typography variant="body1">{value}</Typography>
        )}
    </Grid>
);

const DetailSection = ({ title, action, children }) => {
    return (
        <Grid item xs={12}>
            <Paper elevation={1} sx={{ p: 2, bgcolor: 'white', borderRadius: 2, border: '1px solid #e2e8f0' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6" color="text.primary" sx={{ fontWeight: 'bold', mb: 0 }}>
                        {title}
                    </Typography>
                    {action}
                </Box>
                <Grid container spacing={2}>
                    {children}
                </Grid>
            </Paper>
        </Grid>
    );
};

const OrderDetailsModal = ({ open, onClose, order }) => {
    if (!order) return null;

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pr: 2, bgcolor: 'white', borderBottom: '1px solid #e2e8f0' }}>
                <DialogTitle sx={{ fontWeight: 'bold' }}>Order Details</DialogTitle>
                <Button variant="text" onClick={onClose} sx={{ minWidth: 'auto', fontWeight: 'bold', color: 'text.primary' }}>X</Button>
            </Box>
            <DialogContent dividers sx={{ bgcolor: 'white' }}>
                <Grid container spacing={3}>
                    <DetailSection title="Contact Information">
                        <DetailItem label="Club Name" value={order.club} />
                        <DetailItem label="Club Number" value={order.accountNumber} />
                        <DetailItem label="Signed Off By" value={order.signedOffBy} />
                        <DetailItem label="Email" value={order.email} href={`mailto:${order.email}`} />
                    </DetailSection>

                    <DetailSection title="Event Details">
                        <DetailItem label="Date" value={order.dateOfEvent} />
                        <DetailItem label="Location" value={order.location} />
                        <DetailItem label="Timespan" value={order.timespan} />
                        <DetailItem label="Event Link" value="View Event" href={order.bEngagedLink} />
                    </DetailSection>

                    <DetailSection title="Logistics (Pickup / Dropoff)">
                        <DetailItem label="Pickup Date" value={order.pickup.toLocaleString()} />
                        <DetailItem label="Dropoff Date" value={order.dropoff.toLocaleString()} />
                    </DetailSection>

                    <DetailSection title="Equipment List">
                        <Grid item xs={12}>
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                {(order.equipment || []).map((item) => (
                                    <Chip
                                        key={item.id}
                                        label={item.name}
                                        variant="outlined"
                                        sx={{ bgcolor: 'white' }}
                                    />
                                ))}
                            </Box>
                        </Grid>
                    </DetailSection>
                </Grid>
            </DialogContent>
        </Dialog>
    );
};

export default OrderDetailsModal;
