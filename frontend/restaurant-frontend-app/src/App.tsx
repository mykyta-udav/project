import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import MainLayout from './layouts/MainLayout';
import AuthLayout from './layouts/AuthLayout';
import HomePage from './pages/HomePage';
import RestaurantPage from './pages/RestaurantPage';
import LoginPage from './features/auth/pages/LoginPage';
import RegisterPage from './features/auth/pages/RegisterPage';
import ProfilePage from './pages/ProfilePage';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<MainLayout />}>
            <Route index element={<HomePage />} />
            <Route path='/restaurant/:id' element={<RestaurantPage />} />
            <Route path='/profile' element={<ProfilePage />} />
          </Route>

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
