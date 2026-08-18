import React, { useState, useMemo, useCallback } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Checkbox,
  Box,
  Tooltip,
} from "@mui/material";

const toISODate = (date) => {
  return date.toLocaleDateString('en-CA');
};

const EquipmentTable = ({
  adminData,
  startDate,
  endDate,
  checkedIds,
  onCheckChange
}) => {
  const displayDays = useMemo(() => {
    const days = [];

    if (startDate && endDate) {
      let current = new Date(startDate + 'T00:00:00');
      const end = new Date(endDate + 'T00:00:00');
      let count = 0;
      while (current <= end && count < 365) {
        days.push(new Date(current));
        current.setDate(current.getDate() + 1);
        count++;
      }
    } else {
      const today = new Date();
      for (let i = 0; i < 30; i++) {
        const d = new Date(today);
        d.setDate(today.getDate() + i);
        days.push(d);
      }
    }
    return days;
  }, [startDate, endDate]);

  const reservationMap = useMemo(() => {
    if (!adminData || !adminData.formRows) return {};

    const map = {};
    adminData.formRows.forEach(order => {
      const activeStatuses = ['Approved', 'Pending Approval'];
      if (!activeStatuses.includes(order.status)) return;

      const start = new Date(order.pickup);
      start.setHours(0, 0, 0, 0); // Normalize to midnight — prevents pickup time from bleeding into day iteration

      const end = new Date(order.dropoff);
      end.setHours(0, 0, 0, 0);   // Normalize to midnight of dropoff day — ensures dropoff day is included

      let current = new Date(start);
      while (current <= end) {
        const dStr = toISODate(current);
        if (order.equipment) {
          order.equipment.forEach(item => {
            if (!map[item.id]) {
              map[item.id] = new Set();
            }
            map[item.id].add(dStr);
          });
        }
        current.setDate(current.getDate() + 1);
      }
    });
    return map;
  }, [adminData]);

  const sortedItems = useMemo(() => {
    if (!adminData || !adminData.availableEquipment) return [];

    const rangeDateStrings = displayDays.map(toISODate);

    const items = adminData.availableEquipment.map(item => {
      const isUnavailable = item.status === 'In Office - Unavailable' ||
                            item.status === 'Unavailable' ||
                            (item.status && item.status.toLowerCase().includes('unavailable'));

      const reservedSet = reservationMap[item.id] || new Set();
      const hasDateConflict = rangeDateStrings.some(d => reservedSet.has(d));
      const hasConflict = isUnavailable || hasDateConflict;
      const isChecked = checkedIds.has(item.id);

      return {
        ...item,
        reservedDateSet: reservedSet,
        isUnavailable: isUnavailable,
        hasDateConflict: hasDateConflict,
        hasConflict: hasConflict,
        isChecked: isChecked
      };
    });

    return items.sort((a, b) => {
      if (a.isChecked !== b.isChecked) {
        return a.isChecked ? -1 : 1;
      }

      if (a.hasConflict !== b.hasConflict) {
        return a.hasConflict ? 1 : -1;
      }

      return a.name.localeCompare(b.name);
    });

  }, [adminData, displayDays, reservationMap, checkedIds]);

  React.useEffect(() => {

    if (!onCheckChange) return;

    const next = new Set(checkedIds);
    let changed = false;

    sortedItems.forEach(item => {
      if (item.hasConflict && next.has(item.id)) {
        next.delete(item.id);
        changed = true;
      }
    });

    if (changed) {
      onCheckChange(next);
    }
  }, [sortedItems, checkedIds, onCheckChange]);

  const handleCheckboxClick = (id) => {
    const next = new Set(checkedIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    onCheckChange(next);
  };

  return (
    <Paper sx={{ p: 2, mt: 4, width: '100%', overflow: 'hidden' }}>
      <Box sx={{ mb: 2 }}>
        <Typography variant="h6" component="h2">
          Equipment Availability {startDate && endDate ? '(Filtered Range)' : '(30-Day View)'}
        </Typography>
      </Box>

      <TableContainer sx={{ maxHeight: 600, maxWidth: '100%' }}>
        <Table stickyHeader size="small" sx={{ tableLayout: 'fixed', width: 'max-content' }}>
          <TableHead>
            <TableRow>
              <TableCell
                sx={{
                  position: 'sticky',
                  left: 0,
                  zIndex: 3,
                  bgcolor: 'background.paper',
                  width: 200,
                  minWidth: 200
                }}
              >
                Name
              </TableCell>
              <TableCell
                align="center"
                sx={{
                  position: 'sticky',
                  left: 200,
                  zIndex: 3,
                  bgcolor: 'background.paper',
                  width: 80,
                  minWidth: 80
                }}
              >
                Select
              </TableCell>

              {displayDays.map((date) => (
                <TableCell
                  key={toISODate(date)}
                  align="center"
                  sx={{
                    width: 40,
                    minWidth: 40,
                    p: 0,
                    fontSize: '0.7rem',
                    backgroundColor: 'white',
                    borderLeft: '1px solid #eee'
                  }}
                >
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 0.5 }}>
                    <span>{date.toLocaleDateString('en-US', { month: 'numeric' })}</span>
                    <span>{date.toLocaleDateString('en-US', { day: 'numeric' })}</span>
                  </Box>
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {sortedItems.map((item) => {
              const rowBgColor = item.isUnavailable
                ? '#ffebee'
                : (item.hasConflict ? '#f9f9f9' : 'inherit');

              const stickyBgColor = item.isUnavailable
                ? '#ffebee'
                : 'background.paper';

              return (
                <TableRow
                  key={item.id}
                  hover
                  sx={{
                    opacity: item.isUnavailable ? 0.85 : (item.hasConflict ? 0.75 : 1),
                    bgcolor: rowBgColor
                  }}
                >
                  <TableCell
                    sx={{
                      position: 'sticky',
                      left: 0,
                      zIndex: 2,
                      bgcolor: stickyBgColor,
                      fontWeight: 'bold',
                      borderRight: '1px solid rgba(224, 224, 224, 1)'
                    }}
                  >
                    <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                      <span>{item.name}</span>
                      {item.isUnavailable && (
                        <Typography variant="caption" sx={{ color: 'error.main', fontWeight: 'normal', fontSize: '0.75rem' }}>
                          (Unavailable)
                        </Typography>
                      )}
                    </Box>
                  </TableCell>
                  <TableCell
                    align="center"
                    sx={{
                      position: 'sticky',
                      left: 200,
                      zIndex: 2,
                      bgcolor: stickyBgColor,
                      borderRight: '1px solid rgba(224, 224, 224, 1)'
                    }}
                  >
                    <Tooltip
                      title={
                        item.isUnavailable
                          ? "This item is currently unavailable (Out of service / Maintenance)"
                          : (item.hasConflict ? "Item is unavailable for the selected dates" : "")
                      }
                      arrow
                      placement="top"
                    >
                      <span>
                        <Checkbox
                          checked={item.isChecked}
                          onChange={() => handleCheckboxClick(item.id)}
                          disabled={item.hasConflict}
                          size="small"
                        />
                      </span>
                    </Tooltip>
                  </TableCell>

                  {displayDays.map((date) => {
                    const dateStr = toISODate(date);
                    const isReserved = item.reservedDateSet.has(dateStr);

                    let tooltipTitle = `${item.name} - ${dateStr}: Available`;
                    if (item.isUnavailable) {
                      tooltipTitle = `${item.name} - ${dateStr}: Unavailable (Out of service / Maintenance)`;
                    } else if (isReserved) {
                      tooltipTitle = `${item.name} - ${dateStr}: Reserved for another order`;
                    }

                    return (
                      <TableCell
                        key={dateStr}
                        sx={{
                          p: 0,
                          border: '1px solid rgba(224, 224, 224, 0.5)',
                          height: 40
                        }}
                      >
                        <Tooltip title={tooltipTitle} arrow placement="top">
                          <Box
                            sx={{
                              width: '100%',
                              height: '100%',
                              minHeight: 40,
                              bgcolor: item.isUnavailable
                                ? 'error.main'
                                : (isReserved
                                    ? (item.hasConflict ? 'error.dark' : 'error.main')
                                    : '#b9f6ca'),
                              opacity: (item.isUnavailable || isReserved) ? 0.9 : 0.8,
                              cursor: 'pointer'
                            }}
                          />
                        </Tooltip>
                      </TableCell>
                    );
                  })}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
};

export default EquipmentTable;