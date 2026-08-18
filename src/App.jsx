import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';

import MainLayout from './MainLayout';
import FormTab from './components/Form/FormTab';
import WarehouseTab from './components/Warehouse/WarehouseTab';
import ClientOrderTab from './components/ClientOrder/ClientOrderTab';
import AuthenticationTab from './components/AuthenticationTest/AuthenticationTab';
import AdminControlTab from './components/AuthenticationTest/AdminControlTab';
import AccountNumbersTab from './components/AccountNumbers/AccountNumbersTab';
import theme from './utils/theme';

function App() {
  // Auth State
  const [user, setUser] = useState(null);
  const [role, setRole] = useState('unlogged'); // 'admin', 'client', 'unlogged'
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState({ formRows: [], warehouseRows: [], availableEquipment: [] });

  // Handle Login
  const handleLogin = (userData) => {
    setUser(userData);
    setRole(userData.role);
  };

  const handleLogout = () => {
    setUser(null);
    setRole('unlogged');
  };

  const fetchData = async () => {
    try {
      const response = await fetch('https://equipment.binghamtonsa.org/api.php?action=get_admin_data', {
        credentials: 'include'
      });
      const apiResponse = await response.json();

      if (apiResponse.success) {
        const { inventory, orders } = apiResponse.data;

        // 1. Transform Orders -> formRows
        const parseSafely = (dateString) => {
            if (!dateString) return new Date();
            // The old database procedure appended 'T' and 'Z' to force UTC math on the browser.
            // We strip 'T' and 'Z' out so no matter if the remote database is updated or old,
            // the string is strictly forced into local wall-clock bounds.
            const cleanStr = dateString.replace('T', ' ').replace('Z', '').replace(/-/g, '/');
            return new Date(cleanStr);
        };

        const formRows = orders.map(order => ({
          id: order.order_id,
          club: order.club_name,
          status: order.status,
          equipment: order.equipment_items.map(item => ({ name: item.name, status: item.status, id: item.id, activeOrderId: item.active_order_id ?? null })),
          signedOffBy: order.signed_name,
          email: order.email,
          contactName: order.signed_name,
          dateOfEvent: order.event_date,
          location: order.location,
          bEngagedLink: order.b_engaged_link,
          timespan: order.timespan_description,
          pickup: parseSafely(order.start_date),
          dropoff: parseSafely(order.end_date),
          accountNumber: order.club_account_number
        }));

        // 2. Transform Inventory -> warehouseRows
        const orderClubMap = {};
        orders.forEach(o => {
          orderClubMap[o.order_id] = o.club_name;
        });

        const warehouseRows = inventory.map(item => ({
          id: item.id,
          name: item.name,
          status: item.current_status || 'Available',
          club: item.active_order_id ? (orderClubMap[item.active_order_id]) : null,
          activeOrderId: item.active_order_id
        }));

        // 3. All Inventory for Modals
        const availableEquipment = inventory.map(item => ({
          id: item.id,
          name: item.name,
          status: item.current_status
        })).sort((a, b) => {
          const priority = { 'Picked Up': 0, 'Available': 1, 'In Office - Unavailable': 2 };
          const pA = priority[a.status] ?? 3;
          const pB = priority[b.status] ?? 3;
          if (pA !== pB) return pA - pB;
          return a.name.localeCompare(b.name);
        });

        setData({ formRows, warehouseRows, availableEquipment });
      } else {
        console.error('API returned error:', apiResponse.error);
      }
    } catch (error) {
      console.error('❌ Error fetching from PHP API:', error);
    }
  };

  useEffect(() => {
    const initializeApp = async () => {
      // 1. Check Session
      try {
        const sessionRes = await fetch('https://equipment.binghamtonsa.org/me.php', {
          credentials: 'include'
        });
        if (sessionRes.ok) {
          const sessionData = await sessionRes.json();
          if (sessionData.success && sessionData.user) {
            setUser(sessionData.user);
            setRole(sessionData.user.role);
          }
        }
      } catch (err) {
        console.error("Session check failed", err);
      }

      // 2. Fetch Data
      await fetchData();
      setIsLoading(false);
    };

    initializeApp(); // Initial fetch
    const intervalId = setInterval(fetchData, 15000); // Poll every 15s
    return () => clearInterval(intervalId); // Cleanup
  }, []);

  if (isLoading) {
    return (
      <ThemeProvider theme={theme}>
        <Box sx={{ display: 'flex', height: '100vh', justifyContent: 'center', alignItems: 'center', backgroundColor: '#f4f6f8' }}>
          <CircularProgress size={60} thickness={4} sx={{ color: '#005a43' }} />
        </Box>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <BrowserRouter>
        <Routes>
          <Route element={<MainLayout role={role} />}>

            {/* Common Route: Authentication */}
            <Route path="/auth" element={<AuthenticationTab user={user} onLogin={handleLogin} onLogout={handleLogout} />} />

            {/* Role: Admin */}
            {role === 'admin' && (
              <>
                <Route path="/process-forms" element={
                  <FormTab initialRows={data.formRows} allEquipment={data.availableEquipment} refreshData={fetchData} />
                } />
                <Route path="/equipment-list" element={
                  <WarehouseTab initialRows={data.warehouseRows} orders={data.formRows} refreshData={fetchData} />
                } />
                <Route path="/client-order" element={
                  <ClientOrderTab adminData={data} user={user} refreshData={fetchData} />
                } />
                <Route path="/admin-control" element={
                  <AdminControlTab />
                } />
                <Route path="/account-numbers" element={
                  <AccountNumbersTab />
                } />
                <Route path="/" element={<Navigate to="/process-forms" replace />} />
                {/* Fallback for undefined routes while logged in */}
                <Route path="*" element={<Navigate to="/process-forms" replace />} />
              </>
            )}

            {/* Role: Client */}
            {role === 'client' && (
              <>
                <Route path="/client-order" element={
                  <ClientOrderTab adminData={data} user={user} refreshData={fetchData} />
                } />
                <Route path="/" element={<Navigate to="/client-order" replace />} />
                <Route path="*" element={<Navigate to="/client-order" replace />} />
              </>
            )}

            {/* Role: Unlogged */}
            {role === 'unlogged' && (
              <>
                <Route path="/" element={<Navigate to="/auth" replace />} />
                <Route path="*" element={<Navigate to="/auth" replace />} />
              </>
            )}

          </Route>
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
