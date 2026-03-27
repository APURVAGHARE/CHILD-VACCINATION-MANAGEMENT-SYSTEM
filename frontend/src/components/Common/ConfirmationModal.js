import React from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { ExclamationTriangleIcon, XMarkIcon } from '@heroicons/react/24/outline';

const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, message, type = 'warning' }) => {
  const getIcon = () => {
    switch(type) {
      case 'danger':
        return <ExclamationTriangleIcon className="h-12 w-12 text-red-600" />;
      case 'warning':
        return <ExclamationTriangleIcon className="h-12 w-12 text-yellow-600" />;
      case 'success':
        return <svg className="h-12 w-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>;
      default:
        return <ExclamationTriangleIcon className="h-12 w-12 text-primary-600" />;
    }
  };

  const getButtonClass = () => {
    switch(type) {
      case 'danger':
        return 'bg-red-600 hover:bg-red-700';
      case 'warning':
        return 'bg-yellow-600 hover:bg-yellow-700';
      case 'success':
        return 'bg-green-600 hover:bg-green-700';
      default:
        return 'bg-primary-600 hover:bg-primary-700';
    }
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-2xl transition-all">
                <div className="absolute top-4 right-4">
                  <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>
                
                <div className="flex flex-col items-center text-center">
                  <div className={`mb-4 p-3 rounded-full ${
                    type === 'danger' ? 'bg-red-100' :
                    type === 'warning' ? 'bg-yellow-100' :
                    type === 'success' ? 'bg-green-100' : 'bg-primary-100'
                  }`}>
                    {getIcon()}
                  </div>
                  
                  <Dialog.Title
                    as="h3"
                    className="text-2xl font-bold text-gray-900 mb-2"
                  >
                    {title}
                  </Dialog.Title>
                  
                  <p className="text-sm text-gray-500 mb-6">
                    {message}
                  </p>

                  <div className="flex space-x-4 w-full">
                    <button
                      type="button"
                      className="flex-1 btn-secondary"
                      onClick={onClose}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      className={`flex-1 text-white px-4 py-2 rounded-lg font-semibold 
                               transition-all duration-300 transform hover:scale-105
                               ${getButtonClass()}`}
                      onClick={() => {
                        onConfirm();
                        onClose();
                      }}
                    >
                      Confirm
                    </button>
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default ConfirmationModal; 
