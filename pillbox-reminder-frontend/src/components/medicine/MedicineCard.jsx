import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  PencilIcon,
  TrashIcon,
  ClockIcon,
  CalendarIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  BellIcon,
  CameraIcon,
  HeartIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';
import { format, isAfter, isBefore, addDays, differenceInDays } from 'date-fns';
import ConfirmDialog from '../common/ConfirmDialog';

const MedicineCard = ({ medicine, onDelete, onToggleActive }) => {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const isExpired = isAfter(new Date(), new Date(medicine.endDate));
  const isExpiringSoon = !isExpired && isBefore(new Date(), addDays(new Date(medicine.endDate), 7));
  const daysUntilExpiry = differenceInDays(new Date(medicine.endDate), new Date());
  const isLowStock = medicine.stockQuantity && medicine.stockQuantity < 7;

  const getTypeIcon = (type) => {
    const icons = {
      tablet: '💊',
      capsule: '💊', 
      liquid: '🧴',
      injection: '💉',
      inhaler: '🫁',
      drops: '💧',
      cream: '🧴',
      patch: '🩹'
    };
    return icons[type] || '💊';
  };

  const getTypeColor = (type) => {
    const colors = {
      tablet: 'bg-blue-100 text-blue-800 border-blue-200',
      capsule: 'bg-purple-100 text-purple-800 border-purple-200',
      liquid: 'bg-green-100 text-green-800 border-green-200',
      injection: 'bg-red-100 text-red-800 border-red-200',
      inhaler: 'bg-indigo-100 text-indigo-800 border-indigo-200',
      drops: 'bg-cyan-100 text-cyan-800 border-cyan-200',
      cream: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      patch: 'bg-pink-100 text-pink-800 border-pink-200'
    };
    return colors[type] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getPriorityBadge = () => {
    if (isExpired) {
      return { text: 'Expired', color: 'bg-red-100 text-red-800 border-red-200', urgent: true };
    }
    if (isExpiringSoon) {
      return { text: `${daysUntilExpiry}d left`, color: 'bg-yellow-100 text-yellow-800 border-yellow-200', urgent: true };
    }
    if (isLowStock) {
      return { text: 'Low Stock', color: 'bg-orange-100 text-orange-800 border-orange-200', urgent: true };
    }
    if (medicine.active) {
      return { text: 'Active', color: 'bg-green-100 text-green-800 border-green-200', urgent: false };
    }
    return { text: 'Inactive', color: 'bg-gray-100 text-gray-800 border-gray-200', urgent: false };
  };

  const statusBadge = getPriorityBadge();

  const handleDelete = () => {
    setShowDeleteConfirm(true);
  };

  const confirmDelete = () => {
    onDelete(medicine.id);
    setShowDeleteConfirm(false);
  };

  const getNextDoseTime = () => {
    if (!medicine.reminderTimes || medicine.reminderTimes.length === 0) return null;
    
    const now = new Date();
    const today = format(now, 'yyyy-MM-dd');
    
    // Find next upcoming reminder time today
    const upcomingToday = medicine.reminderTimes
      .map(time => new Date(`${today}T${time}`))
      .filter(dateTime => dateTime > now)
      .sort((a, b) => a - b);
    
    if (upcomingToday.length > 0) {
      return upcomingToday[0];
    }
    
    // If no more reminders today, show first reminder tomorrow
    const tomorrow = format(addDays(now, 1), 'yyyy-MM-dd');
    return new Date(`${tomorrow}T${medicine.reminderTimes[0]}`);
  };

  const nextDose = getNextDoseTime();

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -4, scale: 1.02 }}
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
        className="relative bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group"
      >
        {/* Status Indicator */}
        <div 
          className="absolute top-0 left-0 right-0 h-1"
          style={{ backgroundColor: medicine.color || '#0ea5e9' }}
        />

        {/* PatternCraft Background */}
        <div className="absolute inset-0 opacity-20" style={{
          backgroundImage: `
            radial-gradient(circle at 20% 20%, ${medicine.color || '#0ea5e9'}20 0%, transparent 50%),
            linear-gradient(135deg, transparent 40%, ${medicine.color || '#0ea5e9'}10 50%, transparent 60%)
          `
        }} />

        <div className="relative p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2 mb-2">
                <span className="text-2xl">{getTypeIcon(medicine.type)}</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getTypeColor(medicine.type)}`}>
                  {medicine.type}
                </span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium border ${statusBadge.color}`}>
                  {statusBadge.text}
                </span>
                {statusBadge.urgent && (
                  <ExclamationTriangleIcon className="h-4 w-4 text-red-500" />
                )}
              </div>
              
              <div className="flex items-center space-x-2">
                <h3 className="text-lg font-semibold text-gray-900 truncate">{medicine.name}</h3>
                {medicine.photo && (
                  <CameraIcon className="h-4 w-4 text-gray-400" />
                )}
              </div>
              
              <p className="text-gray-600 text-sm font-medium">{medicine.dosage}</p>
              
              {medicine.prescribedBy && (
                <p className="text-gray-500 text-xs mt-1">by Dr. {medicine.prescribedBy}</p>
              )}
            </div>

            {/* Medicine Photo */}
            {medicine.photo && (
              <div className="ml-4 flex-shrink-0">
                <img
                  src={medicine.photo}
                  alt={medicine.name}
                  className="w-12 h-12 rounded-lg object-cover border border-gray-200"
                />
              </div>
            )}
          </div>

          {/* Details Grid */}
          <div className="space-y-3 mb-6">
            <div className="flex items-center text-sm text-gray-600">
              <ClockIcon className="h-4 w-4 mr-2 flex-shrink-0" />
              <span className="font-medium">{medicine.frequency?.replace('-', ' ')}</span>
              {medicine.reminderTimes && (
                <span className="ml-2 text-gray-500">
                  ({medicine.reminderTimes.length} reminder{medicine.reminderTimes.length !== 1 ? 's' : ''})
                </span>
              )}
            </div>
            
            <div className="flex items-center text-sm text-gray-600">
              <CalendarIcon className="h-4 w-4 mr-2 flex-shrink-0" />
              <span>Until {format(new Date(medicine.endDate), 'MMM dd, yyyy')}</span>
              {!isExpired && (
                <span className="ml-2 text-gray-500">
                  ({daysUntilExpiry} days left)
                </span>
              )}
            </div>

            {/* Stock Information */}
            {medicine.stockQuantity !== undefined && (
              <div className="flex items-center text-sm text-gray-600">
                <HeartIcon className="h-4 w-4 mr-2 flex-shrink-0" />
                <span>Stock: {medicine.stockQuantity} doses</span>
                {isLowStock && (
                  <span className="ml-2 text-orange-600 font-medium">Low!</span>
                )}
              </div>
            )}

            {/* Next Dose */}
            {nextDose && !isExpired && (
              <div className="flex items-center text-sm text-gray-600">
                <BellIcon className="h-4 w-4 mr-2 flex-shrink-0" />
                <span>Next: {format(nextDose, 'MMM dd, HH:mm')}</span>
              </div>
            )}
          </div>

          {/* Instructions */}
          {medicine.instructions && (
            <div className="mb-4 p-3 bg-gray-50 rounded-lg">
              <div className="flex items-start space-x-2">
                <InformationCircleIcon className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-gray-600 leading-relaxed">{medicine.instructions}</p>
              </div>
            </div>
          )}

          {/* Reminder Times */}
          {medicine.reminderTimes && medicine.reminderTimes.length > 0 && (
            <div className="mb-4">
              <p className="text-xs font-medium text-gray-700 mb-2">Reminder times:</p>
              <div className="flex flex-wrap gap-1">
                {medicine.reminderTimes.slice(0, 4).map((time, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-pill-100 text-pill-700 text-xs rounded-full"
                  >
                    {time}
                  </span>
                ))}
                {medicine.reminderTimes.length > 4 && (
                  <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                    +{medicine.reminderTimes.length - 4} more
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-100">
            <div className="flex items-center space-x-2">
              <Link
                to={`/medicines/edit/${medicine.id}`}
                className="p-2 text-gray-400 hover:text-pill-600 hover:bg-pill-50 rounded-lg transition-colors duration-200"
              >
                <PencilIcon className="h-4 w-4" />
              </Link>
              <button
                onClick={handleDelete}
                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
              >
                <TrashIcon className="h-4 w-4" />
              </button>
            </div>

            <div className="flex items-center space-x-2">
              {/* Active Toggle */}
              <button
                onClick={() => onToggleActive?.(medicine.id)}
                className={`p-2 rounded-lg transition-colors duration-200 ${
                  medicine.active
                    ? 'text-green-600 hover:bg-green-50'
                    : 'text-gray-400 hover:bg-gray-50'
                }`}
              >
                <CheckCircleIcon className="h-4 w-4" />
              </button>

              {/* View Details Button */}
              <Link
                to={`/medicines/${medicine.id}`}
                className={`text-xs px-3 py-1 rounded-full font-medium transition-all duration-200 ${
                  isHovered
                    ? 'bg-pill-600 text-white scale-105'
                    : 'bg-pill-100 text-pill-700 hover:bg-pill-200'
                }`}
              >
                View Details
              </Link>
            </div>
          </div>

          {/* Urgent Warnings */}
          {(isExpired || isExpiringSoon || isLowStock) && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mt-4 p-3 border-l-4 border-red-500 bg-red-50 rounded-r-lg"
            >
              <div className="flex items-center">
                <ExclamationTriangleIcon className="h-5 w-5 text-red-500 mr-2 flex-shrink-0" />
                <div className="text-sm">
                  {isExpired && (
                    <p className="text-red-700 font-medium">
                      This medicine has expired. Please consult your doctor.
                    </p>
                  )}
                  {isExpiringSoon && !isExpired && (
                    <p className="text-red-700 font-medium">
                      This medicine expires in {daysUntilExpiry} day{daysUntilExpiry !== 1 ? 's' : ''}. Consider refilling.
                    </p>
                  )}
                  {isLowStock && (
                    <p className="text-orange-700 font-medium">
                      Low stock remaining ({medicine.stockQuantity} doses). Consider refilling.
                    </p>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Hover Effect Overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: isHovered ? 1 : 0 }}
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent pointer-events-none"
        />
      </motion.div>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={confirmDelete}
        title="Delete Medicine"
        message={`Are you sure you want to delete "${medicine.name}"? This action cannot be undone and will also remove all associated reminders.`}
        confirmText="Delete"
        confirmButtonClass="bg-red-600 hover:bg-red-700"
      />
    </>
  );
};

export default MedicineCard;
