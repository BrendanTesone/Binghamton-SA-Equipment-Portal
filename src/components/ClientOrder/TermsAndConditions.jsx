import { Box, Typography, Grid, TextField } from '@mui/material';

const TermsAndConditions = ({ contactName, handleDetailChange }) => {
    return (
        <Box>
            <Typography variant="h6" color="text.primary" gutterBottom sx={{ fontWeight: 'bold', mb: 2 }}>
                Terms and Conditions
            </Typography>

            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                By signing your name, you acknowledge the following terms and conditions:
            </Typography>

            <Box component="ol" sx={{ color: 'text.secondary', fontSize: '0.875rem', pl: 3, mb: 4, '& li': { mb: 1.5 } }}>
                <li>All requests for equipment must be made at least <b>3 days in advance</b> of the event.</li>
                <li>All equipment and accessories must be returned to the <b>Executive Vice President</b> within <b>24 hours</b> of the conclusion of the day it was used (or by <b>5:00 PM on Monday</b> if used on a Friday or Saturday).</li>
                <li>Equipment must be returned in the <b>exact state</b> it was in prior to being rented out.</li>
                <li>The borrowing organization will be held <b>liable</b> if equipment is returned physically damaged, non-functional, or not returned within the specified timeframe.</li>
                <li>Consequences of liability include <b>money being deducted</b> from the club’s budget for repairs or replacements, and potential <b>suspension</b> from future borrowing at the discretion of the Executive Vice President.</li>
            </Box>

            <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                    <TextField
                        fullWidth
                        required
                        label="Digital Signature (Type Full Name)"
                        name="contactName"
                        value={contactName}
                        onChange={handleDetailChange}
                        variant="outlined"
                        helperText="By typing your name, you acknowledge you have read and agree to the terms above."
                    />
                </Grid>
            </Grid>
        </Box>
    );
};


export default TermsAndConditions;
