import { Box, Typography, Grid, TextField, Autocomplete, Divider, Paper } from '@mui/material';


const ClientOrderForm = ({
    orderDetails,
    handleDetailChange,
    onClubChange,
    clubOptions
}) => {
    return (
        <Paper elevation={0} sx={{ p: 4, border: '1px solid', borderColor: 'divider' }}>
            <Typography variant="h6" color="text.primary" gutterBottom sx={{ fontWeight: 'bold', mb: 2 }}>
                Contact & Organization
            </Typography>
            <Grid container spacing={4}>

                <Grid item xs={12} sm={6}>
                    <TextField
                        fullWidth
                        label="Email Address"
                        name="email"
                        value={orderDetails.email}
                        onChange={handleDetailChange}
                        variant="outlined"
                    />
                </Grid>

                <Grid item xs={12} sm={6} width={"200px"}>
                    <Autocomplete
                        freeSolo
                        options={clubOptions}
                        value={orderDetails.clubName}
                        onChange={onClubChange}
                        onInputChange={onClubChange}
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                label="Club / Organization Name"
                                name="clubName"
                                variant="outlined"
                                fullWidth
                            />
                        )}
                    />
                </Grid>
                <Grid item xs={12} sm={6}>
                    <TextField
                        fullWidth
                        label="Club Account Number"
                        name="clubAccountNumber"
                        value={orderDetails.clubAccountNumber}
                        onChange={handleDetailChange}
                        variant="outlined"
                    />
                </Grid>
            </Grid>

            <Divider sx={{ my: 4 }} />

            <Typography variant="h6" color="text.primary" gutterBottom sx={{ fontWeight: 'bold', mb: 2 }}>
                Event Details
            </Typography>
            <Grid container spacing={4}>
                <Grid item xs={12} sm={6}>
                    <TextField
                        fullWidth
                        label="Event Name"
                        name="eventName"
                        value={orderDetails.eventName}
                        onChange={handleDetailChange}
                        variant="outlined"
                    />
                </Grid>
                <Grid item xs={12} sm={6}>
                    <TextField
                        fullWidth
                        label="Event Date"
                        type="date"
                        name="eventDate"
                        value={orderDetails.eventDate}
                        onChange={handleDetailChange}
                        variant="outlined"
                        slotProps={{
                            inputLabel: {
                                shrink: true
                            }
                        }}
                    />
                </Grid>
                <Grid item xs={12} sm={6}>
                    <TextField
                        fullWidth
                        label="Location"
                        name="location"
                        value={orderDetails.location}
                        onChange={handleDetailChange}
                        variant="outlined"

                    />
                </Grid>
                <Grid item xs={12} sm={6}>
                    <TextField
                        fullWidth
                        label="Event Time (e.g. 5pm - 9pm)"
                        name="timespan"
                        value={orderDetails.timespan}
                        onChange={handleDetailChange}
                        variant="outlined"
                    />
                </Grid>
                <Grid item xs={12}>
                    <TextField
                        fullWidth
                        label="B-Engaged Event Link"
                        name="bEngagedLink"
                        value={orderDetails.bEngagedLink}
                        onChange={handleDetailChange}
                        variant="outlined"
                        placeholder="https://..."
                    />
                </Grid>
            </Grid>


        </Paper>
    );
};

export default ClientOrderForm;
