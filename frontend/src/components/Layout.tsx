import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const Layout = () => {
  const { user, logout } = useAuth();
  const location = useLocation();  const navigation = [
    { name: 'Trang chủ', href: '/', icon: '🏠' },
    { name: 'Demo', href: '/demo', icon: '⭐' },
    { name: 'Bản đồ', href: '/map', icon: '🗺️' },
    { name: 'Chatbot', href: '/chat', icon: '🤖' },
    { name: 'Thời tiết', href: '/weather', icon: '☁️' },
    { name: 'Đặt vé', href: '/booking', icon: '✈️' },
  ];
  if (user?.is_admin) {
    navigation.push({ name: 'Admin', href: '/admin', icon: '⚙️' });
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50">      {/* Navigation */}
      <nav className="bg-white/95 backdrop-blur-sm shadow-lg border-b border-pink-100">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center">
            {/* Logo */}
            <Link to="/" className="flex items-center py-4 px-2">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-sm">T</span>
                </div>
                <span className="font-bold text-gray-800 text-lg bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                  TravelMate
                </span>
              </div>
            </Link>

            {/* Navigation Links - Desktop */}
            <div className="hidden lg:flex items-center space-x-1">
              {user && navigation.map((item) => {
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`flex items-center py-2 px-3 text-sm font-medium transition-all duration-200 rounded-lg hover:bg-pink-50 whitespace-nowrap ${
                      location.pathname === item.href
                        ? 'text-pink-600 bg-pink-50 border-b-2 border-pink-500'
                        : 'text-gray-600 hover:text-pink-600'
                    }`}
                  >
                    <span className="mr-1.5">{item.icon}</span>
                    {item.name}
                  </Link>
                );
              })}
            </div>

            {/* User Menu */}
            <div className="flex items-center space-x-3">
              {user ? (
                <>
                  {/* Profile Link - Enhanced */}
                  <Link
                    to="/profile"
                    className="flex items-center space-x-2 text-gray-700 hover:text-pink-600 py-2 px-4 rounded-lg hover:bg-pink-50 transition-all duration-200 border border-gray-200 hover:border-pink-200"
                  >
                    <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-bold">
                        {(user.full_name || user.username || 'U').charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <span className="font-medium hidden sm:block">{user.full_name || user.username}</span>
                  </Link>
                  
                  {/* Logout Button - Smaller */}
                  <button
                    onClick={logout}
                    className="flex items-center space-x-1.5 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-medium py-2 px-3 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg text-sm"
                  >
                    <span className="text-base">🚪</span>
                    <span className="hidden sm:block">Đăng xuất</span>
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="text-gray-600 hover:text-pink-600 py-2 px-3 rounded-lg hover:bg-pink-50 transition-all duration-200"
                  >
                    Đăng nhập
                  </Link>
                  <Link
                    to="/register"
                    className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-medium py-2 px-4 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
                  >
                    Đăng ký
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Mobile Navigation */}
          {user && (
            <div className="lg:hidden pb-3">
              <div className="flex flex-wrap gap-2">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`flex items-center py-2 px-3 text-sm font-medium transition-all duration-200 rounded-lg ${
                      location.pathname === item.href
                        ? 'text-pink-600 bg-pink-50 border border-pink-200'
                        : 'text-gray-600 hover:text-pink-600 hover:bg-pink-50 border border-gray-200'
                    }`}
                  >
                    <span className="mr-1.5">{item.icon}</span>
                    {item.name}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Main content */}
      <main className="max-w-7xl mx-auto py-6 px-4">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
