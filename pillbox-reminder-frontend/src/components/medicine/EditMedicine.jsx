import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  ArrowLeftIcon,
  PencilIcon,
  InformationCircleIcon,
  ExclamationTriangleIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import MedicineForm from './MedicineForm';
import LoadingSpinner from '../common/LoadingSpinner';
import { useMedicines } from '../hooks/useMedicines';
import toast from 'react-hot-toast';

const EditMedicine = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { medicines, updateMedicine, getMedicine } = useMedicines();
  const [medicine, setMedicine] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchMedicine = async () => {
      try {
        setLoading(true);
        // First try to find in local state
        const localMedicine = medicines?.find(m => m.id === id);
        
        if (localMedicine) {
          setMedicine(localMedicine);
        } else {
          // Fetch from API if not in local state
          const fetchedMedicine = await getMedicine(id);
          setMedicine(fetchedMedicine);
        }
      } catch (error) {
        console.error('Error fetching medicine:', error);
        toast.error('Medicine not found');
        navigate('/medicines');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchMedicine();
    }
  }, [id, medicines, getMedicine, navigate]);

  const handleSubmit = async (medicineData) => {
    setIsSubmitting(true);
    
    try {
      await updateMedicine(id, medicineData);
      toast.success('Medicine updated successfully!');
      navigate('/medicines');
    } catch (error) {
      console.error('Error updating medicine:', error);
      toast.error('Failed to update medicine. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    const hasChanges = window.confirm(
      'You have unsaved changes. Are you sure you want to leave without saving?'
    );
    if (hasChanges) {
      navigate('/medicines');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  if (!medicine) {
    return (
      <div className="text-center py-16">
        <div className="bg-white rounded-xl shadow-lg p-12">
          <ExclamationTriangleIcon className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Medicine Not Found</h2>
          <p className="text-gray-600 mb-6">
            The medicine you're looking for doesn't exist or has been deleted.
          </p>
          <button
            onClick={() => navigate('/medicines')}
            className="inline-flex items-center px-4 py-2 bg-pill-500 text-white rounded-lg hover:bg-pill-600 transition-colors"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            Back to Medicines
          </button>
        </div>
      </div>
    );
  }

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
            <h1 className="text-3xl font-bold text-gray-900">Edit Medicine</h1>
            <p className="text-gray-600 mt-1">Update details for "{medicine.name}"</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <PencilIcon className="h-8 w-8 text-pill-500" />
        </div>
      </motion.div>

      {/* Medicine Overview Card */}
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
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <div 
                  className="w-12 h-12 rounded-lg flex items-center justify-center text-2xl"
                  style={{ backgroundColor: medicine.color + '40' }}
                >
                  {medicine.type === 'tablet' ? '💊' : 
                   medicine.type === 'liquid' ? '🧴' : 
                   medicine.type === 'injection' ? '💉' : '💊'}
                </div>
              </div>
              <div>
                <h2 className="text-xl font-semibold mb-1">{medicine.name}</h2>
                <p className="text-white/90 text-sm mb-2">{medicine.dosage} • {medicine.type}</p>
                <div className="flex items-center space-x-4 text-sm text-white/80">
                  <div className="flex items-center">
                    <ClockIcon className="h-4 w-4 mr-1" />
                    {medicine.frequency?.replace('-', ' ')}
                  </div>
                  {medicine.reminderTimes && (
                    <div>
                      {medicine.reminderTimes.length} reminder{medicine.reminderTimes.length !== 1 ? 's' : ''}
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {medicine.photo && (
              <div className="flex-shrink-0">
                <img
                  src={medicine.photo}
                  alt={medicine.name}
                  className="w-16 h-16 rounded-lg object-cover border-2 border-white/20"
                />
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Edit Tips */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-blue-50 border border-blue-200 rounded-xl p-6"
      >
        <div className="flex items-start space-x-3">
          <InformationCircleIcon className="h-6 w-6 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="text-blue-900 font-medium mb-2">Editing Tips</h3>
            <ul className="text-blue-800 text-sm space-y-1">
              <li>• Changes to reminder times will affect future notifications</li>
              <li>• Updating the end date will extend or shorten the treatment period</li>
              <li>• Stock quantity changes help track remaining doses</li>
              <li>• All active reminders will be updated with your changes</li>
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
            initialData={medicine}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            isSubmitting={isSubmitting}
            submitText="Update Medicine"
            mode="edit"
          />
        </div>
      </motion.div>

      {/* History/Change Log (Future Enhancement) */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-gray-50 border border-gray-200 rounded-xl p-6"
      >
        <div className="flex items-start space-x-3">
          <ClockIcon className="h-6 w-6 text-gray-400 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="text-gray-900 font-medium mb-2">Medicine History</h3>
            <div className="text-gray-600 text-sm space-y-2">
              <div className="flex justify-between">
                <span>Created:</span>
                <span>{new Date(medicine.createdAt || Date.now()).toLocaleDateString()}</span>
              </div>
              {medicine.updatedAt && medicine.updatedAt !== medicine.createdAt && (
                <div className="flex justify-between">
                  <span>Last updated:</span>
                  <span>{new Date(medicine.updatedAt).toLocaleDateString()}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Status:</span>
                <span className={medicine.active ? 'text-green-600' : 'text-gray-500'}>
                  {medicine.active ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Warning for Critical Changes */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-amber-50 border border-amber-200 rounded-xl p-6"
      >
        <div className="flex items-start space-x-3">
          <ExclamationTriangleIcon className="h-6 w-6 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="text-amber-900 font-medium mb-2">Important Notice</h3>
            <p className="text-amber-800 text-sm">
              Always consult with your healthcare provider before making significant changes to your 
              medication routine, including dosage, timing, or duration. This app is designed to help 
              you remember to take your medication but should not replace professional medical advice.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default EditMedicine;
