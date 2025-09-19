import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  BellIcon,
  CalendarIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { format, isAfter, isBefore, addMinutes } from 'date-fns';
import { useReminders } from '../hooks/useReminders';
import toast from 'react-hot-toast';

const TodayReminders = () => {
  const { todayReminders, markAsTaken, markAsSkipped } = useReminders();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [filter, setFilter] = useState('all'); // all, pending, completed, missed

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Update every minute
    
    return () => clearInterval(timer);
  }, []);

  const getFilteredReminders = () => {
    if (!todayReminders) return [];
    
    const now = new Date();
    
    return todayReminders.filter(reminder => {
      const reminderTime = new Date(reminder.scheduledTime);
      
      switch (filter) {
        case 'pending':
          return !reminder.taken && !reminder.skipped && isAfter(reminderTime, now);
        case 'completed':
          return reminder.taken;
        case 'missed':
          return !reminder.taken && !reminder.skipped && isBefore(reminderTime, addMinutes(now, -30));
        default:
          return true;
      }
    }).sort((a, b) => new Date(a.scheduledTime) - new Date(b.scheduledTime));
  };

  const handleTaken = async (reminderId) => {
    try {
      await markAsTaken(reminderId);
      toast.success('Dose marked as taken!');
    } catch (error) {
      toast.error('Failed to mark dose as taken');
    }
  };

  const handleSkipped = async (reminderId, reason = 'Not specified') => {
    try {
      await markAsSkipped(reminderId, reason);
      toast.success('Dose marked as skipped');
    } catch (error) {
      toast.error('Failed to mark dose as skipped');
    }
  };

  const getReminderStatus = (reminder) => {
    const now = new Date();
    const reminderTime = new Date(reminder.scheduledTime);
    
    if (reminder.taken) return 'taken';
    if (reminder.skipped) return 'skipped';
    if (isBefore(reminderTime, addMinutes(now, -30))) return 'missed';
    if (isBefore(reminderTime, now)) return 'due';
    return 'upcoming';
  };

  const getStatusColor = (status) => {
    const colors = {
      taken: 'bg-green-100 text-green-800 border-green-200',
      skipped: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      missed: 'bg-red-100 text-red-800 border-red-200',
      due: 'bg-orange-100 text-orange-800 border-orange-200',
      upcoming: 'bg-blue-100 text-blue-800 border-blue-200'
    };
    return colors[status] || colors.upcoming;
  };

  const getStatusIcon = (status) => {
    const icons = {
      taken: CheckCircleIcon,
      skipped: XCircleIcon,
      missed: ExclamationTriangleIcon,
      due: BellIcon,
      upcoming: ClockIcon
    };
    return icons[status] || ClockIcon;
  };

  const filteredReminders = getFilteredReminders();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="relative bg-white rounded-xl shadow-lg p-6 overflow-hidden"
    >
      {/* PatternCraft Background */}
      <div className="absolute inset-0 opacity-20" style={{
        backgroundImage: `
          linear-gradient(90deg, transparent 50%, rgba(59, 130, 246, 0.05) 50%),
          linear-gradient(0deg, transparent 50%, rgba(59, 130, 246, 0.05) 50%)
        `,
        backgroundSize: '20px 20px'
      }} />
      
      <div className="relative">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <CalendarIcon className="h-6 w-6 text-pill-600" />
            <h2 className="text-xl font-semibold text-gray-900">Today's Reminders</h2>
          </div>
          <div className="text-sm text-gray-500">
            {format(currentTime, 'MMM dd, yyyy')}
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex space-x-1 mb-6 bg-gray-100 rounded-lg p-1">
          {[
            { key: 'all', label: 'All' },
            { key: 'pending', label: 'Pending' },
            { key: 'completed', label: 'Completed' },
            { key: 'missed', label: 'Missed' }
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors duration-200 ${
                filter === tab.key
                  ? 'bg-white text-pill-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Reminders List */}
        <div className="space-y-4 max-h-96 overflow-y-auto">
          <AnimatePresence>
            {filteredReminders.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-center py-8"
              >
                <ClockIcon className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No reminders found</p>
              </motion.div>
            ) : (
              filteredReminders.map((reminder, index) => {
                const status = getReminderStatus(reminder);
                const StatusIcon = getStatusIcon(status);
                
                return (
                  <motion.div
                    key={reminder.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ delay: index * 0.1 }}
                    className="relative bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors duration-200"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-lg border ${getStatusColor(status)}`}>
                          <StatusIcon className="h-5 w-5" />
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900">
                            {reminder.medicine?.name || 'Unknown Medicine'}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {reminder.medicine?.dosage} • {format(new Date(reminder.scheduledTime), 'HH:mm')}
                          </p>
                          {reminder.instructions && (
                            <p className="text-xs text-gray-500 mt-1">
                              {reminder.instructions}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Action Buttons */}
                      {status === 'due' || status === 'upcoming' ? (
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleTaken(reminder.id)}
                            className="px-3 py-1 bg-green-500 text-white text-xs rounded-md hover:bg-green-600 transition-colors duration-200"
                          >
                            Take
                          </button>
                          <button
                            onClick={() => handleSkipped(reminder.id)}
                            className="px-3 py-1 bg-gray-500 text-white text-xs rounded-md hover:bg-gray-600 transition-colors duration-200"
                          >
                            Skip
                          </button>
                        </div>
                      ) : (
                        <span className={`px-2 py-1 text-xs rounded-full border ${getStatusColor(status)}`}>
                          {status.charAt(0).toUpperCase() + status.slice(1)}
                        </span>
                      )}
                    </div>

                    {/* Time until reminder */}
                    {status === 'upcoming' && (
                      <div className="mt-2 text-xs text-gray-500">
                        In {Math.ceil((new Date(reminder.scheduledTime) - currentTime) / (1000 * 60))} minutes
                      </div>
                    )}

                    {/* Overdue indicator */}
                    {status === 'missed' && (
                      <div className="mt-2 text-xs text-red-600 font-medium">
                        Overdue by {Math.ceil((currentTime - new Date(reminder.scheduledTime)) / (1000 * 60))} minutes
                      </div>
                    )}
                  </motion.div>
                );
              })
            )}
          </AnimatePresence>
        </div>

        {/* Summary Stats */}
        {filteredReminders.length > 0 && filter === 'all' && (
          <div className="mt-6 pt-4 border-t border-gray-200">
            <div className="grid grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-lg font-semibold text-green-600">
                  {todayReminders?.filter(r => r.taken).length || 0}
                </div>
                <div className="text-xs text-gray-500">Taken</div>
              </div>
              <div>
                <div className="text-lg font-semibold text-blue-600">
                  {todayReminders?.filter(r => !r.taken && !r.skipped && isAfter(new Date(r.scheduledTime), currentTime)).length || 0}
                </div>
                <div className="text-xs text-gray-500">Pending</div>
              </div>
              <div>
                <div className="text-lg font-semibold text-yellow-600">
                  {todayReminders?.filter(r => r.skipped).length || 0}
                </div>
                <div className="text-xs text-gray-500">Skipped</div>
              </div>
              <div>
                <div className="text-lg font-semibold text-red-600">
                  {todayReminders?.filter(r => !r.taken && !r.skipped && isBefore(new Date(r.scheduledTime), addMinutes(currentTime, -30))).length || 0}
                </div>
                <div className="text-xs text-gray-500">Missed</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default TodayReminders;
