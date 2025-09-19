import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  PlusIcon,
  ClockIcon,
  BellIcon,
  UserIcon,
  PhoneIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  HeartIcon
} from '@heroicons/react/24/outline';

const QuickActions = () => {
  const actions = [
    {
      title: 'Add Medicine',
      description: 'Add a new medicine to your list',
      icon: PlusIcon,
      color: 'bg-gradient-to-r from-blue-500 to-blue-600',
      hoverColor: 'hover:from-blue-600 hover:to-blue-700',
      link: '/medicines/add',
      badge: null
    },
    {
      title: 'Set Reminder',
      description: 'Create a new reminder schedule',
      icon: BellIcon,
      color: 'bg-gradient-to-r from-purple-500 to-purple-600',
      hoverColor: 'hover:from-purple-600 hover:to-purple-700',
      link: '/reminders/add',
      badge: null
    },
    {
      title: 'View Reports',
      description: 'Check your adherence reports',
      icon: ChartBarIcon,
      color: 'bg-gradient-to-r from-green-500 to-green-600',
      hoverColor: 'hover:from-green-600 hover:to-green-700',
      link: '/reports',
      badge: 'New'
    },
    {
      title: 'Emergency Contact',
      description: 'Quick access to emergency contacts',
      icon: PhoneIcon,
      color: 'bg-gradient-to-r from-red-500 to-red-600',
      hoverColor: 'hover:from-red-600 hover:to-red-700',
      link: '/emergency',
      badge: null
    },
    {
      title: 'Profile Settings',
      description: 'Update your profile and preferences',
      icon: UserIcon,
      color: 'bg-gradient-to-r from-gray-500 to-gray-600',
      hoverColor: 'hover:from-gray-600 hover:to-gray-700',
      link: '/profile',
      badge: null
    },
    {
      title: 'Health Insights',
      description: 'View your health insights and trends',
      icon: HeartIcon,
      color: 'bg-gradient-to-r from-pink-500 to-pink-600',
      hoverColor: 'hover:from-pink-600 hover:to-pink-700',
      link: '/insights',
      badge: null
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.5 }}
      className="relative bg-white rounded-xl shadow-lg p-6 overflow-hidden"
    >
      {/* PatternCraft Background */}
      <div className="absolute inset-0 opacity-10" style={{
        backgroundImage: `
          linear-gradient(45deg, rgba(59, 130, 246, 0.1) 25%, transparent 25%),
          linear-gradient(-45deg, rgba(59, 130, 246, 0.1) 25%, transparent 25%),
          linear-gradient(45deg, transparent 75%, rgba(59, 130, 246, 0.1) 75%),
          linear-gradient(-45deg, transparent 75%, rgba(59, 130, 246, 0.1) 75%)
        `,
        backgroundSize: '20px 20px',
        backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px'
      }} />
      
      <div className="relative">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <Cog6ToothIcon className="h-6 w-6 text-pill-600" />
            <h2 className="text-xl font-semibold text-gray-900">Quick Actions</h2>
          </div>
        </div>

        {/* Actions Grid */}
        <div className="grid grid-cols-1 gap-3">
          {actions.map((action, index) => (
            <motion.div
              key={action.title}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Link
                to={action.link}
                className={`relative block p-4 ${action.color} ${action.hoverColor} text-white rounded-lg shadow-md transition-all duration-200 group overflow-hidden`}
              >
                {/* Hover effect background */}
                <div className="absolute inset-0 bg-white/10 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
                
                <div className="relative flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    <action.icon className="h-6 w-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium truncate">{action.title}</p>
                      {action.badge && (
                        <span className="ml-2 px-2 py-1 text-xs bg-white/20 rounded-full">
                          {action.badge}
                        </span>
                      )}
                    </div>
                    <p className="text-xs opacity-90 mt-1">{action.description}</p>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Quick Stats */}
        <div className="mt-6 pt-4 border-t border-gray-200">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-lg font-semibold text-pill-600">5</div>
              <div className="text-xs text-gray-500">Active</div>
            </div>
            <div>
              <div className="text-lg font-semibold text-green-600">3</div>
              <div className="text-xs text-gray-500">Today</div>
            </div>
            <div>
              <div className="text-lg font-semibold text-orange-600">2</div>
              <div className="text-xs text-gray-500">Pending</div>
            </div>
          </div>
        </div>

        {/* Emergency Button */}
        <div className="mt-4">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full p-3 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-lg shadow-md transition-all duration-200 flex items-center justify-center space-x-2"
          >
            <PhoneIcon className="h-5 w-5" />
            <span className="font-medium">Emergency Call</span>
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

export default QuickActions;
