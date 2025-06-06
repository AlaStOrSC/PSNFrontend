import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AuthPage from '../pages/AuthPage';
import Home from '../pages/Home';
import Matches from '../pages/Matches';
import Profile from '../pages/Profile';
import MainLayout from '../layouts/MainLayout';
import Ranking from '../pages/Ranking';
import PSNShop from '../pages/PSNShop';
import Conocenos from '../pages/Conocenos';
import AdminZone from '../pages/AdminZone';
import Sponsors from '../pages/Sponsors';
import ProtectedRoute from '../components/ProtectedRoute';
import { useSelector } from 'react-redux';

function AdminRoute({ children }) {
  const { user } = useSelector((state) => state.auth);
  return user && user.role === 'admin' ? children : <Navigate to="/" />;
}

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<Home />} />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/matches"
            element={
              <ProtectedRoute>
                <Matches />
              </ProtectedRoute>
            }
          />
          <Route
            path="/ranking"
            element={
              <ProtectedRoute>
                <Ranking />
              </ProtectedRoute>
            }
          />
          <Route
            path="/shop"
            element={
              <ProtectedRoute>
                <PSNShop />
              </ProtectedRoute>
            }
          />
          <Route path="/conocenos" element={<Conocenos />} />
          <Route path="/sponsors" element={<Sponsors />} />
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <AdminRoute>
                  <AdminZone />
                </AdminRoute>
              </ProtectedRoute>
            }
          />
        </Route>
        <Route path="/auth" element={<AuthPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;