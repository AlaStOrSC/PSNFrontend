import { BrowserRouter, Routes, Route } from 'react-router-dom';
import AuthPage from '../pages/AuthPage';
import Home from '../pages/Home';
import Matches from '../pages/Matches';
import Profile from '../pages/Profile';
import MainLayout from '../layouts/MainLayout';
import Ranking from '../pages/Ranking';
import PSNShop from '../pages/PSNShop';
import Conocenos from '../pages/Conocenos';

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/matches" element={<Matches />} />
          <Route path="/ranking" element={<Ranking />} />
          <Route path="/shop" element={<PSNShop />} />
          <Route path="/conocenos" element={<Conocenos />} />
        </Route>
        <Route path="/auth" element={<AuthPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;