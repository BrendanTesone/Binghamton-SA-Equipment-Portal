import { useCallback } from 'react';
import { Box, TextField, Grid, Typography } from '@mui/material';

const DateRangePicker = ({
  startDate,
  setStartDate,
  endDate,
  setEndDate,
}) => {
  const todayString = new Date().toLocaleDateString('en-CA');

  const handleStartDateChange = useCallback((newDateStr) => {
    if (newDateStr < todayString) {
      newDateStr = todayString;
    }

    let date = new Date(newDateStr + 'T00:00:00');
    const day = date.getDay();

    if (day === 0) {
      date.setDate(date.getDate() - 2);
      alert("Cannot set pickup date on a Weekend")
    } else if (day === 6) {
      date.setDate(date.getDate() - 1);
      alert("Cannot set pickup date on a Weekend")
    }

    const adjustedStart = date.toLocaleDateString('en-CA');
    setStartDate(adjustedStart);

    if (endDate && adjustedStart >= endDate) {
      const nextDay = new Date(date);
      nextDay.setDate(nextDay.getDate() + 1);
      const nextDayNum = nextDay.getDay();
      if (nextDayNum === 6) nextDay.setDate(nextDay.getDate() + 2);
      else if (nextDayNum === 0) nextDay.setDate(nextDay.getDate() + 1);
      setEndDate(nextDay.toLocaleDateString('en-CA'));
    }
  }, [endDate, setStartDate, setEndDate, todayString]);

  const handleEndDateChange = useCallback((newDateStr) => {
    let date = new Date(newDateStr + 'T00:00:00');
    const day = date.getDay();

    if (day === 0) {
      date.setDate(date.getDate() + 1);
      alert("Cannot set dropoff date on a Weekend")
    } else if (day === 6) {
      date.setDate(date.getDate() + 2);
      alert("Cannot set dropoff date on a Weekend")
    }

    const adjustedEnd = date.toLocaleDateString('en-CA');

    if (startDate && adjustedEnd <= startDate) {
      const start = new Date(startDate + 'T00:00:00');
      const nextDay = new Date(start);
      nextDay.setDate(nextDay.getDate() + 1);
      const nextDayNum = nextDay.getDay();
      if (nextDayNum === 6) nextDay.setDate(nextDay.getDate() + 2);
      else if (nextDayNum === 0) nextDay.setDate(nextDay.getDate() + 1);
      setEndDate(nextDay.toLocaleDateString('en-CA'));
    } else {
      setEndDate(adjustedEnd);
    }
  }, [startDate, setEndDate]);

  return (
    <Box
      sx={{
        p: 3,
        borderRadius: 2,
        boxShadow: 3,
        bgcolor: 'white'
      }}
    >
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            id="startDate"
            label="Pickup Date"
            type="date"
            value={startDate}
            onChange={(e) => handleStartDateChange(e.target.value)}
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
            id="endDate"
            label="Dropoff Date"
            type="date"
            value={endDate}
            onChange={(e) => handleEndDateChange(e.target.value)}
            variant="outlined"
            slotProps={{
              inputLabel: {
                shrink: true
              }
            }}
          />
        </Grid>
      </Grid>
    </Box>
  );
};

export default DateRangePicker;