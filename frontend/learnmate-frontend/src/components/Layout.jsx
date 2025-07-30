import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  HomeIcon,
  DocumentArrowUpIcon,
  QuestionMarkCircleIcon,
  CalendarIcon,
  BookOpenIcon,
  AcademicCapIcon,
  MagnifyingGlassIcon,
  ChartBarIcon,
  Bars3Icon,
  XMarkIcon,
  UserCircleIcon,
  Cog6ToothIcon,
  LifebuoyIcon,
  ArrowLeftOnRectangleIcon,
  BellIcon,
  ChevronDownIcon,
  LightBulbIcon,
  BookmarkIcon,
  ClipboardDocumentIcon
} from '@heroicons/react/24/outline';

const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [expanded, setExpanded] = useState(true);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const location = useLocation();

  const navigation = [
    { name: 'Dashboard', href: '/', icon: HomeIcon, badge: null },
    { name: 'Test Analysis', href: '/upload-test', icon: DocumentArrowUpIcon, badge: 'New' },
    { name: 'Ask AI Tutor', href: '/ask-questions', icon: QuestionMarkCircleIcon, badge: null },
    { name: 'Study Plan', href: '/generate-schedule', icon: CalendarIcon, badge: null },
    { name: 'Knowledge Base', href: '/add-content', icon: BookOpenIcon, badge: null },
    { name: 'Practice Mode', href: '/practice-questions', icon: AcademicCapIcon, badge: '3' },
    { name: 'Advanced Search', href: '/search-content', icon: MagnifyingGlassIcon, badge: null },
    { name: 'Performance', href: '/analytics', icon: ChartBarIcon, badge: null },
  ];

  const secondaryNavigation = [
    { name: 'Saved Items', href: '/saved', icon: BookmarkIcon },
    { name: 'Study Notes', href: '/notes', icon: ClipboardDocumentIcon },
    { name: 'Learning Tips', href: '/tips', icon: LightBulbIcon },
  ];

  const settingsNavigation = [
    { name: 'Profile Settings', href: '/settings', icon: Cog6ToothIcon },
    { name: 'Help Center', href: '/help', icon: LifebuoyIcon },
    { name: 'Sign Out', href: '/logout', icon: ArrowLeftOnRectangleIcon },
  ];

  const notifications = [
    { id: 1, title: 'New practice test available', time: '10 min ago', read: false },
    { id: 2, title: 'Study plan updated', time: '1 hour ago', read: true },
    { id: 3, title: 'Your question was answered', time: '3 hours ago', read: true },
  ];

  // Close dropdowns when clicking elsewhere
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileOpen && !event.target.closest('.profile-menu')) {
        setProfileOpen(false);
      }
      if (notificationsOpen && !event.target.closest('.notifications-menu')) {
        setNotificationsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [profileOpen, notificationsOpen]);

  return (
    <div className="h-screen flex bg-gray-50 overflow-hidden">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 flex z-40 lg:hidden transition-opacity duration-300 ease-in-out">
          <div 
            className="fixed inset-0 bg-gray-900 bg-opacity-80 transition-opacity" 
            onClick={() => setSidebarOpen(false)} 
          />
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-gradient-to-b from-gray-900 to-gray-800 shadow-xl transform transition-all duration-300 ease-in-out">
            <div className="absolute top-0 right-0 -mr-14 pt-4">
              <button
                type="button"
                className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-white"
                onClick={() => setSidebarOpen(false)}
              >
                <XMarkIcon className="h-6 w-6 text-white" />
              </button>
            </div>
            <SidebarContent 
              navigation={navigation} 
              secondaryNavigation={secondaryNavigation}
              settingsNavigation={settingsNavigation} 
              currentPath={location.pathname} 
              expanded={true}
              mobile={true}
            />
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <div className={`hidden lg:flex lg:flex-shrink-0 transition-all duration-300 ease-in-out ${expanded ? 'w-72' : 'w-20'}`}>
        <div className="flex flex-col w-full bg-gradient-to-b from-gray-900 to-gray-800 shadow-xl">
          <SidebarContent 
            navigation={navigation} 
            secondaryNavigation={secondaryNavigation}
            settingsNavigation={settingsNavigation} 
            currentPath={location.pathname} 
            expanded={expanded}
            setExpanded={setExpanded}
          />
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
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">🎓 Learning Copilot</h1>
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
                <button 
                  onClick={() => setExpanded(!expanded)}
                  className="p-1.5 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                  </svg>
                </button>
                <div className="ml-4 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition duration-150"
                    placeholder="Search lessons, topics, questions..."
                    type="search"
                  />
                </div>
              </div>
              
              <div className="flex items-center space-x-5">
                <div className="relative notifications-menu">
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
                
                <div className="ml-3 relative profile-menu">
                  <button 
                    onClick={() => setProfileOpen(!profileOpen)}
                    className="flex items-center space-x-2 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-full"
                  >
                    <div className="relative">
                      <div className="h-9 w-9 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center">
                        <span className="font-medium text-white text-sm">AJ</span>
                      </div>
                      <span className="absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full ring-2 ring-white bg-green-400"></span>
                    </div>
                    {expanded && (
                      <div className="text-left">
                        <p className="text-sm font-medium text-gray-900">Alex Johnson</p>
                        <p className="text-xs text-gray-500">Grade 12</p>
                      </div>
                    )}
                    {expanded && (
                      <ChevronDownIcon className={`h-4 w-4 text-gray-500 transform transition-transform duration-200 ${profileOpen ? 'rotate-180' : ''}`} />
                    )}
                  </button>
                  
                  {profileOpen && (
                    <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none transform transition-all duration-200 ease-out">
                      <div className="py-1">
                        <div className="px-4 py-2 border-b border-gray-200">
                          <p className="text-sm text-gray-700">Signed in as</p>
                          <p className="text-sm font-medium text-gray-900 truncate">alex.johnson@example.com</p>
                        </div>
                        {settingsNavigation.map((item) => (
                          <Link
                            key={item.name}
                            to={item.href}
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          >
                            {item.name}
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1 relative overflow-y-auto focus:outline-none bg-gradient-to-br from-gray-50 to-gray-100">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

const SidebarContent = ({ navigation, secondaryNavigation, settingsNavigation, currentPath, expanded, setExpanded, mobile }) => {
  const [activeGroup, setActiveGroup] = useState(null);

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
        {/* Logo and collapse button */}
        <div className={`flex items-center justify-between px-4 ${expanded ? 'mb-8' : 'mb-10'}`}>
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg p-2 group-hover:from-blue-600 group-hover:to-indigo-700 transition-colors duration-200">
              <AcademicCapIcon className="h-6 w-6 text-white" />
            </div>
            {expanded && (
              <h1 className="text-xl font-bold text-white tracking-tight">Learning Copilot</h1>
            )}
          </Link>
          {expanded && !mobile && (
            <button 
              onClick={() => setExpanded(false)}
              className="p-1 text-gray-400 hover:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-white"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M15.707 15.707a1 1 0 01-1.414 0l-5-5a1 1 0 010-1.414l5-5a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
            </button>
          )}
        </div>
        
        {/* User profile */}
        <div className={`px-4 mb-6 ${expanded ? 'flex items-center space-x-3' : 'flex flex-col items-center'}`}>
          <div className="relative">
            <div className="h-11 w-11 rounded-full bg-gradient-to-r from-blue-400 to-indigo-500 flex items-center justify-center shadow-sm">
              <span className="font-medium text-white">AJ</span>
            </div>
            <span className="absolute bottom-0 right-0 block h-3 w-3 rounded-full ring-2 ring-gray-800 bg-green-400"></span>
          </div>
          {expanded && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">Alex Johnson</p>
              <p className="text-xs text-gray-300 truncate">Student ID: STU-7894</p>
            </div>
          )}
        </div>
        
        {/* Main navigation */}
        <nav className={`flex-1 px-2 space-y-1 ${expanded ? '' : 'flex flex-col items-center'}`}>
          {navigation.map((item) => {
            const isActive = currentPath === item.href;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ${
                  isActive 
                    ? 'bg-gray-700 text-white shadow'
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                } ${expanded ? '' : 'justify-center w-12'}`}
              >
                <div className="relative">
                  <item.icon className={`${isActive ? 'text-white' : 'text-gray-400 group-hover:text-white'} ${expanded ? 'mr-3' : ''} flex-shrink-0 h-5 w-5`} />
                  {item.badge && (
                    <span className="absolute -top-2 -right-2 bg-blue-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">
                      {item.badge}
                    </span>
                  )}
                </div>
                {expanded && item.name}
              </Link>
            );
          })}
        </nav>

        {/* Secondary navigation */}
        {expanded && (
          <div className="mt-6 px-4">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
              Learning Resources
            </h3>
            <nav className="space-y-1">
              {secondaryNavigation.map((item) => {
                const isActive = currentPath === item.href;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
                      isActive 
                        ? 'bg-gray-700 text-white'
                        : 'text-gray-400 hover:bg-gray-700 hover:text-white'
                    }`}
                  >
                    <item.icon className={`${isActive ? 'text-white' : 'text-gray-400 group-hover:text-white'} mr-3 flex-shrink-0 h-5 w-5`} />
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          </div>
        )}
      </div>
      
      {/* Settings navigation */}
      <div className="px-2 pb-4">
        {!mobile && !expanded && (
          <button 
            onClick={() => setExpanded(true)}
            className="w-full flex items-center justify-center p-2 text-gray-400 hover:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-white mb-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </button>
        )}
        
        <nav className={`space-y-1 ${expanded ? '' : 'flex flex-col items-center'}`}>
          {settingsNavigation.map((item) => (
            <Link
              key={item.name}
              to={item.href}
              className={`group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200 text-gray-400 hover:bg-gray-700 hover:text-white ${expanded ? '' : 'justify-center w-12'}`}
            >
              <item.icon className={`text-gray-400 group-hover:text-white ${expanded ? 'mr-3' : ''} flex-shrink-0 h-5 w-5`} />
              {expanded && item.name}
            </Link>
          ))}
        </nav>
        
        {expanded && (
          <div className="mt-4 pt-4 border-t border-gray-700">
            <div className="text-xs text-gray-400 px-3">
              <div className="flex items-center justify-between mb-1">
                <span>Storage</span>
                <span>25% used</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-1.5">
                <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: '25%' }}></div>
              </div>
            </div>
            <div className="mt-3 text-center">
              <span className="text-xs text-gray-500">v2.4.0</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Layout;