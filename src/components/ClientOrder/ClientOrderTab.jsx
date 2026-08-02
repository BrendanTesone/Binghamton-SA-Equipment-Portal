import React, { useState, useEffect } from 'react';
import { Box, Button, Paper } from '@mui/material';
import ClientOrderForm from './ClientOrderForm';
import TermsAndConditions from './TermsAndConditions';
import ClientOrderCalendar from './ClientOrderCalendar';
import { clubData } from './clubData';

const ClientOrderTab = ({ adminData, user, refreshData }) => {
    const [orderDetails, setOrderDetails] = useState({
        contactName: '',
        email: '',
        clubName: '',
        clubAccountNumber: '',
        eventName: '',
        location: '',
        eventDate: '',
        timespan: '',
        bEngagedLink: '',
        pickupTime: '',
        dropoffTime: ''
    });

    useEffect(() => {
        if (user) {
            const userEmail = user.email || '';
            const matchingClub = clubData.find(c => c.email && c.email.toLowerCase() === userEmail.toLowerCase());

            setOrderDetails(prev => ({
                ...prev,
                email: userEmail || prev.email,
                clubName: matchingClub ? matchingClub.name : prev.clubName,
                clubAccountNumber: matchingClub ? matchingClub.id : prev.clubAccountNumber
            }));
        }
    }, [user]);

    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [checkedIds, setCheckedIds] = useState(new Set());

    const handleDetailChange = (e) => {
        const { name, value } = e.target;
        setOrderDetails(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const onClubChange = (event, value) => {
        const clubName = value || '';
        const foundClub = clubData.find(c => c.name === clubName);
        const foundId = foundClub ? foundClub.id : '';

        setOrderDetails(prev => ({
            ...prev,
            clubName: clubName,
            clubAccountNumber: foundId || prev.clubAccountNumber
        }));
    };

    const handleSubmit = () => {
        const missingFields = [];

        if (!startDate) missingFields.push("Pickup Date");
        if (!endDate) missingFields.push("Dropoff Date");

        if (!orderDetails.contactName) missingFields.push("Contact Name");
        if (!orderDetails.email) missingFields.push("Email Address");
        if (!orderDetails.clubName) missingFields.push("Club Name");
        if (!orderDetails.clubAccountNumber) missingFields.push("Club Account Number");

        if (!orderDetails.eventName) missingFields.push("Event Name");
        if (!orderDetails.eventDate) missingFields.push("Event Date");
        if (!orderDetails.location) missingFields.push("Location");
        if (!orderDetails.timespan) missingFields.push("Event Time");
        if (!orderDetails.bEngagedLink) missingFields.push("B-Engaged Link");

        if (!orderDetails.pickupTime) missingFields.push("Pickup Time");
        if (!orderDetails.dropoffTime) missingFields.push("Dropoff Time");

        if (checkedIds.size === 0) missingFields.push("At least one equipment item");

        if (missingFields.length > 0) {
            alert("Please fill out the following required fields before submitting:\n\n- " + missingFields.join("\n- "));
            return;
        }

        const parseDateTime = (dateStr, timeStr) => {
            if (!dateStr || !timeStr) return null;
            const d = new Date(dateStr + 'T00:00:00');

            const [time, modifier] = timeStr.split(' ');
            let [hours, minutes] = time.split(':');

            if (hours === '12') {
                hours = '00';
            }
            if (modifier === 'PM') {
                hours = parseInt(hours, 10) + 12;
            }

            d.setHours(hours);
            d.setMinutes(minutes);
            return d;
        };

        const pickupDateObj = parseDateTime(startDate, orderDetails.pickupTime);
        const dropoffDateObj = parseDateTime(endDate, orderDetails.dropoffTime);

        const formatLocalMySQL = (d) => {
            if (!d) return '';
            const pad = (n) => n.toString().padStart(2, '0');
            return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:00`;
        };

        // Prepare Payload
        const payload = {
            club_name: orderDetails.clubName,
            signed_name: orderDetails.contactName,
            email: orderDetails.email,
            club_account_number: orderDetails.clubAccountNumber,
            event_date: orderDetails.eventDate,
            location: orderDetails.location,
            b_engaged_link: orderDetails.bEngagedLink,
            timespan_description: orderDetails.timespan,
            start_date: formatLocalMySQL(pickupDateObj), // MySQL DATETIME natively local
            end_date: formatLocalMySQL(dropoffDateObj),  // MySQL DATETIME natively local
            equipment_ids: Array.from(checkedIds).join(',')
        };

        fetch('https://equipment.binghamtonsa.org/api.php?action=create_order', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify(payload),
        })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    alert("Order successfully created!");
                    
                    // Reset form state to initial
                    setOrderDetails({
                        contactName: '',
                        email: user ? user.email : '',
                        clubName: '',
                        clubAccountNumber: '',
                        eventName: '',
                        location: '',
                        eventDate: '',
                        timespan: '',
                        bEngagedLink: '',
                        pickupTime: '',
                        dropoffTime: ''
                    });
                    setStartDate('');
                    setEndDate('');
                    setCheckedIds(new Set());

                    if (refreshData) refreshData();
                } else {
                    alert("Error creating order: " + data.error);
                }
            })
            .catch((error) => {
                console.error('Error:', error);
                alert("An error occurred while submitting the order.");
            });
    };

    const clubOptions = clubData.map(c => c.name);

    return (
        <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 4 }}>
            <ClientOrderForm
                orderDetails={orderDetails}
                handleDetailChange={handleDetailChange}
                onClubChange={onClubChange}
                clubOptions={clubOptions}
            />

            <ClientOrderCalendar
                startDate={startDate}
                setStartDate={setStartDate}
                endDate={endDate}
                setEndDate={setEndDate}
                orderDetails={orderDetails}
                handleDetailChange={handleDetailChange}
                adminData={adminData}
                checkedIds={checkedIds}
                onCheckChange={setCheckedIds}
            />

            <Paper elevation={0} sx={{ p: 4, border: '1px solid', borderColor: 'divider' }}>
                <TermsAndConditions
                    contactName={orderDetails.contactName}
                    handleDetailChange={handleDetailChange}
                />
            </Paper>

            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2, mb: 4 }}>
                <Button
                    variant="contained"
                    color="primary"
                    size="large"
                    onClick={handleSubmit}
                    sx={{ px: 6, py: 1.5, fontWeight: 'bold', fontSize: '1.1rem' }}
                >
                    Submit Order
                </Button>
            </Box>
        </Box>
    );
};

export default ClientOrderTab;
