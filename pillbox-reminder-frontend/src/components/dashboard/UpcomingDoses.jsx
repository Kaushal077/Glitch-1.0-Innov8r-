import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ClockIcon,
  BellIcon,
  CalendarIcon,
  ChevronRightIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon,
  InformationCircleIcon,
  BeakerIcon,
  EyeDropperIcon,
  CapsuleIcon,
  HeartIcon
} from '@heroicons/react/24/outline';
import { format, addHours, isToday, isTomorrow, addDays, differenceInMinutes, differenceInHours, isPast, isFuture } from 'date-fns';
import { useReminders } from '../hooks/useReminders';
import toast from 'react-hot-toast';

const UpcomingDoses = () => {
  const { upcomingReminders, refreshReminders } = useReminders();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [viewMode, setViewMode] = useState('today'); // today, tomorrow, week
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Update every minute
    
    return () => clearInterval(timer);
  }, []);

  // Enhanced mock data for upcoming reminders - replace with actual data
  const mockUpcoming = [
    {
      id: 1,
      medicine: { 
        name: 'Vitamin D3', 
        dosage: '1000 IU',
        type: 'tablet',
        color: '#0ea5e9'
      },
      scheduledTime: addHours(new Date(), 1),
      instructions: 'Take with food for better absorption',
      priority: 'medium',
      category: 'Vitamin',
      reminderEnabled: true
    },
    {
      id: 2,
      medicine: { 
        name: 'Metformin', 
        dosage: '500mg',
        type: 'tablet',
        color: '#ef4444'
      },
      scheduledTime: addHours(new Date(), 2),
      instructions: 'Take 30 minutes before meals',
      priority: 'high',
      category: 'Diabetes',
      reminderEnabled: true
    },
    {
      id: 3,
      medicine: { 
        name: 'Omega-3', 
        dosage: '1000mg',
        type: 'capsule',
        color: '#8b5cf6'
      },
      scheduledTime: addHours(new Date(), 4),
      instructions: 'Take with water, preferably with meals',
      priority: 'low',
      category: 'Supplement',
      reminderEnabled: true
    },
    {
      id: 4,
      medicine: { 
        name: 'Lisinopril', 
        dosage: '10mg',
        type: 'tablet',
        color: '#f59e0b'
      },
      scheduledTime: addDays(new Date(), 1).setHours(8, 0, 0, 0),
      instructions: 'Take in the morning, same time daily',
      priority: 'high',
      category: 'Blood Pressure',
      reminderEnabled: true
    },
    {
      id: 5,
      medicine: { 
        name: 'Calcium Carbonate', 
        dosage: '500mg',
        type: 'tablet',
        color: '#06d6a0'
      },
      scheduledTime: addDays(new Date(), 1).setHours(20, 0, 0, 0),
      instructions: 'Take with vitamin D for better absorption',
      priority: 'medium',
      category: 'Supplement',
      reminderEnabled: false
    },
    {
      id: 6,
      medicine: { 
        name: 'Eye Drops', 
        dosage: '1-2 drops',
        type: 'drops',
        color: '#84cc16'
      },
      scheduledTime: addHours(new Date(), 6),
      instructions: 'Tilt head back, apply to lower eyelid',
      priority: 'medium',
      category: 'Eye Care',
      reminderEnabled: true
    }
  ];

  const getFilteredReminders = () => {
    const reminders = upcomingReminders || mockUpcoming;
    const now = new Date();
    
    return reminders.filter(reminder => {
      const reminderDate = new Date(reminder.scheduledTime);
      
      switch (viewMode) {
        case 'today':
          return isToday(reminderDate) && isFuture(reminderDate);
        case 'tomorrow':
          return isTomorrow(reminderDate);
        case 'week':
          return isFuture(reminderDate) && reminderDate <= addDays(now, 7);
        default:
          return isToday(reminderDate) && isFuture(reminderDate);
      }
    }).sort((a, b) => new Date(a.scheduledTime) - new Date(b.scheduledTime));
  };

  const getPriorityColor = (priority) => {
    const colors = {
      high: 'bg-red-100 text-red-800 border-red-200 ring-red-500/20',
      medium: 'bg-yellow-100 text-yellow-800 border-yellow-200 ring-yellow-500/20',
      low: 'bg-green-100 text-green-800 border-green-200 ring-green-500/20'
    };
    return colors[priority] || colors.medium;
  };

  const getMedicineIcon = (type) => {
    const icons = {
      tablet: CapsuleIcon,
      capsule: BeakerIcon,
      liquid: EyeDropperIcon,
      drops: EyeDropperIcon,
      injection: BeakerIcon,
      inhaler: BeakerIcon
    };
    return icons[type] || CapsuleIcon;
  };

  const getTimeUntil = (scheduledTime) => {
    const now = new Date();
    const scheduled = new Date(scheduledTime);
    
    if (isPast(scheduled)) return 'Overdue';
    
    const diffMinutes = differenceInMinutes(scheduled, now);
    const diffHours = differenceInHours(scheduled, now);
    
    if (diffMinutes < 60) {
      return `${diffMinutes}m`;
    } else if (diffHours < 24) {
      const remainingMinutes = diffMinutes % 60;
      return `${diffHours}h ${remainingMinutes}m`;
    } else {
      const days = Math.floor(diffHours / 24);
      const remainingHours = diffHours % 24;
      return `${days}d ${remainingHours}h`;
    }
  };

  const getUrgencyLevel = (scheduledTime) => {
    const diffMinutes = differenceInMinutes(new Date(scheduledTime), new Date());
    
    if (diffMinutes < 0) return 'overdue';
    if (diffMinutes <= 30) return 'urgent';
    if (diffMinutes <= 120) return 'soon';
    return 'upcoming';
  };

  const getUrgencyStyle = (urgency) => {
    const styles = {
      overdue: 'border-l-4 border-red-500 bg-red-50',
      urgent: 'border-l-4 border-orange-500 bg-orange-50',
      soon: 'border-l-4 border-yellow-500 bg-yellow-50',
      upcoming: 'border-l-4 border-blue-500 bg-blue-50'
    };
    return styles[urgency] || styles.upcoming;
  };

  const handleRefresh = async () => {
    setIsLoading(true);
    try {
      await refreshReminders?.();
      toast.success('Reminders updated successfully!');
    } catch (error) {
      toast.error('Failed to refresh reminders');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickSnooze = (reminderId, minutes = 15) => {
    toast.success(`Reminder snoozed for ${minutes} minutes`);
    // Implement actual snooze logic here
  };

  const filteredReminders = getFilteredReminders().slice(0, 8); // Show max 8 upcoming

  const getViewModeStats = () => {
    const all = getFilteredReminders();
    return {
      total: all.length,
      high: all.filter(r => r.priority === 'high').length,
      urgent: all.filter(r => getUrgencyLevel(r.scheduledTime) === 'urgent').length
    };
  };

  const stats = getViewModeStats();

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.7 }}
      className="relative bg-white rounded-xl shadow-lg overflow-hidden"
    >
      {/* PatternCraft Background */}
      <div className="absolute inset-0 opacity-10" style={{
        backgroundImage: `
          repeating-linear-gradient(
            45deg,
            transparent,
            transparent 12px,
            rgba(59, 130, 246, 0.08) 12px,
            rgba(59, 130, 246, 0.08) 24px
          ),
          radial-gradient(circle at 2px 2px, rgba(59, 130, 246, 0.15) 1px, transparent 0)
        `,
        backgroundSize: '100% 100%, 20px 20px'
      }} />
      
      <div className="relative p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-pill-100 rounded-lg">
              <ClockIcon className="h-6 w-6 text-pill-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Upcoming Doses</h2>
              <p className="text-sm text-gray-500">
                {stats.total} scheduled • {stats.high} high priority
              </p>
            </div>
          </div>
          
          <button
            onClick={handleRefresh}
            disabled={isLoading}
            className="p-2 text-gray-400 hover:text-pill-600 hover:bg-pill-50 rounded-lg transition-colors duration-200 disabled:opacity-50"
          >
            <ArrowPathIcon className={`h-5 w-5 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* View Mode Selector */}
        <div className="flex space-x-1 mb-6 bg-gray-100 rounded-lg p-1">
          {[
            { key: 'today', label: 'Today', count: getFilteredReminders().length },
            { key: 'tomorrow', label: 'Tomorrow', count: 0 },
            { key: 'week', label: 'This Week', count: 0 }
          ].map((mode) => (
            <button
              key={mode.key}
              onClick={() => setViewMode(mode.key)}
              className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                viewMode === mode.key
                  ? 'bg-white text-pill-600 shadow-sm ring-2 ring-pill-100'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
              }`}
            >
              <span>{mode.label}</span>
              {mode.count > 0 && (
                <span className={`ml-1 px-1.5 py-0.5 text-xs rounded-full ${
                  viewMode === mode.key ? 'bg-pill-100 text-pill-700' : 'bg-gray-200 text-gray-600'
                }`}>
                  {mode.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Upcoming Reminders List */}
        <div className="space-y-3 max-h-96 overflow-y-auto">
          <AnimatePresence>
            {filteredReminders.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="text-center py-12"
              >
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <BellIcon className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No upcoming doses</h3>
                <p className="text-gray-500 text-sm">
                  {viewMode === 'today' 
                    ? "You're all caught up for today! 🎉"
                    : `No doses scheduled for ${viewMode === 'tomorrow' ? 'tomorrow' : 'this week'}.`
                  }
                </p>
              </motion.div>
            ) : (
              filteredReminders.map((reminder, index) => {
                const urgencyLevel = getUrgencyLevel(reminder.scheduledTime);
                const MedicineIcon = getMedicineIcon(reminder.medicine.type);
                const timeUntil = getTimeUntil(reminder.scheduledTime);
                
                return (
                  <motion.div
                    key={reminder.id}
                    initial={{ opacity: 0, x: -20, scale: 0.95 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    exit={{ opacity: 0, x: 20, scale: 0.95 }}
                    transition={{ 
                      delay: index * 0.05,
                      type: "spring",
                      stiffness: 300,
                      damping: 25
                    }}
                    whileHover={{ scale: 1.02, y: -2 }}
                    className={`relative p-4 rounded-lg transition-all duration-200 cursor-pointer group ${getUrgencyStyle(urgencyLevel)}`}
                  >
                    {/* Medicine Info */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div 
                          className="p-2 rounded-lg shadow-sm"
                          style={{ backgroundColor: `${reminder.medicine.color}20` }}
                        >
                          <MedicineIcon 
                            className="h-5 w-5" 
                            style={{ color: reminder.medicine.color }}
                          />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900 group-hover:text-pill-700 transition-colors">
                            {reminder.medicine.name}
                          </h3>
                          <div className="flex items-center space-x-2 text-sm text-gray-600">
                            <span>{reminder.medicine.dosage}</span>
                            <span>•</span>
                            <span className="capitalize">{reminder.medicine.type}</span>
                          </div>
                        </div>
                      </div>

                      {/* Time and Priority */}
                      <div className="text-right">
                        <div className="text-sm font-medium text-gray-900">
                          {format(new Date(reminder.scheduledTime), 'HH:mm')}
                        </div>
                        <div className={`text-xs px-2 py-1 rounded-full border inline-block mt-1 ${getPriorityColor(reminder.priority)}`}>
                          {reminder.priority}
                        </div>
                      </div>
                    </div>

                    {/* Instructions */}
                    {reminder.instructions && (
                      <div className="flex items-start space-x-2 mb-3">
                        <InformationCircleIcon className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                        <p className="text-xs text-gray-600 leading-relaxed">
                          {reminder.instructions}
                        </p>
                      </div>
                    )}

                    {/* Footer */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          reminder.category === 'Diabetes' ? 'bg-red-100 text-red-700' :
                          reminder.category === 'Blood Pressure' ? 'bg-orange-100 text-orange-700' :
                          reminder.category === 'Vitamin' ? 'bg-blue-100 text-blue-700' :
                          reminder.category === 'Supplement' ? 'bg-green-100 text-green-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {reminder.category}
                        </span>
                        
                        {!reminder.reminderEnabled && (
                          <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full">
                            No alert
                          </span>
                        )}
                      </div>

                      <div className="flex items-center space-x-2">
                        {urgencyLevel === 'urgent' && (
                          <button
                            onClick={() => handleQuickSnooze(reminder.id)}
                            className="px-2 py-1 text-xs bg-orange-100 hover:bg-orange-200 text-orange-700 rounded transition-colors"
                          >
                            Snooze 15m
                          </button>
                        )}
                        
                        <div className={`text-xs font-medium ${
                          urgencyLevel === 'overdue' ? 'text-red-600' :
                          urgencyLevel === 'urgent' ? 'text-orange-600' :
                          urgencyLevel === 'soon' ? 'text-yellow-600' :
                          'text-gray-500'
                        }`}>
                          {timeUntil === 'Overdue' ? (
                            <span className="flex items-center">
                              <ExclamationTriangleIcon className="h-3 w-3 mr-1" />
                              Overdue
                            </span>
                          ) : (
                            `in ${timeUntil}`
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Hover Actions */}
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <ChevronRightIcon className="h-4 w-4 text-gray-400" />
                    </div>
                  </motion.div>
                );
              })
            )}
          </AnimatePresence>
        </div>

        {/* Quick Stats Footer */}
        {filteredReminders.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-6 pt-4 border-t border-gray-200"
          >
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="space-y-1">
                <div className="text-sm font-semibold text-gray-900">
                  {filteredReminders.filter(r => getUrgencyLevel(r.scheduledTime) === 'urgent').length}
                </div>
                <div className="text-xs text-orange-600 font-medium">Urgent</div>
              </div>
              <div className="space-y-1">
                <div className="text-sm font-semibold text-gray-900">
                  {filteredReminders.filter(r => r.priority === 'high').length}
                </div>
                <div className="text-xs text-red-600 font-medium">High Priority</div>
              </div>
              <div className="space-y-1">
                <div className="text-sm font-semibold text-gray-900">
                  {filteredReminders.filter(r => r.reminderEnabled).length}
                </div>
                <div className="text-xs text-blue-600 font-medium">With Alerts</div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Next Dose Highlight */}
        {filteredReminders.length > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
            className="mt-4 p-3 bg-gradient-to-r from-pill-50 to-blue-50 rounded-lg border border-pill-200"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <HeartIcon className="h-4 w-4 text-pill-600" />
                <span className="text-sm font-medium text-pill-800">
                  Next: {filteredReminders[0]?.medicine.name}
                </span>
              </div>
              <span className="text-sm text-pill-600 font-medium">
                in {getTimeUntil(filteredReminders[0]?.scheduledTime)}
              </span>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default UpcomingDoses;
