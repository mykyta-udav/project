import { BrowserRouter, Routes, Route } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import AuthLayout from './layouts/AuthLayout';
import HomePage from './pages/HomePage';
import LoginPage from './features/auth/pages/LoginPage';
import RegisterPage from './features/auth/pages/RegisterPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Main routes */}
        <Route path='/' element={<MainLayout />}>
          <Route index element={<HomePage />} />
        </Route>

        {/* Auth routes with simpler paths */}
        <Route element={<AuthLayout />}>
          <Route path='login' element={<LoginPage />} />
          <Route path='register' element={<RegisterPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
