import { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Switch from '@mui/material/Switch';
import FormControlLabel from '@mui/material/FormControlLabel';
import ProcessEquipmentModal from './ProcessEquipmentModal';
import EditPickupDropoffModal from './EditPickupDropoffModal';
import EmailPromptModal from './EmailPromptModal';
import ApprovalStatusSelector from './ApprovalStatusSelector';

const FormTab = ({ initialRows = [], allEquipment = [], refreshData }) => {
  const [rows, setRows] = useState(initialRows);
  const [equipmentModalOpen, setEquipmentModalOpen] = useState(false);
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [currentRowId, setCurrentRowId] = useState(null);
  const [showDeniedCompleted, setShowDeniedCompleted] = useState(false);
  const [emailModalOpen, setEmailModalOpen] = useState(false);
  const [emailModalStatus, setEmailModalStatus] = useState(null);

  useEffect(() => {
    setRows(initialRows);
  }, [initialRows]);

  const handleOpenEquipmentModal = (rowId) => {
    setCurrentRowId(rowId);
    setEquipmentModalOpen(true);
  };

  const handleCloseEquipmentModal = () => {
    setEquipmentModalOpen(false);
    setCurrentRowId(null);
  };

  const handleOpenScheduleModal = (rowId) => {
    setCurrentRowId(rowId);
    setScheduleModalOpen(true);
  }

  const handleCloseScheduleModal = () => {
    setScheduleModalOpen(false);
    setCurrentRowId(null);
  }

  const handleFormStatusChange = async (rowId, newStatus) => {
    if (newStatus === 'Pending Approval') {
      return;
    }

    if (newStatus === 'Approved' || newStatus === 'Denied') {
      setCurrentRowId(rowId);
      setEmailModalStatus(newStatus);
      setEmailModalOpen(true);
      return;
    }

    try {
      const response = await fetch('https://equipment.binghamtonsa.org/api.php?action=update_order_status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ order_id: rowId, new_status: newStatus })
      });
      const res = await response.json();

      if (res.success) {
        refreshData();
      } else {
        console.error("Error updating status:", res.error);
        alert("Error: " + res.error);
      }
    } catch (error) {
      console.error("Network error:", error);
      alert("Network error updating status.");
    }
  };



  return (
    <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column' }}>
      <EmailPromptModal
        open={emailModalOpen}
        onClose={() => setEmailModalOpen(false)}
        order={rows.find(r => r.id === currentRowId)}
        newStatus={emailModalStatus}
        refreshData={refreshData}
      />
      <ProcessEquipmentModal
        open={equipmentModalOpen}
        onClose={handleCloseEquipmentModal}
        allEquipment={allEquipment}
        allOrders={rows}
        order={rows.find(r => r.id === currentRowId)}
        refreshData={refreshData}
      />
      <EditPickupDropoffModal
        open={scheduleModalOpen}
        onClose={handleCloseScheduleModal}
        order={rows.find(r => r.id === currentRowId)}
        refreshData={refreshData}
      />
      <TableContainer component={Paper} elevation={3} sx={{ flexGrow: 1 }}>
        <Table stickyHeader size="small" aria-label="form requests table">
          <TableHead>
            <TableRow>
              <TableCell>Club / Contact</TableCell>
              <TableCell sx={{ width: '1px' }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                  <Typography variant="inherit" fontWeight="bold">Form Status</Typography>
                  <FormControlLabel
                    control={
                      <Switch
                        size="small"
                        checked={showDeniedCompleted}
                        onChange={(e) => setShowDeniedCompleted(e.target.checked)}
                      />
                    }
                    label={
                      <Typography variant="caption" sx={{ whiteSpace: 'nowrap' }}>
                        {showDeniedCompleted ? 'Showing Denied/Completed' : 'Hiding Denied/Completed'}
                      </Typography>
                    }
                    sx={{ m: 0, mt: 0.5 }}
                  />
                </Box>
              </TableCell>
              <TableCell>Requested Equipment</TableCell>
              <TableCell>Schedule</TableCell>
              <TableCell>Event Details</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.filter(row => showDeniedCompleted || (row.status !== 'Denied' && row.status !== 'Completed'))
              .sort((a, b) => {
              const priority = { 'Pending Approval': 0, 'Approved': 1, 'Denied': 2, 'Completed': 3 };
              return priority[a.status] - priority[b.status];
            }).map((row) => (
              <TableRow key={row.id} hover>
                <TableCell>
                  <Typography variant="body2" fontWeight="bold">{row.club}</Typography>
                  <Typography variant="caption" display="block" color="text.secondary">Acct: {row.accountNumber}</Typography>
                  <Box sx={{ mt: 1 }}>
                    <Typography variant="caption" display="block"><strong>Signed:</strong> {row.signedOffBy}</Typography>
                    <Link href={`mailto:${row.email}`} variant="caption">{row.email}</Link>
                  </Box>
                </TableCell>
                <TableCell>
                  <ApprovalStatusSelector
                    currentStatus={row.status}
                    onStatusChange={(newStatus) => handleFormStatusChange(row.id, newStatus)}
                  />
                </TableCell>
                <TableCell>
                  <Stack spacing={0.5}>
                    {row.equipment.map((item, index) => (
                      <Typography key={index} variant="body2" sx={{ display: 'block' }}>
                        {item.name}
                      </Typography>
                    ))}
                    <Button
                      size="small"
                      sx={{ mt: 1, textTransform: 'none', alignSelf: 'flex-start' }}
                      onClick={() => handleOpenEquipmentModal(row.id)}
                    >
                      Edit Equipment
                    </Button>
                  </Stack>
                </TableCell>
                <TableCell>
                  <Box>
                    <Typography variant="body2"><strong>Pickup:</strong> {row.pickup.toLocaleString()}</Typography>
                    <Typography variant="body2"><strong>Dropoff:</strong> {row.dropoff.toLocaleString()}</Typography>
                    <Button
                      size="small"
                      sx={{ mt: 1, textTransform: 'none', fontSize: '0.75rem', padding: '2px 8px' }}
                      onClick={() => handleOpenScheduleModal(row.id)}
                    >
                      Edit Pickup and Dropoff times
                    </Button>
                  </Box>
                </TableCell>
                <TableCell>
                  <Typography variant="body2"><strong>Date:</strong> {row.dateOfEvent}</Typography>
                  <Typography variant="body2"><strong>Loc:</strong> {row.location}</Typography>
                  <Typography variant="caption" sx={{ display: 'block', mt: 0.5 }}>
                    <strong>BEngaged Event Link:</strong> <Link href={row.bEngagedLink ? (/^https?:\/\//i.test(row.bEngagedLink.trim()) ? row.bEngagedLink.trim() : `https://${row.bEngagedLink.trim()}`) : '#'} target="_blank" rel="noopener">{row.bEngagedLink}</Link>
                  </Typography>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default FormTab;
