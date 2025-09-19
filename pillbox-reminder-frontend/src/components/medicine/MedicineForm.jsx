import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { motion } from 'framer-motion';
import {
  CalendarIcon,
  ClockIcon,
  InformationCircleIcon,
  ExclamationTriangleIcon,
  CameraIcon,
  TrashIcon
} from '@heroicons/react/24/outline';
import { format, addDays } from 'date-fns';

// Validation schema
const medicineSchema = yup.object().shape({
  name: yup.string()
    .required('Medicine name is required')
    .min(2, 'Medicine name must be at least 2 characters')
    .max(100, 'Medicine name must be less than 100 characters'),
  
  dosage: yup.string()
    .required('Dosage is required')
    .matches(/^[0-9]+(\.[0-9]+)?\s*(mg|g|ml|IU|mcg|units?)$/i, 'Please enter a valid dosage (e.g., 500mg, 1.5ml, 1000IU)'),
  
  type: yup.string()
    .required('Medicine type is required')
    .oneOf(['tablet', 'capsule', 'liquid', 'injection', 'inhaler', 'drops', 'cream', 'patch'], 'Please select a valid medicine type'),
  
  frequency: yup.string()
    .required('Frequency is required')
    .oneOf(['once-daily', 'twice-daily', 'three-times-daily', 'four-times-daily', 'as-needed', 'weekly', 'monthly'], 'Please select a valid frequency'),
  
  startDate: yup.date()
    .required('Start date is required')
    .min(new Date().toDateString(), 'Start date cannot be in the past'),
  
  endDate: yup.date()
    .required('End date is required')
    .min(yup.ref('startDate'), 'End date must be after start date'),
  
  instructions: yup.string()
    .max(500, 'Instructions must be less than 500 characters'),
  
  reminderTimes: yup.array()
    .of(yup.string().matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Please enter valid time format (HH:MM)'))
    .min(1, 'At least one reminder time is required')
    .max(6, 'Maximum 6 reminder times allowed'),
  
  color: yup.string()
    .required('Please select a color'),
  
  prescribedBy: yup.string()
    .max(100, 'Doctor name must be less than 100 characters'),
  
  notes: yup.string()
    .max(1000, 'Notes must be less than 1000 characters'),
  
  stockQuantity: yup.number()
    .min(0, 'Stock quantity cannot be negative')
    .max(1000, 'Stock quantity must be less than 1000'),
  
  refillReminder: yup.boolean(),
  
  takeLowStockReminder: yup.boolean()
});

const MedicineForm = ({ 
  initialData = null, 
  onSubmit, 
  onCancel, 
  isSubmitting = false,
  submitText = 'Save Medicine',
  mode = 'add' // 'add' or 'edit'
}) => {
  const [reminderTimes, setReminderTimes] = useState(['09:00']);
  const [medicinePhoto, setMedicinePhoto] = useState(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isValid },
    reset
  } = useForm({
    resolver: yupResolver(medicineSchema),
    mode: 'onChange',
    defaultValues: {
      name: '',
      dosage: '',
      type: 'tablet',
      frequency: 'once-daily',
      startDate: format(new Date(), 'yyyy-MM-dd'),
      endDate: format(addDays(new Date(), 30), 'yyyy-MM-dd'),
      instructions: '',
      reminderTimes: ['09:00'],
      color: '#0ea5e9',
      prescribedBy: '',
      notes: '',
      stockQuantity: 0,
      refillReminder: true,
      takeLowStockReminder: true,
      ...initialData
    }
  });

  const watchedFrequency = watch('frequency');
  const watchedType = watch('type');

  useEffect(() => {
    if (initialData) {
      reset(initialData);
      setReminderTimes(initialData.reminderTimes || ['09:00']);
    }
  }, [initialData, reset]);

  useEffect(() => {
    // Auto-adjust reminder times based on frequency
    const getDefaultTimes = (frequency) => {
      switch (frequency) {
        case 'once-daily':
          return ['09:00'];
        case 'twice-daily':
          return ['09:00', '21:00'];
        case 'three-times-daily':
          return ['08:00', '14:00', '20:00'];
        case 'four-times-daily':
          return ['08:00', '12:00', '16:00', '20:00'];
        case 'weekly':
          return ['09:00'];
        case 'monthly':
          return ['09:00'];
        default:
          return ['09:00'];
      }
    };

    const defaultTimes = getDefaultTimes(watchedFrequency);
    setReminderTimes(defaultTimes);
    setValue('reminderTimes', defaultTimes);
  }, [watchedFrequency, setValue]);

  const medicineTypes = [
    { value: 'tablet', label: 'Tablet', icon: '💊' },
    { value: 'capsule', label: 'Capsule', icon: '💊' },
    { value: 'liquid', label: 'Liquid', icon: '🧴' },
    { value: 'injection', label: 'Injection', icon: '💉' },
    { value: 'inhaler', label: 'Inhaler', icon: '🫁' },
    { value: 'drops', label: 'Drops', icon: '💧' },
    { value: 'cream', label: 'Cream/Ointment', icon: '🧴' },
    { value: 'patch', label: 'Patch', icon: '🩹' }
  ];

  const frequencies = [
    { value: 'once-daily', label: 'Once Daily' },
    { value: 'twice-daily', label: 'Twice Daily' },
    { value: 'three-times-daily', label: 'Three Times Daily' },
    { value: 'four-times-daily', label: 'Four Times Daily' },
    { value: 'as-needed', label: 'As Needed' },
    { value: 'weekly', label: 'Weekly' },
    { value: 'monthly', label: 'Monthly' }
  ];

  const colors = [
    '#0ea5e9', '#8b5cf6', '#10b981', '#f59e0b', 
    '#ef4444', '#ec4899', '#84cc16', '#06b6d4'
  ];

  const addReminderTime = () => {
    if (reminderTimes.length < 6) {
      const newTimes = [...reminderTimes, '12:00'];
      setReminderTimes(newTimes);
      setValue('reminderTimes', newTimes);
    }
  };

  const removeReminderTime = (index) => {
    if (reminderTimes.length > 1) {
      const newTimes = reminderTimes.filter((_, i) => i !== index);
      setReminderTimes(newTimes);
      setValue('reminderTimes', newTimes);
    }
  };

  const updateReminderTime = (index, time) => {
    const newTimes = reminderTimes.map((t, i) => i === index ? time : t);
    setReminderTimes(newTimes);
    setValue('reminderTimes', newTimes);
  };

  const handlePhotoUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setMedicinePhoto(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const onFormSubmit = (data) => {
    const formData = {
      ...data,
      reminderTimes,
      photo: medicinePhoto,
      createdAt: initialData?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-8">
      {/* Basic Information */}
      <div className="space-y-6">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <InformationCircleIcon className="h-5 w-5 mr-2 text-pill-600" />
          Basic Information
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Medicine Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Medicine Name *
            </label>
            <input
              type="text"
              {...register('name')}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-pill-500 focus:border-transparent transition-colors ${
                errors.name ? 'border-red-300 bg-red-50' : 'border-gray-300'
              }`}
              placeholder="e.g., Aspirin, Vitamin D3"
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <ExclamationTriangleIcon className="h-4 w-4 mr-1" />
                {errors.name.message}
              </p>
            )}
          </div>

          {/* Dosage */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Dosage *
            </label>
            <input
              type="text"
              {...register('dosage')}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-pill-500 focus:border-transparent transition-colors ${
                errors.dosage ? 'border-red-300 bg-red-50' : 'border-gray-300'
              }`}
              placeholder="e.g., 500mg, 1.5ml, 1000IU"
            />
            {errors.dosage && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <ExclamationTriangleIcon className="h-4 w-4 mr-1" />
                {errors.dosage.message}
              </p>
            )}
          </div>

          {/* Medicine Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Medicine Type *
            </label>
            <div className="grid grid-cols-2 gap-2">
              {medicineTypes.map((type) => (
                <label
                  key={type.value}
                  className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors hover:bg-gray-50 ${
                    watchedType === type.value 
                      ? 'border-pill-500 bg-pill-50 text-pill-700' 
                      : 'border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    {...register('type')}
                    value={type.value}
                    className="sr-only"
                  />
                  <span className="text-lg mr-2">{type.icon}</span>
                  <span className="text-sm font-medium">{type.label}</span>
                </label>
              ))}
            </div>
            {errors.type && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <ExclamationTriangleIcon className="h-4 w-4 mr-1" />
                {errors.type.message}
              </p>
            )}
          </div>

          {/* Color Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Color Theme *
            </label>
            <div className="flex space-x-2">
              {colors.map((color) => (
                <label key={color} className="cursor-pointer">
                  <input
                    type="radio"
                    {...register('color')}
                    value={color}
                    className="sr-only"
                  />
                  <div
                    className={`w-8 h-8 rounded-full border-2 transition-all ${
                      watch('color') === color 
                        ? 'border-gray-400 scale-110' 
                        : 'border-gray-200'
                    }`}
                    style={{ backgroundColor: color }}
                  />
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Photo Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Medicine Photo (Optional)
          </label>
          <div className="flex items-center space-x-4">
            {medicinePhoto ? (
              <div className="relative">
                <img 
                  src={medicinePhoto} 
                  alt="Medicine" 
                  className="w-20 h-20 object-cover rounded-lg border border-gray-300"
                />
                <button
                  type="button"
                  onClick={() => setMedicinePhoto(null)}
                  className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                >
                  <TrashIcon className="h-3 w-3" />
                </button>
              </div>
            ) : (
              <label className="flex items-center justify-center w-20 h-20 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-pill-500 transition-colors">
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
              <p>Upload a photo of your medicine</p>
              <p className="text-xs text-gray-500">Helps with identification</p>
            </div>
          </div>
        </div>
      </div>

      {/* Schedule Information */}
      <div className="space-y-6 pt-6 border-t border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <ClockIcon className="h-5 w-5 mr-2 text-pill-600" />
          Schedule Information
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Frequency */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Frequency *
            </label>
            <select
              {...register('frequency')}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pill-500 focus:border-transparent"
            >
              {frequencies.map((freq) => (
                <option key={freq.value} value={freq.value}>
                  {freq.label}
                </option>
              ))}
            </select>
          </div>

          {/* Start Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Start Date *
            </label>
            <input
              type="date"
              {...register('startDate')}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-pill-500 focus:border-transparent ${
                errors.startDate ? 'border-red-300 bg-red-50' : 'border-gray-300'
              }`}
            />
            {errors.startDate && (
              <p className="mt-1 text-sm text-red-600">{errors.startDate.message}</p>
            )}
          </div>

          {/* End Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              End Date *
            </label>
            <input
              type="date"
              {...register('endDate')}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-pill-500 focus:border-transparent ${
                errors.endDate ? 'border-red-300 bg-red-50' : 'border-gray-300'
              }`}
            />
            {errors.endDate && (
              <p className="mt-1 text-sm text-red-600">{errors.endDate.message}</p>
            )}
          </div>
        </div>

        {/* Reminder Times */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Reminder Times *
          </label>
          <div className="space-y-3">
            {reminderTimes.map((time, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center space-x-3"
              >
                <input
                  type="time"
                  value={time}
                  onChange={(e) => updateReminderTime(index, e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pill-500 focus:border-transparent"
                />
                {reminderTimes.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeReminderTime(index)}
                    className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                )}
              </motion.div>
            ))}
            
            {reminderTimes.length < 6 && (
              <button
                type="button"
                onClick={addReminderTime}
                className="text-sm text-pill-600 hover:text-pill-700 font-medium"
              >
                + Add another time
              </button>
            )}
          </div>
          {errors.reminderTimes && (
            <p className="mt-1 text-sm text-red-600">{errors.reminderTimes.message}</p>
          )}
        </div>
      </div>

      {/* Additional Information */}
      <div className="space-y-6 pt-6 border-t border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <CalendarIcon className="h-5 w-5 mr-2 text-pill-600" />
          Additional Information
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Instructions */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Instructions
            </label>
            <textarea
              {...register('instructions')}
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pill-500 focus:border-transparent resize-none"
              placeholder="e.g., Take with food, Avoid alcohol"
            />
            {errors.instructions && (
              <p className="mt-1 text-sm text-red-600">{errors.instructions.message}</p>
            )}
          </div>

          {/* Prescribed By */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Prescribed By
            </label>
            <input
              type="text"
              {...register('prescribedBy')}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pill-500 focus:border-transparent"
              placeholder="Dr. Smith"
            />
          </div>

          {/* Stock Quantity */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Current Stock
            </label>
            <input
              type="number"
              {...register('stockQuantity')}
              min="0"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pill-500 focus:border-transparent"
              placeholder="30"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes
            </label>
            <textarea
              {...register('notes')}
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pill-500 focus:border-transparent resize-none"
              placeholder="Any additional notes..."
            />
          </div>
        </div>

        {/* Reminder Options */}
        <div className="space-y-4">
          <div className="flex items-center">
            <input
              type="checkbox"
              {...register('refillReminder')}
              id="refillReminder"
              className="h-4 w-4 text-pill-600 focus:ring-pill-500 border-gray-300 rounded"
            />
            <label htmlFor="refillReminder" className="ml-3 text-sm text-gray-700">
              Remind me to refill this medicine
            </label>
          </div>
          
          <div className="flex items-center">
            <input
              type="checkbox"
              {...register('takeLowStockReminder')}
              id="lowStockReminder"
              className="h-4 w-4 text-pill-600 focus:ring-pill-500 border-gray-300 rounded"
            />
            <label htmlFor="lowStockReminder" className="ml-3 text-sm text-gray-700">
              Alert me when stock is low (below 7 doses)
            </label>
          </div>
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting || !isValid}
          className={`px-8 py-3 bg-pill-600 text-white rounded-lg font-medium transition-all duration-200 ${
            isSubmitting || !isValid
              ? 'opacity-50 cursor-not-allowed'
              : 'hover:bg-pill-700 hover:scale-105'
          }`}
        >
          {isSubmitting ? 'Saving...' : submitText}
        </button>
      </div>
    </form>
  );
};

export default MedicineForm;
