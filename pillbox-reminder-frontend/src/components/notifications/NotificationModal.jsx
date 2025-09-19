import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  XMarkIcon,
  BellIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  InformationCircleIcon,
  ExclamationTriangleIcon,
  PlayIcon
} from '@heroicons/react/24/outline';
import { format } from 'date-fns';
import TakeConfirmation from './TakeConfirmation';
import SkipConfirmation from './SkipConfirmation';

const NotificationModal = ({ 
  isOpen, 
  onClose, 
  notification, 
  onTake, 
  onSkip, 
  onSnooze 
}) => {
  const [showTakeConfirm, setShowTakeConfirm] = useState(false);
  const [showSkipConfirm, setShowSkipConfirm] = useState(false);
  const [timeLeft, setTimeLeft] = useState('');
  const [isOverdue, setIsOverdue] = useState(false);

  useEffect(() => {
    if (!notification) return;

    const updateTimeLeft = () => {
      const now = new Date();
      const scheduledTime = new Date(notification.scheduledTime);
      const diffMs = scheduledTime - now;

      if (diffMs <= 0) {
        setIsOverdue(true);
        const overdueMs = Math.abs(diffMs);
        const overdueMinutes = Math.floor(overdueMs / (1000 * 60));
        if (overdueMinutes < 60) {
          setTimeLeft(`${overdueMinutes}m overdue`);
        } else {
          const overdueHours = Math.floor(overdueMinutes / 60);
          const remainingMinutes = overdueMinutes % 60;
          setTimeLeft(`${overdueHours}h ${remainingMinutes}m overdue`);
        }
      } else {
        setIsOverdue(false);
        const minutes = Math.floor(diffMs / (1000 * 60));
        if (minutes < 60) {
          setTimeLeft(`in ${minutes}m`);
        } else {
          const hours = Math.floor(minutes / 60);
          const remainingMinutes = minutes % 60;
          setTimeLeft(`in ${hours}h ${remainingMinutes}m`);
        }
      }
    };

    updateTimeLeft();
    const interval = setInterval(updateTimeLeft, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [notification]);

  const handleTake = () => {
    setShowTakeConfirm(true);
  };

  const handleSkip = () => {
    setShowSkipConfirm(true);
  };

  const handleSnooze = (minutes = 15) => {
    onSnooze?.(notification.id, minutes);
    onClose();
  };

  const confirmTake = (notes) => {
    onTake?.(notification.id, notes);
    setShowTakeConfirm(false);
    onClose();
  };

  const confirmSkip = (reason, notes) => {
    onSkip?.(notification.id, reason, notes);
    setShowSkipConfirm(false);
    onClose();
  };

  if (!notification) return null;

  const medicine = notification.medicine || {};

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
          />

          {/* Modal */}
          <div className="flex items-center justify-center min-h-full p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden"
            >
              {/* PatternCraft Background */}
              <div className="absolute inset-0 opacity-30" style={{
                backgroundImage: `
                  radial-gradient(circle at 20% 20%, ${medicine.color || '#0ea5e9'}20 0%, transparent 50%),
                  radial-gradient(circle at 80% 80%, ${medicine.color || '#0ea5e9'}10 0%, transparent 50%),
                  linear-gradient(135deg, transparent 40%, ${medicine.color || '#0ea5e9'}05 50%, transparent 60%)
                `
              }} />

              <div className="relative">
                {/* Header */}
                <div className={`px-6 py-4 ${isOverdue ? 'bg-red-500' : 'bg-gradient-to-r from-pill-500 to-blue-600'} text-white`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-white/20 rounded-lg">
                        {isOverdue ? (
                          <ExclamationTriangleIcon className="h-6 w-6" />
                        ) : (
                          <BellIcon className="h-6 w-6" />
                        )}
                      </div>
                      <div>
                        <h2 className="text-lg font-semibold">
                          {isOverdue ? 'Overdue Medicine' : 'Medicine Reminder'}
                        </h2>
                        <p className="text-white/90 text-sm">
                          {format(new Date(notification.scheduledTime), 'HH:mm')} • {timeLeft}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={onClose}
                      className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                    >
                      <XMarkIcon className="h-5 w-5" />
                    </button>
                  </div>
                </div>

                {/* Medicine Information */}
                <div className="p-6 space-y-6">
                  <div className="flex items-center space-x-4">
                    {/* Medicine Icon/Photo */}
                    <div className="flex-shrink-0">
                      {medicine.photo ? (
                        <img
                          src={medicine.photo}
                          alt={medicine.name}
                          className="w-16 h-16 rounded-lg object-cover border border-gray-200"
                        />
                      ) : (
                        <div 
                          className="w-16 h-16 rounded-lg flex items-center justify-center text-2xl"
                          style={{ backgroundColor: `${medicine.color || '#0ea5e9'}20` }}
                        >
                          {medicine.type === 'tablet' ? '💊' : 
                           medicine.type === 'liquid' ? '🧴' : 
                           medicine.type === 'injection' ? '💉' : 
                           medicine.type === 'inhaler' ? '🫁' :
                           medicine.type === 'drops' ? '💧' : '💊'}
                        </div>
                      )}
                    </div>

                    {/* Medicine Details */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-xl font-semibold text-gray-900 truncate">
                        {medicine.name || 'Unknown Medicine'}
                      </h3>
                      <p className="text-gray-600 font-medium">{medicine.dosage}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          medicine.type === 'tablet' ? 'bg-blue-100 text-blue-800' :
                          medicine.type === 'liquid' ? 'bg-green-100 text-green-800' :
                          medicine.type === 'injection' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {medicine.type || 'tablet'}
                        </span>
                        {notification.priority === 'high' && (
                          <span className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded-full font-medium">
                            High Priority
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Instructions */}
                  {notification.instructions && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="flex items-start space-x-2">
                        <InformationCircleIcon className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <h4 className="text-blue-900 font-medium text-sm mb-1">Instructions</h4>
                          <p className="text-blue-800 text-sm">{notification.instructions}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Overdue Warning */}
                  {isOverdue && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <div className="flex items-start space-x-2">
                        <ExclamationTriangleIcon className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <h4 className="text-red-900 font-medium text-sm mb-1">Overdue Reminder</h4>
                          <p className="text-red-800 text-sm">
                            This dose was scheduled for {format(new Date(notification.scheduledTime), 'HH:mm')}. 
                            Please take it as soon as possible or consult your doctor.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="space-y-3">
                    {/* Primary Actions */}
                    <div className="grid grid-cols-2 gap-3">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleTake}
                        className="flex items-center justify-center px-4 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition-colors shadow-md"
                      >
                        <CheckCircleIcon className="h-5 w-5 mr-2" />
                        Take Now
                      </motion.button>
                      
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleSkip}
                        className="flex items-center justify-center px-4 py-3 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors shadow-md"
                      >
                        <XCircleIcon className="h-5 w-5 mr-2" />
                        Skip
                      </motion.button>
                    </div>

                    {/* Secondary Actions */}
                    {!isOverdue && (
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleSnooze(5)}
                          className="flex-1 flex items-center justify-center px-3 py-2 bg-orange-100 hover:bg-orange-200 text-orange-800 rounded-lg text-sm font-medium transition-colors"
                        >
                          <ClockIcon className="h-4 w-4 mr-1" />
                          5m
                        </button>
                        <button
                          onClick={() => handleSnooze(15)}
                          className="flex-1 flex items-center justify-center px-3 py-2 bg-orange-100 hover:bg-orange-200 text-orange-800 rounded-lg text-sm font-medium transition-colors"
                        >
                          <ClockIcon className="h-4 w-4 mr-1" />
                          15m
                        </button>
                        <button
                          onClick={() => handleSnooze(30)}
                          className="flex-1 flex items-center justify-center px-3 py-2 bg-orange-100 hover:bg-orange-200 text-orange-800 rounded-lg text-sm font-medium transition-colors"
                        >
                          <ClockIcon className="h-4 w-4 mr-1" />
                          30m
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Quick Actions */}
                  <div className="pt-4 border-t border-gray-200">
                    <p className="text-xs text-gray-500 text-center mb-3">
                      Need help? Contact your healthcare provider if you have questions about your medication.
                    </p>
                  </div>
                </div>
              </div>

              {/* Take Confirmation Modal */}
              <TakeConfirmation
                isOpen={showTakeConfirm}
                onClose={() => setShowTakeConfirm(false)}
                onConfirm={confirmTake}
                medicine={medicine}
              />

              {/* Skip Confirmation Modal */}
              <SkipConfirmation
                isOpen={showSkipConfirm}
                onClose={() => setShowSkipConfirm(false)}
                onConfirm={confirmSkip}
                medicine={medicine}
              />
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default NotificationModal;
