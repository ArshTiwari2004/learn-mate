import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  HomeIcon,
  DocumentArrowUpIcon,
  QuestionMarkCircleIcon,
  CalendarIcon,
  AcademicCapIcon,
  MagnifyingGlassIcon,
  Bars3Icon,
  XMarkIcon,
  BellIcon,
  ChevronDownIcon
} from '@heroicons/react/24/outline';
import { UserButton, useUser } from '@clerk/clerk-react';

const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const location = useLocation();

  const { user } = useUser();

  const navigation = [
    { name: 'Dashboard', href: '/', icon: HomeIcon },
    { name: 'Test Analysis', href: '/upload-test', icon: DocumentArrowUpIcon },
    { name: 'Ask AI Tutor', href: '/ask-questions', icon: QuestionMarkCircleIcon },
    { name: 'Study Plan', href: '/generate-schedule', icon: CalendarIcon },
    { name: 'Practice Mode', href: '/practice-questions', icon: AcademicCapIcon },
    { name: 'Advanced Search', href: '/search-content', icon: MagnifyingGlassIcon },
  ];

  const notifications = [
    { id: 1, title: 'New practice test available', time: '10 min ago', read: false },
    { id: 2, title: 'Study plan updated', time: '1 hour ago', read: true },
    { id: 3, title: 'Your question was answered', time: '3 hours ago', read: true },
  ];

  const initials = user?.firstName?.[0] + user?.lastName?.[0] || 'U';

  console.log('User:', user);

  return (
    <div className="h-screen flex bg-gray-50 overflow-hidden">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden transition-opacity duration-300 ease-in-out">
          <div 
            className="fixed inset-0 bg-gray-900/80 backdrop-blur-sm" 
            onClick={() => setSidebarOpen(false)} 
          />
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white shadow-xl transform transition-all duration-300 ease-in-out">
            <div className="absolute top-0 right-0 -mr-14 pt-4">
              <button
                type="button"
                className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-white"
                onClick={() => setSidebarOpen(false)}
              >
                <XMarkIcon className="h-6 w-6 text-gray-600" />
              </button>
            </div>
            <div className="flex-1 h-0 pt-8 pb-4 overflow-y-auto">
              <div className="flex-shrink-0 flex items-center px-6 mb-8">
                <div className="h-10 w-10 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center mr-3">
                  <AcademicCapIcon className="h-6 w-6 text-white" />
                </div>
                <h1 className="text-xl font-bold text-gray-900">EduGuide</h1>
              </div>
              <nav className="px-4 space-y-1">
                {navigation.map((item) => {
                  const isActive = location.pathname === item.href;
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      className={`group flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors duration-200 ${
                        isActive 
                          ? 'bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-600 shadow-sm'
                          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                      }`}
                    >
                      <item.icon className={`mr-3 h-5 w-5 flex-shrink-0 ${
                        isActive ? 'text-blue-500' : 'text-gray-500 group-hover:text-gray-700'
                      }`} />
                      {item.name}
                    </Link>
                  );
                })}
              </nav>
            </div>
            <div className="p-4 border-t border-gray-200">
              <div className="flex items-center px-4">
                <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center">
                  <span className="font-medium text-white text-sm">AJ</span>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">Alex Johnson</p>
                  <p className="text-xs text-gray-500">Grade 12</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <div className="hidden lg:flex lg:flex-shrink-0">
        <div className="flex flex-col w-64 border-r border-gray-200 bg-white shadow-sm">
          <div className="flex-1 flex flex-col pt-8 pb-4 overflow-y-auto">
            <div className="flex items-center px-6 mb-8">
              <div className="h-10 w-10 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center mr-3">
                <AcademicCapIcon className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-xl font-bold text-gray-900">LearnMate</h1>
            </div>
            <nav className="flex-1 px-4 space-y-1">
              {navigation.map((item) => {
                const isActive = location.pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`group flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors duration-200 ${
                      isActive 
                        ? 'bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-600 shadow-sm'
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                    }`}
                  >
                    <item.icon className={`mr-3 h-5 w-5 flex-shrink-0 ${
                      isActive ? 'text-blue-500' : 'text-gray-500 group-hover:text-gray-700'
                    }`} />
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          </div>
         <div className="p-4 border-t border-gray-200">
  <div className="flex items-center px-4">

    <div className="h-10 w-10 flex-shrink-0 rounded-full overflow-hidden bg-gray-200">
      {user?.imageUrl ? (
        <img
          src={user.imageUrl}
          alt="User profile"
          className="h-full w-full object-cover"
        />
      ) : (
        <div className="h-full w-full bg-blue-500 text-white flex items-center justify-center text-sm font-medium">
          {(user?.firstName?.[0] || '') + (user?.lastName?.[0] || '')}
        </div>
      )}
    </div>


<Link to="/profile" className="ml-3 min-w-0 block">
  <p className="text-sm font-medium text-gray-900 truncate">
    {user?.firstName} {user?.lastName}
  </p>
  <p
    className="text-xs text-gray-500 truncate max-w-[160px]"
    title={user?.primaryEmailAddress?.emailAddress}
  >
    {user?.primaryEmailAddress?.emailAddress || "No email provided"}
  </p>
</Link>

  </div>
</div>

        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-col w-0 flex-1 overflow-hidden">
        {/* Mobile header */}
        <div className="lg:hidden">
          <div className="relative z-10 flex-shrink-0 flex h-16 bg-white shadow-sm">
            <button
              type="button"
              className="px-4 border-r border-gray-200 text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              onClick={() => setSidebarOpen(true)}
            >
              <Bars3Icon className="h-6 w-6" />
            </button>
            <div className="flex-1 px-4 flex justify-between items-center">
              <div className="flex items-center">
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">LearnMate</h1>
              </div>
              <div className="flex items-center space-x-2">
                <button className="p-1 text-gray-500 rounded-full hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <BellIcon className="h-6 w-6" />
                </button>
                <div className="ml-2 relative">
                  <div className="h-8 w-8 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center">
                    <span className="font-medium text-white text-sm">AJ</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Desktop header */}
       <div className="hidden lg:block">
        <div className="relative z-10 flex-shrink-0 flex h-16 bg-white shadow-sm">
          <div className="flex-1 px-6 flex justify-between items-center">
            <div className="flex items-center">
              <div className="relative w-96">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition duration-150"
                  placeholder="Search lessons, topics, questions..."
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            <div className="flex items-center space-x-5">
              {/* Notifications */}
              <div className="relative">
                <button 
                  onClick={() => setNotificationsOpen(!notificationsOpen)}
                  className="p-1 text-gray-500 hover:text-gray-700 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 relative"
                >
                  <BellIcon className="h-6 w-6" />
                  <span className="absolute top-0 right-0 block h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white"></span>
                </button>

                {notificationsOpen && (
                  <div className="origin-top-right absolute right-0 mt-2 w-80 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none transform transition-all duration-200 ease-out">
                    <div className="py-1">
                      <div className="px-4 py-2 border-b border-gray-200">
                        <h3 className="text-sm font-medium text-gray-900">Notifications</h3>
                      </div>
                      {notifications.map((notification) => (
                        <div 
                          key={notification.id} 
                          className={`px-4 py-3 hover:bg-gray-50 cursor-pointer ${!notification.read ? 'bg-blue-50' : ''}`}
                        >
                          <div className="flex items-start">
                            <div className="flex-shrink-0 pt-0.5">
                              <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                            </div>
                            <div className="ml-3 flex-1">
                              <p className="text-sm font-medium text-gray-900">{notification.title}</p>
                              <p className="text-xs text-gray-500">{notification.time}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                      <div className="border-t border-gray-200 px-4 py-2">
                        <a href="#" className="text-xs font-medium text-blue-600 hover:text-blue-800">
                          View all notifications
                        </a>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Clerk User Button */}
              <div className="ml-3 relative">
                <UserButton afterSignOutUrl="/" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Page content */}
      <div className="flex-1 relative overflow-y-auto focus:outline-none bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {children}
          </div>
        </div>
      </div>
    </div>
  </div>
  );
};

export default Layout;
