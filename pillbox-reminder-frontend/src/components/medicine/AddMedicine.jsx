import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeftIcon,
  PlusIcon,
  InformationCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import MedicineForm from './MedicineForm';
import { useMedicines } from '../hooks/useMedicines';
import toast from 'react-hot-toast';

const AddMedicine = () => {
  const navigate = useNavigate();
  const { addMedicine } = useMedicines();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (medicineData) => {
    setIsSubmitting(true);
    
    try {
      await addMedicine(medicineData);
      toast.success('Medicine added successfully!');
      navigate('/medicines');
    } catch (error) {
      console.error('Error adding medicine:', error);
      toast.error('Failed to add medicine. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate('/medicines');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/medicines')}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors duration-200"
          >
            <ArrowLeftIcon className="h-6 w-6" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Add New Medicine</h1>
            <p className="text-gray-600 mt-1">Fill in the details to add a new medicine to your list</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <PlusIcon className="h-8 w-8 text-pill-500" />
        </div>
      </motion.div>

      {/* Welcome Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="relative bg-gradient-to-r from-pill-500 via-blue-600 to-purple-600 rounded-xl p-6 text-white overflow-hidden"
      >
        {/* PatternCraft Background */}
        <div className="absolute inset-0" style={{
          backgroundImage: `
            radial-gradient(circle at 25% 25%, rgba(255, 255, 255, 0.1) 0%, transparent 50%),
            radial-gradient(circle at 75% 75%, rgba(255, 255, 255, 0.1) 0%, transparent 50%),
            linear-gradient(45deg, transparent 30%, rgba(255, 255, 255, 0.05) 50%, transparent 70%)
          `
        }} />
        
        <div className="relative">
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                <span className="text-2xl">💊</span>
              </div>
            </div>
            <div>
              <h2 className="text-xl font-semibold mb-2">Adding Your Medicine</h2>
              <p className="text-white/90 text-sm leading-relaxed">
                Please provide accurate information about your medicine including dosage, frequency, and instructions. 
                This helps ensure you get the right reminders at the right time.
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Tips Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-blue-50 border border-blue-200 rounded-xl p-6"
      >
        <div className="flex items-start space-x-3">
          <InformationCircleIcon className="h-6 w-6 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="text-blue-900 font-medium mb-2">Tips for Adding Medicine</h3>
            <ul className="text-blue-800 text-sm space-y-1">
              <li>• Double-check the medicine name and dosage with your prescription</li>
              <li>• Include specific instructions like "take with food" or "before bedtime"</li>
              <li>• Set realistic reminder times that fit your daily routine</li>
              <li>• Add the expiration date to get alerts when medicine expires</li>
            </ul>
          </div>
        </div>
      </motion.div>

      {/* Form Container */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="relative bg-white rounded-xl shadow-lg overflow-hidden"
      >
        {/* PatternCraft Background */}
        <div className="absolute inset-0 opacity-20" style={{
          backgroundImage: `
            linear-gradient(135deg, rgba(59, 130, 246, 0.02) 0%, rgba(147, 197, 253, 0.05) 100%),
            radial-gradient(circle at 1px 1px, rgba(59, 130, 246, 0.1) 1px, transparent 0)
          `,
          backgroundSize: '100% 100%, 20px 20px'
        }} />
        
        <div className="relative p-8">
          <MedicineForm
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            isSubmitting={isSubmitting}
            submitText="Add Medicine"
            mode="add"
          />
        </div>
      </motion.div>

      {/* Safety Warning */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-amber-50 border border-amber-200 rounded-xl p-6"
      >
        <div className="flex items-start space-x-3">
          <ExclamationTriangleIcon className="h-6 w-6 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="text-amber-900 font-medium mb-2">Important Safety Information</h3>
            <p className="text-amber-800 text-sm">
              This app is designed to help you remember to take your medication, but it should not replace 
              professional medical advice. Always consult with your healthcare provider before making any 
              changes to your medication routine.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default AddMedicine;
