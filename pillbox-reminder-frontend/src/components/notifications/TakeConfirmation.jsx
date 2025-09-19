import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircleIcon,
  XMarkIcon,
  ClockIcon,
  InformationCircleIcon,
  CameraIcon,
  HeartIcon
} from '@heroicons/react/24/outline';
import { format } from 'date-fns';

const TakeConfirmation = ({ isOpen, onClose, onConfirm, medicine }) => {
  const [notes, setNotes] = useState('');
  const [takenTime, setTakenTime] = useState(format(new Date(), 'HH:mm'));
  const [sideEffects, setSideEffects] = useState('');
  const [effectiveness, setEffectiveness] = useState('');
  const [photo, setPhoto] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handlePhotoUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setPhoto(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleConfirm = async () => {
    setIsSubmitting(true);
    
    const confirmationData = {
      takenAt: new Date().toISOString(),
      scheduledTime: takenTime,
      notes: notes.trim(),
      sideEffects: sideEffects.trim(),
      effectiveness,
      photo,
      timestamp: new Date().toISOString()
    };

    try {
      await onConfirm(confirmationData);
    } catch (error) {
      console.error('Error confirming dose:', error);
    } finally {
      setIsSubmitting(false);
      handleClose();
    }
  };

  const handleClose = () => {
    setNotes('');
    setTakenTime(format(new Date(), 'HH:mm'));
    setSideEffects('');
    setEffectiveness('');
    setPhoto(null);
    setIsSubmitting(false);
    onClose();
  };

  const effectivenessOptions = [
    { value: '', label: 'Not specified' },
    { value: 'very-effective', label: 'Very Effective' },
    { value: 'effective', label: 'Effective' },
    { value: 'somewhat-effective', label: 'Somewhat Effective' },
    { value: 'not-effective', label: 'Not Effective' }
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[60] overflow-y-auto">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Modal */}
          <div className="flex items-center justify-center min-h-full p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden"
            >
              {/* PatternCraft Background */}
              <div className="absolute inset-0 opacity-20" style={{
                backgroundImage: `
                  radial-gradient(circle at 25% 25%, rgba(16, 185, 129, 0.1) 0%, transparent 50%),
                  radial-gradient(circle at 75% 75%, rgba(5, 150, 105, 0.1) 0%, transparent 50%),
                  linear-gradient(135deg, transparent 40%, rgba(16, 185, 129, 0.05) 50%, transparent 60%)
                `
              }} />

              <div className="relative">
                {/* Header */}
                <div className="px-6 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-white/20 rounded-lg">
                        <CheckCircleIcon className="h-6 w-6" />
                      </div>
                      <div>
                        <h2 className="text-lg font-semibold">Confirm Dose Taken</h2>
                        <p className="text-green-100 text-sm">{medicine.name}</p>
                      </div>
                    </div>
                    <button
                      onClick={handleClose}
                      className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                    >
                      <XMarkIcon className="h-5 w-5" />
                    </button>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                  {/* Medicine Summary */}
                  <div className="flex items-center space-x-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div 
                      className="w-12 h-12 rounded-lg flex items-center justify-center text-xl"
                      style={{ backgroundColor: `${medicine.color || '#10b981'}20` }}
                    >
                      {medicine.type === 'tablet' ? '💊' : 
                       medicine.type === 'liquid' ? '🧴' : 
                       medicine.type === 'injection' ? '💉' : '💊'}
                    </div>
                    <div>
                      <h3 className="font-semibold text-green-900">{medicine.name}</h3>
                      <p className="text-green-700 text-sm">{medicine.dosage}</p>
                    </div>
                  </div>

                  {/* Time Taken */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Time Taken
                    </label>
                    <div className="flex items-center space-x-2">
                      <ClockIcon className="h-5 w-5 text-gray-400" />
                      <input
                        type="time"
                        value={takenTime}
                        onChange={(e) => setTakenTime(e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  {/* Effectiveness */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      How effective was the previous dose? (Optional)
                    </label>
                    <select
                      value={effectiveness}
                      onChange={(e) => setEffectiveness(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    >
                      {effectivenessOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Side Effects */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Any side effects? (Optional)
                    </label>
                    <textarea
                      value={sideEffects}
                      onChange={(e) => setSideEffects(e.target.value)}
                      placeholder="Describe any side effects you experienced..."
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                    />
                  </div>

                  {/* Notes */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Notes (Optional)
                    </label>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Any additional notes about taking this dose..."
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                    />
                  </div>

                  {/* Photo Upload */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Photo Proof (Optional)
                    </label>
                    <div className="flex items-center space-x-4">
                      {photo ? (
                        <div className="relative">
                          <img 
                            src={photo} 
                            alt="Dose taken" 
                            className="w-20 h-20 object-cover rounded-lg border border-gray-300"
                          />
                          <button
                            onClick={() => setPhoto(null)}
                            className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                          >
                            <XMarkIcon className="h-3 w-3" />
                          </button>
                        </div>
                      ) : (
                        <label className="flex items-center justify-center w-20 h-20 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-green-500 transition-colors">
                          <CameraIcon className="h-6 w-6 text-gray-400" />
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handlePhotoUpload}
                            className="hidden"
                          />
                        </label>
                      )}
                      <div className="text-sm text-gray-600">
                        <p>Take a photo as proof</p>
                        <p className="text-xs text-gray-500">Helps track adherence</p>
                      </div>
                    </div>
                  </div>

                  {/* Motivational Message */}
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center space-x-2">
                      <HeartIcon className="h-5 w-5 text-green-600" />
                      <p className="text-green-800 text-sm font-medium">
                        Great job staying on track with your medication! 🎉
                      </p>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex space-x-3 pt-4">
                    <button
                      onClick={handleClose}
                      className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                    >
                      Cancel
                    </button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleConfirm}
                      disabled={isSubmitting}
                      className={`flex-1 px-4 py-3 bg-green-500 text-white rounded-lg font-medium transition-colors flex items-center justify-center ${
                        isSubmitting 
                          ? 'opacity-50 cursor-not-allowed' 
                          : 'hover:bg-green-600'
                      }`}
                    >
                      {isSubmitting ? (
                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                      ) : (
                        <>
                          <CheckCircleIcon className="h-5 w-5 mr-2" />
                          Confirm Taken
                        </>
                      )}
                    </motion.button>
                  </div>

                  {/* Tips */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <div className="flex items-start space-x-2">
                      <InformationCircleIcon className="h-4 w-4 text-blue-600 flex-shrink-0 mt-0.5" />
                      <p className="text-blue-800 text-xs">
                        Recording when you take your medicine helps track your adherence and can be useful information for your healthcare provider.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default TakeConfirmation;
