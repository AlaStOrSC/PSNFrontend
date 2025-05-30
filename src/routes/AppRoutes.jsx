import { BrowserRouter, Routes, Route } from 'react-router-dom';
import AuthPage from '../pages/AuthPage';
import Home from '../pages/Home';
import Matches from '../pages/Matches';
import Profile from '../pages/Profile';
import MainLayout from '../layouts/MainLayout';
import Ranking from '../pages/Ranking';
import PSNShop from '../pages/PSNShop';
import Conocenos from '../pages/Conocenos';
import ProtectedRoute from '../components/ProtectedRoute';

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
          <Route
            path="/conocenos"
            element={
                <Conocenos />
            }
          />
        </Route>
        <Route path="/auth" element={<AuthPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;