import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import NotificationCenter from './NotificationCenter.jsx';
import {
  Home, Rss, Calendar, Droplet, Home as HousingIcon, Pizza, Search, Briefcase, ShoppingBag,
  MessageSquare, ChevronDown, User, LogOut, LayoutDashboard, Menu, X, Store, Shield, Bus, Bell, BookOpen, BarChart3, Vote
} from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setShowMobileMenu(false);
    setShowUserMenu(false);
    setActiveDropdown(null);
  }, [location.pathname]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const isOtherRole = user?.role === 'other';

  const menuItems = !user ? {
    public: {
      title: "Explore",
      items: [
        { to: '/events', icon: Calendar, text: 'Events' },
        { to: '/blood-donation', icon: Droplet, text: 'Blood Donation' },
        { to: '/lost-found', icon: Search, text: 'Lost & Found' },
      ]
    }
  } : isOtherRole ? {
    services: {
      title: "Services",
      items: [
        { to: '/restaurants', icon: Pizza, text: 'Campus Eats' },
        { to: '/blood-donation', icon: Droplet, text: 'Blood Donation' },
      ]
    }
  } : {
    community: {
      title: "Community",
      items: [
        { to: '/events', icon: Calendar, text: 'Events' },
        { to: '/elections', icon: Vote, text: 'Elections' },
        { to: '/blood-donation', icon: Droplet, text: 'Blood Donation' },
        { to: '/books', icon: BookOpen, text: 'Books' },
      ]
    },
    campus: {
      title: "Campus Life",
      items: [
        { to: '/housing', icon: HousingIcon, text: 'Housing' },
        { to: '/lost-found', icon: Search, text: 'Lost & Found' },
        { to: '/holidays', icon: Calendar, text: 'Holidays' },
        { to: '/bus-schedule', icon: Bus, text: 'Bus Schedule' },
      ]
    },
    market: {
      title: "Career & Market",
      items: [
        { to: '/jobs', icon: Briefcase, text: 'Jobs' },
        { to: '/buysell', icon: ShoppingBag, text: 'Marketplace' },
        { to: '/restaurants', icon: Pizza, text: 'Campus Eats' },
      ]
    }
  };

  const NavLink = ({ to, text, icon: Icon }) => {
    const isActive = location.pathname === to;
    return (
      <Link
        to={to}
        className={`relative px-4 py-2.5 rounded-xl font-semibold text-sm transition-all duration-300 flex items-center gap-2 group ${isActive
          ? 'text-white bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 shadow-lg shadow-indigo-500/50'
          : 'text-gray-200 hover:text-white hover:bg-gradient-to-r hover:from-gray-800 hover:to-gray-700'
          }`}
      >
        {Icon && <Icon className={`w-4 h-4 ${isActive ? '' : 'group-hover:scale-110'} transition-transform`} />}
        <span>{text}</span>
      </Link>
    );
  };

  const DropdownMenu = ({ title, items, isOpen, onToggle }) => {
    const hasActive = items.some(item => location.pathname === item.to);

    return (
      <div className="relative">
        <button
          onClick={onToggle}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all duration-300 group ${hasActive || isOpen
            ? 'text-white bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 shadow-lg shadow-indigo-500/50'
            : 'text-gray-200 hover:text-white hover:bg-gradient-to-r hover:from-gray-800 hover:to-gray-700'
            }`}
        >
          <span>{title}</span>
          <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${isOpen ? 'rotate-180' : 'group-hover:scale-110'}`} />
        </button>

        {isOpen && (
          <>
            <div className="fixed inset-0 z-10" onClick={onToggle} />
            <div className="absolute left-0 mt-3 w-64 bg-gray-800/98 backdrop-blur-xl rounded-2xl shadow-2xl shadow-indigo-500/20 border border-gray-700/60 py-2 z-20 animate-fadeIn">
              {items.map((item, idx) => {
                const isActive = location.pathname === item.to;
                return (
                  <Link
                    key={idx}
                    to={item.to}
                    onClick={onToggle}
                    className={`flex items-center gap-3 px-4 py-3 mx-2 rounded-xl text-sm font-medium transition-all ${isActive
                      ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-500/30'
                      : 'text-gray-200 hover:bg-gradient-to-r hover:from-gray-700 hover:to-gray-600 hover:text-white'
                      }`}
                  >
                    <div className={`p-2 rounded-lg ${isActive ? 'bg-white/20' : 'bg-gray-700/80'}`}>
                      <item.icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-gray-300'}`} />
                    </div>
                    <span>{item.text}</span>
                  </Link>
                );
              })}
            </div>
          </>
        )}
      </div>
    );
  };

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled
        ? 'bg-gray-900/95 backdrop-blur-2xl shadow-lg shadow-indigo-500/10 border-b border-gray-700/50'
        : 'bg-gray-900/85 backdrop-blur-xl shadow-md border-b border-gray-800/50'
        }`}>
        <div className="container mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 lg:h-18">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3 group">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl blur-md opacity-0 group-hover:opacity-50 transition-opacity duration-300"></div>
                <img
                  src="/image/482984952_993190959578541_8366529342364279980_n.jpg"
                  alt="SUST"
                  className="relative w-10 h-10 lg:w-12 lg:h-12 rounded-2xl object-cover ring-2 ring-white shadow-lg group-hover:ring-indigo-300 group-hover:scale-105 transition-all duration-300"
                />
              </div>
              <span className="text-lg lg:text-xl font-black tracking-tight">
                <span className="bg-gradient-to-r from-red-500 via-rose-500 to-pink-500 bg-clip-text text-transparent">SUST</span>
                <span className="text-white"> Connect</span>
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-2">
              {user && !isOtherRole && <NavLink to="/feed" text="Newsfeed" icon={Rss} />}

              {Object.entries(menuItems).map(([key, section]) => (
                <DropdownMenu
                  key={key}
                  title={section.title}
                  isOpen={activeDropdown === key}
                  onToggle={() => setActiveDropdown(activeDropdown === key ? null : key)}
                  items={section.items}
                />
              ))}

              {user && !isOtherRole && <NavLink to="/messages" text="Messages" icon={MessageSquare} />}
            </div>

            {/* Right Side */}
            <div className="flex items-center gap-2 sm:gap-3">
              {user ? (
                <>
                  {/* Messages Icon - Mobile Only */}
                  {!isOtherRole && (
                    <Link
                      to="/messages"
                      className="lg:hidden relative p-2 text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all shadow-sm hover:shadow-md hover:scale-110"
                    >
                      <MessageSquare className="w-5 h-5 sm:w-6 sm:h-6" />
                    </Link>
                  )}

                  <NotificationCenter />

                  {/* User Menu - Desktop */}
                  <div className="relative hidden lg:block">
                    <button
                      onClick={() => setShowUserMenu(!showUserMenu)}
                      className="flex items-center gap-2 p-1.5 rounded-full hover:bg-gray-50 transition-all duration-200"
                    >
                      {user.profilePicture ? (
                        <img
                          src={user.profilePicture}
                          alt={user.name}
                          className="w-9 h-9 rounded-full object-cover ring-2 ring-gray-200"
                        />
                      ) : (
                        <div className="w-9 h-9 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                          {user.name?.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${showUserMenu ? 'rotate-180' : ''}`} />
                    </button>

                    {showUserMenu && (
                      <>
                        <div className="fixed inset-0 z-10" onClick={() => setShowUserMenu(false)} />
                        <div className="absolute right-0 mt-2 w-64 bg-gray-800 rounded-xl shadow-xl border border-gray-700 py-2 z-20 animate-in fade-in slide-in-from-top-2 duration-200">
                          <Link
                            to={`/profile/${user._id}`}
                            onClick={() => setShowUserMenu(false)}
                            className="block px-4 py-3 border-b border-gray-700 hover:bg-gray-700 transition-colors cursor-pointer"
                          >
                            <p className="font-bold text-white truncate">{user.name}</p>
                            <p className="text-xs text-gray-400 truncate">{user.email}</p>
                            {user.role && (
                              <span className="inline-block mt-2 px-2 py-1 bg-indigo-600 text-white text-xs font-medium rounded-full capitalize">
                                {user.role}
                              </span>
                            )}
                          </Link>

                          <Link
                            to="/dashboard"
                            onClick={() => setShowUserMenu(false)}
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-200 hover:bg-gray-700 transition-colors"
                          >
                            <LayoutDashboard className="w-5 h-5 text-indigo-400" />
                            <span>Dashboard</span>
                          </Link>

                          <Link
                            to="/notifications"
                            onClick={() => setShowUserMenu(false)}
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-200 hover:bg-gray-700 transition-colors"
                          >
                            <Bell className="w-5 h-5 text-indigo-400" />
                            <span>Notifications</span>
                          </Link>

                          <Link
                            to="/my-restaurants"
                            onClick={() => setShowUserMenu(false)}
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-200 hover:bg-gray-700 transition-colors"
                          >
                            <Store className="w-5 h-5 text-indigo-400" />
                            <span>My Restaurants</span>
                          </Link>

                          {user.role === 'admin' && (
                            <Link
                              to="/admin"
                              onClick={() => setShowUserMenu(false)}
                              className="flex items-center gap-3 px-4 py-2.5 text-sm text-purple-300 hover:bg-purple-900/30 font-medium transition-colors"
                            >
                              <Shield className="w-5 h-5 text-purple-400" />
                              <span>Admin Panel</span>
                            </Link>
                          )}

                          <div className="border-t border-gray-700 my-1" />

                          <button onClick={handleLogout} className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-400 hover:bg-red-900/30 font-medium">
                            <LogOut className="w-5 h-5" />
                            <span>Logout</span>
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </>
              ) : (
                <div className="hidden sm:flex items-center gap-2">
                  <Link to="/login" className="px-4 py-2 text-white hover:text-indigo-300 font-bold text-sm bg-white/10 rounded-lg hover:bg-white/20 transition">
                    Login
                  </Link>
                  <Link to="/register" className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-bold hover:from-indigo-700 hover:to-purple-700 transition text-sm shadow-lg hover:shadow-xl hover:scale-105">
                    Join Now
                  </Link>
                </div>
              )}

              {/* Mobile Menu Button */}
              <button
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                className="lg:hidden p-2 text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all shadow-sm hover:shadow-md"
              >
                {showMobileMenu ? <X className="w-5 h-5 sm:w-6 sm:h-6" /> : <Menu className="w-5 h-5 sm:w-6 sm:h-6" />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {showMobileMenu && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden animate-in fade-in duration-200"
          onClick={() => setShowMobileMenu(false)}
        />
      )}

      {/* Mobile Menu Sidebar */}
      <div className={`fixed top-0 right-0 bottom-0 w-80 max-w-[85vw] bg-gradient-to-br from-white via-indigo-50/30 to-purple-50/30 backdrop-blur-xl z-50 lg:hidden transform transition-transform duration-300 ease-out shadow-2xl border-l-2 border-indigo-200 ${showMobileMenu ? 'translate-x-0' : 'translate-x-full'
        }`}>
        <div className="flex flex-col h-full">
          {/* Mobile Menu Header */}
          <div className="flex items-center justify-between p-4 border-b-2 border-indigo-200 bg-white/80 backdrop-blur-lg">
            <div className="flex items-center gap-2">
              <img
                src="/image/482984952_993190959578541_8366529342364279980_n.jpg"
                alt="SUST"
                className="w-8 h-8 rounded-lg object-cover ring-2 ring-indigo-300 shadow-md"
              />
              <span className="text-lg font-black">
                <span className="bg-gradient-to-r from-red-600 to-rose-700 bg-clip-text text-transparent">SUST</span>
                <span className="bg-gradient-to-r from-gray-900 to-indigo-900 bg-clip-text text-transparent"> Connect</span>
              </span>
            </div>
            <button
              onClick={() => setShowMobileMenu(false)}
              className="p-2 text-gray-600 hover:text-indigo-600 hover:bg-indigo-100 rounded-xl transition-all shadow-sm"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Mobile Menu Content */}
          <div className="flex-1 overflow-y-auto p-4">
            {user && (
              <Link
                to={`/profile/${user._id}`}
                onClick={() => setShowMobileMenu(false)}
                className="block mb-4 p-4 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 rounded-2xl hover:from-indigo-100 hover:to-purple-100 transition-all cursor-pointer shadow-lg border-2 border-white/50"
              >
                <div className="flex items-center gap-3">
                  {user.profilePicture ? (
                    <img src={user.profilePicture} alt={user.name} className="w-14 h-14 rounded-full object-cover ring-2 ring-white shadow-md" />
                  ) : (
                    <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-black text-lg shadow-lg">
                      {user.name?.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-black text-gray-900 truncate text-base">{user.name}</p>
                    <p className="text-xs text-gray-600 truncate">{user.email}</p>
                    {user.role && (
                      <span className="inline-block mt-1 px-2 py-0.5 bg-indigo-100 text-indigo-700 text-xs font-bold rounded-full">
                        {user.role}
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            )}

            {/* Mobile Navigation Links */}
            <div className="space-y-1">
              {user && !isOtherRole && (
                <Link
                  to="/feed"
                  onClick={() => setShowMobileMenu(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all ${location.pathname === '/feed'
                    ? 'bg-indigo-50 text-indigo-600'
                    : 'text-gray-700 hover:bg-gray-50'
                    }`}
                >
                  <Rss className="w-5 h-5" />
                  <span>Newsfeed</span>
                </Link>
              )}

              {Object.entries(menuItems).map(([key, section]) => (
                <div key={key} className="py-2">
                  <div className="px-4 py-2 text-xs font-bold text-gray-500 uppercase tracking-wider">
                    {section.title}
                  </div>
                  {section.items.map((item, idx) => (
                    <Link
                      key={idx}
                      to={item.to}
                      onClick={() => setShowMobileMenu(false)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all ${location.pathname === item.to
                        ? 'bg-indigo-50 text-indigo-600'
                        : 'text-gray-700 hover:bg-gray-50'
                        }`}
                    >
                      <item.icon className="w-5 h-5" />
                      <span>{item.text}</span>
                    </Link>
                  ))}
                </div>
              ))}

              {user && !isOtherRole && (
                <Link
                  to="/messages"
                  onClick={() => setShowMobileMenu(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all ${location.pathname === '/messages'
                    ? 'bg-indigo-50 text-indigo-600'
                    : 'text-gray-700 hover:bg-gray-50'
                    }`}
                >
                  <MessageSquare className="w-5 h-5" />
                  <span>Messages</span>
                </Link>
              )}
            </div>

            {user && (
              <>
                <div className="my-4 border-t border-gray-200" />
                <div className="space-y-1">
                  <Link
                    to="/dashboard"
                    onClick={() => setShowMobileMenu(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-50 font-medium transition-colors"
                  >
                    <LayoutDashboard className="w-5 h-5 text-indigo-500" />
                    <span>Dashboard</span>
                  </Link>
                  <Link
                    to="/notifications"
                    onClick={() => setShowMobileMenu(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-50 font-medium transition-colors"
                  >
                    <Bell className="w-5 h-5 text-indigo-500" />
                    <span>Notifications</span>
                  </Link>
                  <Link
                    to="/my-restaurants"
                    onClick={() => setShowMobileMenu(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-50 font-medium transition-colors"
                  >
                    <Store className="w-5 h-5 text-indigo-500" />
                    <span>My Restaurants</span>
                  </Link>
                  {user.role === 'admin' && (
                    <Link
                      to="/admin"
                      onClick={() => setShowMobileMenu(false)}
                      className="flex items-center gap-3 px-4 py-3 rounded-lg text-purple-700 hover:bg-purple-50 font-medium transition-colors"
                    >
                      <Shield className="w-5 h-5 text-purple-600" />
                      <span>Admin Panel</span>
                    </Link>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Mobile Menu Footer */}
          <div className="p-4 border-t border-gray-200">
            {user ? (
              <button
                onClick={() => {
                  handleLogout();
                  setShowMobileMenu(false);
                }}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-50 text-red-600 rounded-lg font-medium hover:bg-red-100 transition-all"
              >
                <LogOut className="w-5 h-5" />
                <span>Logout</span>
              </button>
            ) : (
              <div className="space-y-2">
                <Link
                  to="/login"
                  onClick={() => setShowMobileMenu(false)}
                  className="block w-full px-4 py-3 text-center text-gray-700 bg-gray-100 rounded-lg font-medium hover:bg-gray-200 transition-all"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  onClick={() => setShowMobileMenu(false)}
                  className="block w-full px-4 py-3 text-center text-white bg-indigo-600 rounded-lg font-medium hover:bg-indigo-700 transition-all shadow-sm"
                >
                  Join Now
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Spacer to prevent content from going under fixed navbar */}
      <div className="h-16" />
    </>
  );
};

export default Navbar;
