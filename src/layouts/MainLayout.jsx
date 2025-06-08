import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../store/slices/authSlice';
import { toggleTheme } from '../store/slices/themeSlice';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { HomeIcon, UserIcon, TrophyIcon, Bars3Icon, XMarkIcon, BoltIcon, EnvelopeIcon, ShoppingBagIcon, MoonIcon, SunIcon, InformationCircleIcon, ArrowRightEndOnRectangleIcon, ArrowLeftEndOnRectangleIcon, ShieldCheckIcon, HeartIcon } from '@heroicons/react/24/solid';
import Chat from '../components/Chat';
import { useTranslation } from 'react-i18next';
import LogoNavbar from '../assets/LogoNavbar.png';
import 'flag-icons/css/flag-icons.min.css';


function MainLayout() {
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const { theme } = useSelector((state) => state.theme);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { t, i18n } = useTranslation();

  const handleLogout = () => {
    dispatch(logout());
    navigate('/auth');
  };
  const handleLogoClick = () => {
    navigate('/');
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleThemeToggle = () => {
    dispatch(toggleTheme());
  };

  const handleLanguageToggle = () => {
    const newLang = i18n.language === 'es' ? 'en' : 'es';
    i18n.changeLanguage(newLang);
  };

  const navItems = [
    { name: t('navbar.inicio'), path: '/', icon: HomeIcon },
    { name: t('navbar.perfil'), path: '/profile', icon: UserIcon },
    { name: t('navbar.partidos'), path: '/matches', icon: BoltIcon },
    { name: t('navbar.ranking'), path: '/ranking', icon: TrophyIcon },
    { name: t('navbar.tienda'), path: '/shop', icon: ShoppingBagIcon },
    { name: t('navbar.conocenos'), path: '/conocenos', icon: InformationCircleIcon },
    { name: t('sponsors.title'), path: '/sponsors', icon: HeartIcon },
    ...(user && user.role === 'admin' ? [
      { name: 'Admin', path: '/admin', icon: ShieldCheckIcon },
    ] : []),
  ];

  return (
    <div className="flex flex-col min-h-screen bg-neutral dark:bg-dark-bg">
      <nav className="bg-primary text-white shadow-lg dark:bg-dark-bg-secondary dark:shadow-dark-shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <img
                src={LogoNavbar}
                alt="Logo"
                className="h-20 w-auto"
                onClick={handleLogoClick}
                style={{ cursor: 'pointer' }}
              />
            </div>
            <div className="hidden md:flex items-center space-x-1">
              {navItems.map((item) => (
                <NavLink
                  key={item.name}
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 min-w-[100px] ${
                      isActive
                        ? 'bg-secondary text-white dark:bg-dark-primary dark:text-dark-text-primary'
                        : 'hover:bg-secondary hover:text-white dark:hover:bg-dark-primary dark:hover:text-dark-text-primary'
                    }`
                  }
                >
                  <item.icon className="h-5 w-5 mr-2" />
                  {item.name}
                </NavLink>
              ))}
              <button
                onClick={handleLanguageToggle}
                className="flex items-center px-3 py-2 rounded-md text-sm font-medium hover:bg-secondary hover:text-white dark:hover:bg-dark-primary dark:hover:text-dark-text-primary transition-colors duration-200 min-w-[50px]"
              >
                <span className={`fi fi-${i18n.language === 'es' ? 'gb' : 'es'} h-5 w-5 mr-2`}></span>
                {i18n.language === 'es' ? 'EN' : 'ES'}
              </button>
              <button
                onClick={handleThemeToggle}
                className="flex items-center px-3 py-2 rounded-md text-sm font-medium hover:bg-secondary hover:text-white dark:hover:bg-dark-primary dark:hover:text-dark-text-primary transition-colors duration-200 min-w-[50px]"
              >
                {theme === 'light' ? (
                  <MoonIcon className="h-5 w-5" />
                ) : (
                  <SunIcon className="h-5 w-5" />
                )}
              </button>
              {isAuthenticated ? (
                <button
                  onClick={handleLogout}
                  className="flex items-center px-3 py-2 rounded-md text-sm font-medium hover:bg-secondary hover:text-white dark:hover:bg-dark-primary dark:hover:text-dark-text-primary transition-colors duration-200 min-w-[50px]"
                >
                  <ArrowLeftEndOnRectangleIcon className="h-5 w-5" />
                </button>
              ) : (
                <NavLink
                  to="/auth"
                  className="flex items-center px-3 py-2 rounded-md text-sm font-medium hover:bg-secondary hover:text-white dark:hover:bg-dark-primary dark:hover:text-dark-text-primary transition-colors duration-200 min-w-[50px]"
                >
                  <ArrowRightEndOnRectangleIcon className="h-5 w-5" />
                </NavLink>
              )}
            </div>
            <div className="md:hidden flex items-center">
              <button onClick={toggleMenu} className="p-2">
                {isMenuOpen ? (
                  <XMarkIcon className="h-6 w-6" />
                ) : (
                  <Bars3Icon className="h-6 w-6" />
                )}
              </button>
            </div>
          </div>
        </div>
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              {navItems.map((item) => (
                <NavLink
                  key={item.name}
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 min-w-[100px] ${
                      isActive
                        ? 'bg-secondary text-white dark:bg-dark-primary dark:text-dark-text-primary'
                        : 'hover:bg-secondary hover:text-white dark:hover:bg-dark-primary dark:hover:text-dark-text-primary'
                    }`
                  }
                  onClick={toggleMenu}
                >
                  <item.icon className="h-5 w-5 mr-2" />
                  {item.name}
                </NavLink>
              ))}
              <button
                onClick={() => {
                  handleLanguageToggle();
                  toggleMenu();
                }}
                className="flex items-center px-3 py-2 rounded-md text-sm font-medium hover:bg-secondary hover:text-white dark:hover:bg-dark-primary dark:hover:text-dark-text-primary transition-colors duration-200 w-full text-left min-w-[50px]"
              >
                <span className={`fi fi-${i18n.language === 'es' ? 'gb' : 'es'} h-5 w-5 mr-2`}></span>
                {i18n.language === 'es' ? 'EN' : 'ES'}
              </button>
              <button
                onClick={() => {
                  handleThemeToggle();
                  toggleMenu();
                }}
                className="flex items-center px-3 py-2 rounded-md text-sm font-medium hover:bg-secondary hover:text-white dark:hover:bg-dark-primary dark:hover:text-dark-text-primary transition-colors duration-200 w-full text-left min-w-[50px]"
              >
                {theme === 'light' ? (
                  <MoonIcon className="h-5 w-5 mr-2" />
                ) : (
                  <SunIcon className="h-5 w-5 mr-2" />
                )}
                {t('navbar.cambiar_tema')}
              </button>
              {isAuthenticated ? (
                <button
                  onClick={() => {
                    handleLogout();
                    toggleMenu();
                  }}
                  className="flex items-center w-full text-left px-3 py-2 rounded-md text-sm font-medium hover:bg-secondary hover:text-white dark:hover:bg-dark-primary dark:hover:text-dark-text-primary transition-colors duration-200 min-w-[50px]"
                >
                  <ArrowLeftEndOnRectangleIcon className="h-5 w-5 mr-2" />
                </button>
              ) : (
                <NavLink
                  to="/auth"
                  className="flex items-center px-3 py-2 rounded-md text-sm font-medium hover:bg-secondary hover:text-white dark:hover:bg-dark-primary dark:hover:text-dark-text-primary transition-colors duration-200 min-w-[50px]"
                  onClick={toggleMenu}
                >
                  <ArrowRightEndOnRectangleIcon className="h-5 w-5 mr-2" />
                </NavLink>
              )}
            </div>
          </div>
        )}
      </nav>
      <main className="flex-grow bg-neutral dark:bg-dark-bg">
        <Outlet />
      </main>
      <footer className="bg-primary text-white py-6 dark:bg-dark-bg-secondary dark:shadow-dark-shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4 text-white dark:text-dark-text-primary">{t('footer.quick_links')}</h3>
              <ul className="space-y-2">
                <li>
                  <NavLink
                    to="/matches"
                    className="text-sm text-white hover:text-secondary dark:hover:text-dark-text-accent transition-colors duration-200"
                  >
                    {t('footer.create_match')}
                  </NavLink>
                </li>
                <li>
                  <NavLink
                    to="/ranking"
                    className="text-sm text-white hover:text-secondary dark:hover:text-dark-text-accent transition-colors duration-200"
                  >
                    {t('footer.ranking')}
                  </NavLink>
                </li>
                <li>
                  <NavLink
                    to="/profile"
                    className="text-sm text-white hover:text-secondary dark:hover:text-dark-text-accent transition-colors duration-200"
                  >
                    {t('footer.profile')}
                  </NavLink>
                </li>
                <li>
                  <NavLink
                    to="/shop"
                    className="text-sm text-white hover:text-secondary dark:hover:text-dark-text-accent transition-colors duration-200"
                  >
                    {t('footer.visit_shop')}
                  </NavLink>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4 text-white dark:text-dark-text-primary">{t('footer.about_company')}</h3>
              <ul className="space-y-2">
                <li>
                  <NavLink
                    to="/conocenos"
                    className="text-sm text-white hover:text-secondary dark:hover:text-dark-text-accent transition-colors duration-200"
                  >
                    {t('footer.about_us')}
                  </NavLink>
                </li>
                <li>
                  <NavLink
                    to="/sponsors"
                    className="text-sm text-white hover:text-secondary dark:hover:text-dark-text-accent transition-colors duration-200"
                  >
                    {t('footer.sponsors')}
                  </NavLink>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4 text-white dark:text-dark-text-primary">{t('footer.contact')}</h3>
              <ul className="space-y-2">
                <li className="flex items-center space-x-2">
                  <EnvelopeIcon className="h-5 w-5" />
                  <a
                    href="mailto:padelsocialnetwork@gmail.com"
                    className="text-sm text-white hover:text-secondary dark:hover:text-dark-text-accent transition-colors duration-200"
                  >
                    psn@gmail.com
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4 text-white dark:text-dark-text-primary">{t('footer.faq')}</h3>
              <ul className="space-y-2">
                <li>
                  <a
                    href="#"
                    className="text-sm text-white hover:text-secondary dark:hover:text-dark-text-accent transition-colors duration-200"
                  >
                    {t('footer.faq_who_we_are')}
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-sm text-white hover:text-secondary dark:hover:text-dark-text-accent transition-colors duration-200"
                  >
                    {t('footer.faq_how_to_start')}
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-sm text-white hover:text-secondary dark:hover:text-dark-text-accent transition-colors duration-200"
                  >
                    {t('footer.faq_how_to_earn_points')}
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-sm text-white hover:text-secondary dark:hover:text-dark-text-accent transition-colors duration-200"
                  >
                    {t('footer.faq_how_to_redeem_points')}
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-sm text-white hover:text-secondary dark:hover:text-dark-text-accent transition-colors duration-200"
                  >
                    {t('footer.faq_how_to_sell')}
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-sm text-white hover:text-secondary dark:hover:text-dark-text-accent transition-colors duration-200"
                  >
                    {t('footer.faq_how_to_create_match')}
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4 text-white dark:text-dark-text-primary">{t('footer.follow_us')}</h3>
              <ul className="space-y-2">
                <li>
                  <a
                    href="https://x.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-2 text-sm text-white hover:text-secondary dark:hover:text-dark-text-accent transition-colors duration-200"
                  >
                    <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                    </svg>
                    <span>X</span>
                  </a>
                </li>
                <li>
                  <a
                    href="https://instagram.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-2 text-sm text-white hover:text-secondary dark:hover:text-dark-text-accent transition-colors duration-200"
                  >
                    <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.948-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                    </svg>
                    <span>Instagram</span>
                  </a>
                </li>
                <li>
                  <a
                    href="https://facebook.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-2 text-sm text-white hover:text-secondary dark:hover:text-dark-text-accent transition-colors duration-200"
                  >
                    <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z" />
                    </svg>
                    <span>Facebook</span>
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-6 border-t border-white/20 dark:border-dark-text-primary/20 text-center">
            <p className="text-sm text-white dark:text-dark-text-primary">{t('footer.copyright')}</p>
          </div>
        </div>
      </footer>
      {user && <Chat />}
    </div>
  );
}

export default MainLayout;