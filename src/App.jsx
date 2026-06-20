import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Suspense, useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import { useAuthStore } from './store/useAuthStore';
import QueryProvider from './context/QueryProvider';

import AdminRoute from './components/auth/AdminRoute';
import AdminLayout from './components/admin/AdminLayout';
import LoadingPage from './components/common/LoadingPage';
import ErrorBoundary from './components/common/ErrorBoundary';

import LoginPage from './pages/auth/LoginPage';
import NotFoundPage from './pages/NotFoundPage';

import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import AdminFlightsPage from './pages/admin/AdminFlightsPage';
import AdminBookingsPage from './pages/admin/AdminBookingsPage';
import AdminUsersPage from './pages/admin/AdminUsersPage';
import AdminReportsPage from './pages/admin/AdminReportsPage';
import AdminAirlinesPage from './pages/admin/AdminAirlinesPage';
import AdminAirportsPage from './pages/admin/AdminAirportsPage';
import AdminNotificationsPage from './pages/admin/AdminNotificationsPage';

const ComingSoon = ({ title }) => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="text-center card max-w-md p-10">
      <div className="text-5xl mb-4">🛡</div>
      <h1 className="text-2xl font-bold text-navy-900 mb-2">{title}</h1>
      <p className="text-gray-500 text-sm">This admin section is coming soon.</p>
    </div>
  </div>
);

const App = () => {
  const { initialize } = useAuthStore();

  useEffect(() => {
    initialize();
  }, [initialize]);

  return (
    <QueryProvider>
      <BrowserRouter>
        <ErrorBoundary>
          <Suspense fallback={<LoadingPage />}>
            <Routes>
              {/* Redirect root to /admin */}
              <Route path="/" element={<Navigate to="/admin" replace />} />

              {/* Admin login */}
              <Route path="/login" element={<LoginPage />} />

              {/* Protected admin routes */}
              <Route element={<AdminRoute />}>
                <Route path="/admin" element={<AdminLayout />}>
                  <Route index element={<AdminDashboardPage />} />
                  <Route path="flights" element={<AdminFlightsPage />} />
                  <Route path="bookings" element={<AdminBookingsPage />} />
                  <Route path="users" element={<AdminUsersPage />} />
                  <Route path="reports" element={<AdminReportsPage />} />
                  <Route path="airlines" element={<AdminAirlinesPage />} />
                  <Route path="airports" element={<AdminAirportsPage />} />
                  <Route path="notifications" element={<AdminNotificationsPage />} />
                  <Route path="analytics" element={<ComingSoon title="Analytics" />} />
                  <Route path="settings" element={<ComingSoon title="Settings" />} />
                </Route>
              </Route>

              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </Suspense>
        </ErrorBoundary>
      </BrowserRouter>

      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#1e293b',
            color: '#f8fafc',
            borderRadius: '12px',
            fontSize: '14px',
            fontWeight: '500',
          },
          success: { duration: 3000, iconTheme: { primary: '#22c55e', secondary: '#fff' } },
          error: { duration: 5000, iconTheme: { primary: '#ef4444', secondary: '#fff' } },
        }}
      />
    </QueryProvider>
  );
};

export default App;
