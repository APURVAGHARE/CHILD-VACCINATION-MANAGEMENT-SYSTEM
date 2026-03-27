import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  UserIcon,
  PhoneIcon,
  CalendarIcon,
  MapPinIcon,
  HeartIcon,
  DocumentTextIcon,
  ShieldCheckIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  CheckIcon,
  CameraIcon
} from '@heroicons/react/24/outline';
import { childrenAPI } from '../services/api';

const AddChild = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  
  // Get logged-in user from localStorage
  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);
  
  const [formData, setFormData] = useState({
    // Personal Information
    firstName: '',
    lastName: '',
    dob: '',
    gender: '',
    bloodGroup: '',
    birthWeight: '',
    birthHeight: '',
    profileImage: null,
    
    // Parent/Guardian Information
    relationship: 'mother',
    alternatePhone: '',
    
    // Medical Information
    pediatrician: '',
    pediatricianPhone: '',
    allergies: '',
    chronicConditions: '',
    medications: '',
    
    // Emergency Contact
    emergencyName: '',
    emergencyRelationship: '',
    emergencyPhone: '',
    
    // Insurance Information
    insuranceProvider: '',
    insuranceId: '',
    insuranceGroup: '',
  });

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    if (type === 'file') {
      setFormData(prev => ({
        ...prev,
        [name]: files[0]
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    // Validate form
    if (!formData.firstName || !formData.lastName || !formData.dob || !formData.gender) {
      toast.error('Please fill in all required fields');
      setLoading(false);
      return;
    }

    try {
      // Prepare data for API (match backend schema)
      const childData = {
        full_name: `${formData.firstName} ${formData.lastName}`.trim(),
        date_of_birth: formData.dob,
        gender: formData.gender === 'female' ? 'Female' : 'Male',
        blood_group: formData.bloodGroup || null,
        // Additional fields (you can extend your database later)
        birth_weight: formData.birthWeight ? parseFloat(formData.birthWeight) : null,
        birth_height: formData.birthHeight ? parseFloat(formData.birthHeight) : null,
        pediatrician: formData.pediatrician || null,
        pediatrician_phone: formData.pediatricianPhone || null,
        allergies: formData.allergies || null,
        chronic_conditions: formData.chronicConditions || null,
        medications: formData.medications || null,
        emergency_contact: formData.emergencyName ? {
          name: formData.emergencyName,
          relationship: formData.emergencyRelationship,
          phone: formData.emergencyPhone
        } : null
      };

      // Call API to create child
      const response = await childrenAPI.create(childData);
      
      toast.success(`${formData.firstName} ${formData.lastName} has been added to your family!`, {
        icon: '👶',
      });

      // Navigate to children list
      navigate('/children');

    } catch (error) {
      console.error('Error adding child:', error);
      
      if (error.response) {
        if (error.response.status === 401) {
          toast.error('Session expired. Please login again.');
          navigate('/login');
        } else if (error.response.data?.error) {
          toast.error(error.response.data.error);
        } else {
          toast.error('Failed to add child. Please try again.');
        }
      } else if (error.request) {
        toast.error('Cannot connect to server. Please check if backend is running.');
      } else {
        toast.error('An error occurred. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    { 
      number: 1, 
      name: 'Child Details', 
      icon: UserIcon,
      description: 'Basic information about your child'
    },
    { 
      number: 2, 
      name: 'Medical Info', 
      icon: HeartIcon,
      description: 'Health information'
    },
    { 
      number: 3, 
      name: 'Emergency', 
      icon: ShieldCheckIcon,
      description: 'Emergency contact'
    },
  ];

  const nextStep = () => {
    if (currentStep < steps.length) {
      setCurrentStep(prev => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const renderStepIndicator = () => {
    return (
      <div className="mb-12">
        <div className="relative">
          <div className="absolute top-5 left-0 w-full h-1 bg-gray-200 rounded-full">
            <div 
              className="h-1 bg-gradient-to-r from-primary-500 to-primary-600 rounded-full transition-all duration-500"
              style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
            ></div>
          </div>
          
          <div className="relative flex justify-between">
            {steps.map((step, index) => (
              <div key={step.number} className="flex flex-col items-center">
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-500
                    ${currentStep > step.number 
                      ? 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg shadow-green-200' 
                      : currentStep === step.number
                      ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg shadow-primary-200 scale-110'
                      : 'bg-gray-200 text-gray-500'
                    }`}
                >
                  {currentStep > step.number ? (
                    <CheckIcon className="h-6 w-6" />
                  ) : (
                    <step.icon className="h-6 w-6" />
                  )}
                </div>
                <span className={`mt-2 text-sm font-medium ${
                  currentStep === step.number ? 'text-primary-600' : 'text-gray-500'
                }`}>
                  {step.name}
                </span>
                <span className="text-xs text-gray-400 hidden md:block">{step.description}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderPersonalInfo = () => (
    <div className="space-y-6 animate-fadeIn">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile Image Upload */}
        <div className="col-span-1">
          <div className="card text-center p-6">
            <div className="relative inline-block">
              <div className="h-32 w-32 rounded-full bg-gradient-to-r from-primary-100 to-purple-100 mx-auto flex items-center justify-center border-4 border-white shadow-xl">
                {formData.profileImage ? (
                  <img 
                    src={URL.createObjectURL(formData.profileImage)} 
                    alt="Preview" 
                    className="h-full w-full rounded-full object-cover"
                  />
                ) : (
                  <UserIcon className="h-16 w-16 text-primary-400" />
                )}
              </div>
              <label htmlFor="profileImage" className="absolute bottom-0 right-0 h-8 w-8 bg-primary-600 rounded-full flex items-center justify-center cursor-pointer hover:bg-primary-700 transition-colors shadow-lg">
                <CameraIcon className="h-4 w-4 text-white" />
                <input
                  type="file"
                  id="profileImage"
                  name="profileImage"
                  accept="image/*"
                  onChange={handleChange}
                  className="hidden"
                />
              </label>
            </div>
            <p className="text-sm text-gray-500 mt-4">Upload child's photo</p>
          </div>
        </div>

        {/* Form Fields */}
        <div className="col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              First Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              className="input-field"
              placeholder="e.g., Aaradhya"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Last Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              className="input-field"
              placeholder="e.g., Sharma"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date of Birth <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              name="dob"
              value={formData.dob}
              onChange={handleChange}
              className="input-field"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Gender <span className="text-red-500">*</span>
            </label>
            <select
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              className="input-field"
              required
            >
              <option value="">Select gender</option>
              <option value="female">Girl 👧</option>
              <option value="male">Boy 👦</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Blood Group
            </label>
            <select
              name="bloodGroup"
              value={formData.bloodGroup}
              onChange={handleChange}
              className="input-field"
            >
              <option value="">Select blood group</option>
              <option value="A+">A+</option>
              <option value="A-">A-</option>
              <option value="B+">B+</option>
              <option value="B-">B-</option>
              <option value="O+">O+</option>
              <option value="O-">O-</option>
              <option value="AB+">AB+</option>
              <option value="AB-">AB-</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Birth Weight (kg)
            </label>
            <input
              type="number"
              step="0.01"
              name="birthWeight"
              value={formData.birthWeight}
              onChange={handleChange}
              className="input-field"
              placeholder="e.g., 3.2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Birth Height (cm)
            </label>
            <input
              type="number"
              step="0.1"
              name="birthHeight"
              value={formData.birthHeight}
              onChange={handleChange}
              className="input-field"
              placeholder="e.g., 50"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Relationship to Child <span className="text-red-500">*</span>
            </label>
            <select
              name="relationship"
              value={formData.relationship}
              onChange={handleChange}
              className="input-field"
              required
            >
              <option value="mother">Mother</option>
              <option value="father">Father</option>
              <option value="guardian">Legal Guardian</option>
              <option value="grandparent">Grandparent</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );

  const renderMedicalInfo = () => (
    <div className="space-y-6 animate-fadeIn">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Pediatrician's Name
          </label>
          <input
            type="text"
            name="pediatrician"
            value={formData.pediatrician}
            onChange={handleChange}
            className="input-field"
            placeholder="e.g., Dr. Priya Singh"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Pediatrician's Phone
          </label>
          <input
            type="tel"
            name="pediatricianPhone"
            value={formData.pediatricianPhone}
            onChange={handleChange}
            className="input-field"
            placeholder="e.g., 98765 43212"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Allergies (if any)
        </label>
        <textarea
          name="allergies"
          value={formData.allergies}
          onChange={handleChange}
          rows="3"
          className="input-field"
          placeholder="e.g., penicillin, eggs, peanuts"
        />
        <p className="text-xs text-gray-500 mt-1">Separate multiple allergies with commas</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Chronic Conditions
        </label>
        <textarea
          name="chronicConditions"
          value={formData.chronicConditions}
          onChange={handleChange}
          rows="3"
          className="input-field"
          placeholder="e.g., asthma, diabetes"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Current Medications
        </label>
        <textarea
          name="medications"
          value={formData.medications}
          onChange={handleChange}
          rows="3"
          className="input-field"
          placeholder="List any medications"
        />
      </div>
    </div>
  );

  const renderEmergencyInfo = () => (
    <div className="space-y-6 animate-fadeIn">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Emergency Contact Name
          </label>
          <input
            type="text"
            name="emergencyName"
            value={formData.emergencyName}
            onChange={handleChange}
            className="input-field"
            placeholder="e.g., Rajesh Sharma"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Relationship
          </label>
          <input
            type="text"
            name="emergencyRelationship"
            value={formData.emergencyRelationship}
            onChange={handleChange}
            className="input-field"
            placeholder="e.g., Father, Grandmother"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Emergency Phone
          </label>
          <input
            type="tel"
            name="emergencyPhone"
            value={formData.emergencyPhone}
            onChange={handleChange}
            className="input-field"
            placeholder="e.g., 98765 43213"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Alternate Phone
          </label>
          <input
            type="tel"
            name="alternatePhone"
            value={formData.alternatePhone}
            onChange={handleChange}
            className="input-field"
            placeholder="e.g., 98765 43211"
          />
        </div>
      </div>

      {/* Summary Card */}
      <div className="mt-8 bg-gradient-to-r from-primary-50 to-purple-50 rounded-xl p-6 border border-primary-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <DocumentTextIcon className="h-5 w-5 text-primary-600 mr-2" />
          Registration Summary
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-xs text-gray-500">Child's Name</p>
            <p className="font-medium text-gray-900">
              {formData.firstName || 'Not provided'} {formData.lastName || ''}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Parent</p>
            <p className="font-medium text-gray-900">{user?.full_name || 'You'}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">DOB</p>
            <p className="font-medium text-gray-900">{formData.dob || 'Not provided'}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Blood Group</p>
            <p className="font-medium text-gray-900">{formData.bloodGroup || 'Not specified'}</p>
          </div>
        </div>
      </div>

      {/* Terms and Submit */}
      <div className="mt-8">
        <div className="flex items-start">
          <div className="flex items-center h-5">
            <input
              id="terms"
              name="terms"
              type="checkbox"
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              required
            />
          </div>
          <div className="ml-3 text-sm">
            <label htmlFor="terms" className="font-medium text-gray-700">
              I confirm that all information is accurate
            </label>
            <p className="text-gray-500">This information will be shared with healthcare providers.</p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderCurrentStep = () => {
    switch(currentStep) {
      case 1:
        return renderPersonalInfo();
      case 2:
        return renderMedicalInfo();
      case 3:
        return renderEmergencyInfo();
      default:
        return null;
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="relative overflow-hidden rounded-3xl mb-8 bg-gradient-to-r from-primary-600 to-purple-600">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1543333995-a78aea2eee50?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80')] bg-cover bg-center opacity-20"></div>
        <div className="relative px-8 py-6 text-white">
          <h1 className="text-3xl font-bold mb-2">Add a New Child</h1>
          <p className="text-primary-100">Add your child to start tracking their vaccinations</p>
        </div>
      </div>

      {/* Main Form Card */}
      <div className="card">
        {/* Step Indicator */}
        {renderStepIndicator()}

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-8">
          {renderCurrentStep()}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={prevStep}
              className={`btn-secondary flex items-center ${currentStep === 1 ? 'invisible' : ''}`}
            >
              <ArrowLeftIcon className="h-5 w-5 mr-2" />
              Previous
            </button>
            
            {currentStep < steps.length ? (
              <button
                type="button"
                onClick={nextStep}
                className="btn-primary flex items-center"
              >
                Next
                <ArrowRightIcon className="h-5 w-5 ml-2" />
              </button>
            ) : (
              <button
                type="submit"
                disabled={loading}
                className="btn-primary flex items-center min-w-[200px] justify-center"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Adding...
                  </>
                ) : (
                  <>
                    <CheckIcon className="h-5 w-5 mr-2" />
                    Register Child
                  </>
                )}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddChild;