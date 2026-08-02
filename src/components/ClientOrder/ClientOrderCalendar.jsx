import React from 'react';
import { Box, Typography, Grid, TextField, MenuItem, Paper } from '@mui/material';
import EquipmentTable from './equipmentTable';
import DateRangePicker from './dateRangePicker';

const ClientOrderCalendar = ({
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    orderDetails,
    handleDetailChange,
    adminData,
    checkedIds,
    onCheckChange
}) => {

    // Generate time options from 5:00 AM to 12:00 AM (Next Day/Midnight)
    const timeOptions = [];
    for (let i = 5; i <= 24; i++) {
        let label = '';
        if (i < 12) label = `${i}:00 AM`;
        else if (i === 12) label = `12:00 PM`;
        else if (i < 24) label = `${i - 12}:00 PM`;
        else label = `12:00 AM`;
        timeOptions.push(label);
    }



    return (
        <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 4 }}>

            <DateRangePicker
                startDate={startDate}
                setStartDate={setStartDate}
                endDate={endDate}
                setEndDate={setEndDate}
            />

            <EquipmentTable
                adminData={adminData}
                startDate={startDate}
                endDate={endDate}
                checkedIds={checkedIds}
                onCheckChange={onCheckChange}
            />

            <Paper elevation={0} sx={{ p: 4, border: '1px solid', borderColor: 'divider' }}>
                <Typography variant="h6" color="text.primary" gutterBottom sx={{ fontWeight: 'bold', mb: 2 }}>
                    Equipment Logistics
                </Typography>
                <Grid container spacing={4}>
                    <Grid item xs={12} sm={6}>
                        <Typography variant="subtitle2" color="text.primary" gutterBottom>
                            Pickup Date: {startDate || 'Not selected'}
                        </Typography>
                        <TextField
                            select
                            fullWidth
                            label="Pickup Time"
                            name="pickupTime"
                            value={orderDetails.pickupTime}
                            onChange={handleDetailChange}
                            variant="outlined"
                        >
                            {timeOptions.map((option) => (
                                <MenuItem key={`pickup-${option}`} value={option}>
                                    {option}
                                </MenuItem>
                            ))}
                        </TextField>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <Typography variant="subtitle2" color="text.primary" gutterBottom>
                            Return Date: {endDate || 'Not selected'}
                        </Typography>
                        <TextField
                            select
                            fullWidth
                            label="Dropoff Time"
                            name="dropoffTime"
                            value={orderDetails.dropoffTime}
                            onChange={handleDetailChange}
                            variant="outlined"
                        >
                            {timeOptions.map((option) => (
                                <MenuItem key={`dropoff-${option}`} value={option}>
                                    {option}
                                </MenuItem>
                            ))}
                        </TextField>
                    </Grid>
                </Grid>
            </Paper>

        </Box>
    );
};

export default ClientOrderCalendar;
