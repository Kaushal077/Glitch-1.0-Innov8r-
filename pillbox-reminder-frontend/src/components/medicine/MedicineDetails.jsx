import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { 
  ArrowLeftIcon,
  PencilIcon,
  TrashIcon,
  CalendarIcon,
  ClockIcon,
  InformationCircleIcon,
  BellIcon,
  HeartIcon,
  UserIcon,
  CameraIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import { format, differenceInDays, isAfter, addDays } from 'date-fns';
import LoadingSpinner from '../common/LoadingSpinner';
import ConfirmDialog from '../common/ConfirmDialog';
import { useMedicines } from '../hooks/useMedicines';
import { useReminders } from '../hooks/useReminders';
import toast from 'react-hot-toast';

const MedicineDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { medicines, deleteMedicine, getMedicine, toggleMedicineActive } = useMedicines();
  const { getMedicineReminders, getAdherenceStats } = useReminders();
  
  const [medicine, setMedicine] = useState(null);
  const [reminders, setReminders] = useState([]);
  const [adherenceStats, setAdherenceStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    const fetchMedicineDetails = async () => {
      try {
        setLoading(true);
        
        // Get medicine details
        const localMedicine = medicines?.find(m => m.id === id);
        let medicineData;
        
        if (localMedicine) {
          medicineData = localMedicine;
        } else {
          medicineData = await getMedicine(id);
        }
        
        setMedicine(medicineData);
        
        // Get reminders and stats
        const [medicineReminders, stats] = await Promise.all([
          getMedicineReminders?.(id) || [],
          getAdherenceStats?.(id) || null
        ]);
        
        setReminders(medicineReminders);
        setAdherenceStats(stats);
        
      } catch (error) {
        console.error('Error fetching medicine details:', error);
        toast.error('Medicine not found');
        navigate('/medicines');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchMedicineDetails();
    }
  }, [id, medicines, getMedicine, getMedicineReminders, getAdherenceStats, navigate]);

  const handleDelete = async () => {
    try {
      await deleteMedicine(id);
      toast.success('Medicine deleted successfully');
      navigate('/medicines');
    } catch (error) {
      toast.error('Failed to delete medicine');
    }
  };

  const handleToggleActive = async () => {
    try {
      await toggleMedicineActive(id);
      setMedicine(prev => ({ ...prev, active: !prev.active }));
      toast.success(`Medicine ${medicine.active ? 'deactivated' : 'activated'} successfully`);
    } catch (error) {
      toast.error('Failed to update medicine status');
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

  const isExpired = isAfter(new Date(), new Date(medicine.endDate));
  const isExpiringSoon = !isExpired && differenceInDays(new Date(medicine.endDate), new Date()) <= 7;
  const daysUntilExpiry = differenceInDays(new Date(medicine.endDate), new Date());
  const isLowStock = medicine.stockQuantity && medicine.stockQuantity < 7;

  const tabs = [
    { id: 'overview', label: 'Overview', icon: InformationCircleIcon },
    { id: 'schedule', label: 'Schedule', icon: ClockIcon },
    { id: 'history', label: 'History', icon: CalendarIcon },
    { id: 'settings', label: 'Settings', icon: PencilIcon }
  ];

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
            <h1 className="text-3xl font-bold text-gray-900">{medicine.name}</h1>
            <p className="text-gray-600 mt-1">Medicine Details & Management</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Link
            to={`/medicines/edit/${medicine.id}`}
            className="inline-flex items-center px-4 py-2 bg-pill-500 text-white rounded-lg hover:bg-pill-600 transition-colors duration-200"
          >
            <PencilIcon className="h-4 w-4 mr-2" />
            Edit
          </Link>
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="inline-flex items-center px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors duration-200"
          >
            <TrashIcon className="h-4 w-4 mr-2" />
            Delete
          </button>
        </div>
      </motion.div>

      {/* Medicine Hero Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="relative bg-gradient-to-r from-pill-500 via-blue-600 to-purple-600 rounded-xl p-8 text-white overflow-hidden"
      >
        {/* PatternCraft Background */}
        <div className="absolute inset-0" style={{
          backgroundImage: `
            radial-gradient(circle at 20% 20%, rgba(255, 255, 255, 0.1) 0%, transparent 50%),
            radial-gradient(circle at 80% 80%, rgba(255, 255, 255, 0.1) 0%, transparent 50%),
            linear-gradient(45deg, transparent 30%, rgba(255, 255, 255, 0.05) 50%, transparent 70%)
          `
        }} />
        
        <div className="relative">
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-6">
              <div 
                className="w-16 h-16 rounded-xl flex items-center justify-center text-3xl shadow-lg"
                style={{ backgroundColor: medicine.color + '40' }}
              >
                {medicine.type === 'tablet' ? '💊' : 
                 medicine.type === 'liquid' ? '🧴' : 
                 medicine.type === 'injection' ? '💉' : 
                 medicine.type === 'inhaler' ? '🫁' :
                 medicine.type === 'drops' ? '💧' : '💊'}
              </div>
              
              <div>
                <div className="flex items-center space-x-3 mb-2">
                  <h2 className="text-2xl font-bold">{medicine.name}</h2>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    medicine.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {medicine.active ? 'Active' : 'Inactive'}
                  </span>
                </div>
                
                <div className="space-y-1 text-white/90">
                  <p className="text-lg font-medium">{medicine.dosage} • {medicine.type}</p>
                  <p>{medicine.frequency?.replace('-', ' ')}</p>
                  {medicine.prescribedBy && (
                    <p className="text-sm">Prescribed by Dr. {medicine.prescribedBy}</p>
                  )}
                </div>
                
                <div className="flex items-center space-x-4 mt-4 text-sm">
                  <div className="flex items-center">
                    <CalendarIcon className="h-4 w-4 mr-1" />
                    <span>
                      {format(new Date(medicine.startDate), 'MMM dd')} - {format(new Date(medicine.endDate), 'MMM dd, yyyy')}
                    </span>
                  </div>
                  {medicine.reminderTimes && (
                    <div className="flex items-center">
                      <BellIcon className="h-4 w-4 mr-1" />
                      <span>{medicine.reminderTimes.length} reminders</span>
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
                  className="w-24 h-24 rounded-xl object-cover border-2 border-white/20 shadow-lg"
                />
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Status Alerts */}
      {(isExpired || isExpiringSoon || isLowStock) && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-3"
        >
          {isExpired && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center">
                <ExclamationTriangleIcon className="h-5 w-5 text-red-500 mr-3" />
                <div>
                  <h3 className="text-red-800 font-medium">Medicine Expired</h3>
                  <p className="text-red-600 text-sm">
                    This medicine expired on {format(new Date(medicine.endDate), 'MMMM dd, yyyy')}. 
                    Please consult your doctor for a new prescription.
                  </p>
                </div>
              </div>
            </div>
          )}
          
          {isExpiringSoon && !isExpired && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center">
                <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500 mr-3" />
                <div>
                  <h3 className="text-yellow-800 font-medium">Expiring Soon</h3>
                  <p className="text-yellow-600 text-sm">
                    This medicine expires in {daysUntilExpiry} day{daysUntilExpiry !== 1 ? 's' : ''}. 
                    Consider getting a refill.
                  </p>
                </div>
              </div>
            </div>
          )}
          
          {isLowStock && (
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <div className="flex items-center">
                <ExclamationTriangleIcon className="h-5 w-5 text-orange-500 mr-3" />
                <div>
                  <h3 className="text-orange-800 font-medium">Low Stock</h3>
                  <p className="text-orange-600 text-sm">
                    Only {medicine.stockQuantity} doses remaining. Consider refilling soon.
                  </p>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      )}

      {/* Navigation Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white rounded-lg shadow-md p-1"
      >
        <div className="flex space-x-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center px-4 py-3 rounded-md text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-pill-100 text-pill-700'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <tab.icon className="h-4 w-4 mr-2" />
              {tab.label}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Tab Content */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-xl shadow-lg p-8"
      >
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Basic Information */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Medicine Name</label>
                    <p className="mt-1 text-lg text-gray-900">{medicine.name}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Dosage</label>
                    <p className="mt-1 text-lg text-gray-900">{medicine.dosage}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Type</label>
                    <p className="mt-1 text-lg text-gray-900 capitalize">{medicine.type}</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Frequency</label>
                    <p className="mt-1 text-lg text-gray-900">{medicine.frequency?.replace('-', ' ')}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Stock Quantity</label>
                    <p className="mt-1 text-lg text-gray-900">{medicine.stockQuantity || 'Not specified'} doses</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Prescribed By</label>
                    <p className="mt-1 text-lg text-gray-900">{medicine.prescribedBy || 'Not specified'}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Instructions */}
            {medicine.instructions && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Instructions</h3>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-blue-800">{medicine.instructions}</p>
                </div>
              </div>
            )}

            {/* Notes */}
            {medicine.notes && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Notes</h3>
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <p className="text-gray-700">{medicine.notes}</p>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'schedule' && (
          <div className="space-y-8">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Reminder Schedule</h3>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Start Date</label>
                    <p className="mt-1 text-lg text-gray-900">{format(new Date(medicine.startDate), 'MMMM dd, yyyy')}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">End Date</label>
                    <p className="mt-1 text-lg text-gray-900">{format(new Date(medicine.endDate), 'MMMM dd, yyyy')}</p>
                  </div>
                </div>
                
                {medicine.reminderTimes && medicine.reminderTimes.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">Daily Reminder Times</label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {medicine.reminderTimes.map((time, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-center p-3 bg-pill-100 text-pill-800 rounded-lg font-medium"
                        >
                          {time}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'history' && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900">Medicine History</h3>
            
            {/* Adherence Stats */}
            {adherenceStats && (
              <div className="bg-gray-50 rounded-lg p-6">
                <h4 className="font-medium text-gray-900 mb-4">Adherence Statistics</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{adherenceStats.taken || 0}</div>
                    <div className="text-sm text-gray-600">Doses Taken</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600">{adherenceStats.missed || 0}</div>
                    <div className="text-sm text-gray-600">Doses Missed</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{adherenceStats.percentage || 0}%</div>
                    <div className="text-sm text-gray-600">Adherence Rate</div>
                  </div>
                </div>
              </div>
            )}

            {/* Recent Activity */}
            <div>
              <h4 className="font-medium text-gray-900 mb-4">Recent Activity</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm text-gray-600">Medicine created</span>
                  <span className="text-sm text-gray-900">
                    {format(new Date(medicine.createdAt || Date.now()), 'MMM dd, yyyy')}
                  </span>
                </div>
                {medicine.updatedAt && medicine.updatedAt !== medicine.createdAt && (
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm text-gray-600">Last updated</span>
                    <span className="text-sm text-gray-900">
                      {format(new Date(medicine.updatedAt), 'MMM dd, yyyy')}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900">Medicine Settings</h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div>
                  <h4 className="font-medium text-gray-900">Active Status</h4>
                  <p className="text-sm text-gray-600">
                    {medicine.active ? 'Medicine is currently active and reminders are enabled' : 'Medicine is inactive and reminders are disabled'}
                  </p>
                </div>
                <button
                  onClick={handleToggleActive}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    medicine.active
                      ? 'bg-red-100 text-red-700 hover:bg-red-200'
                      : 'bg-green-100 text-green-700 hover:bg-green-200'
                  }`}
                >
                  {medicine.active ? 'Deactivate' : 'Activate'}
                </button>
              </div>

              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div>
                  <h4 className="font-medium text-gray-900">Refill Reminders</h4>
                  <p className="text-sm text-gray-600">
                    {medicine.refillReminder ? 'Enabled' : 'Disabled'}
                  </p>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm ${
                  medicine.refillReminder
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {medicine.refillReminder ? 'On' : 'Off'}
                </span>
              </div>

              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div>
                  <h4 className="font-medium text-gray-900">Low Stock Alerts</h4>
                  <p className="text-sm text-gray-600">
                    {medicine.takeLowStockReminder ? 'Enabled' : 'Disabled'}
                  </p>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm ${
                  medicine.takeLowStockReminder
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {medicine.takeLowStockReminder ? 'On' : 'Off'}
                </span>
              </div>
            </div>

            <div className="pt-6 border-t border-gray-200">
              <h4 className="font-medium text-gray-900 mb-4">Actions</h4>
              <div className="flex space-x-4">
                <Link
                  to={`/medicines/edit/${medicine.id}`}
                  className="inline-flex items-center px-4 py-2 bg-pill-500 text-white rounded-lg hover:bg-pill-600 transition-colors"
                >
                  <PencilIcon className="h-4 w-4 mr-2" />
                  Edit Medicine
                </Link>
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="inline-flex items-center px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                >
                  <TrashIcon className="h-4 w-4 mr-2" />
                  Delete Medicine
                </button>
              </div>
            </div>
          </div>
        )}
      </motion.div>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDelete}
        title="Delete Medicine"
        message={`Are you sure you want to delete "${medicine.name}"? This action cannot be undone and will also remove all associated reminders and history.`}
        confirmText="Delete Forever"
        confirmButtonClass="bg-red-600 hover:bg-red-700"
      />
    </div>
  );
};

export default MedicineDetails;
