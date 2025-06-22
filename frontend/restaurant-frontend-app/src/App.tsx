import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import ReservationAuthGuard from './components/auth/ReservationAuthGuard';
import MainLayout from './layouts/MainLayout';
import AuthLayout from './layouts/AuthLayout';
import HomePage from './pages/HomePage';
import RestaurantPage from './pages/RestaurantPage';
import LoginPage from './features/auth/pages/LoginPage';
import RegisterPage from './features/auth/pages/RegisterPage';
import ProfilePage from './pages/ProfilePage';
import BookPage from './pages/BookPage';
import ReservationsPage from './pages/ReservationsPage';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<MainLayout />}>
            {/* Public routes */}
            <Route index element={<HomePage />} />
            <Route path='/restaurant/:id' element={<RestaurantPage />} />
            
            {/* Protected routes that require authentication */}
            <Route 
              path='/profile' 
              element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path='/reservations' 
              element={
                <ProtectedRoute>
                  <ReservationsPage />
                </ProtectedRoute>
              } 
            />
            
            {/* Reservation route with special authentication guard */}
            <Route 
              path='/book' 
              element={
                <ReservationAuthGuard>
                  <BookPage />
                </ReservationAuthGuard>
              } 
            />
          </Route>

          {/* Authentication routes */}
          <Route element={<AuthLayout />}>
            <Route path='/login' element={<LoginPage />} />
            <Route path='/register' element={<RegisterPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
