import React from 'react';
import { AlertTriangle, Info, CheckCircle, X, Loader2 } from 'lucide-react';
import Modal from './Modal'; // Assuming your generic Modal wrapper

const ConfirmDialog = ({
  isOpen,
  onConfirm,
  onCancel,
  title = 'Confirm Action',
  message = 'Are you sure you want to proceed? This action cannot be undone.',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'primary', // 'danger' | 'success' | 'warning' | 'primary'
  isProcessing = false
}) => {
  
  // --- Theme Configuration ---
  const themes = {
    danger: {
      icon: AlertTriangle,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-100',
      buttonBg: 'bg-red-600 hover:bg-red-700 focus:ring-red-500',
      iconBg: 'bg-red-100'
    },
    warning: {
      icon: AlertTriangle,
      color: 'text-amber-600',
      bgColor: 'bg-amber-50',
      borderColor: 'border-amber-100',
      buttonBg: 'bg-amber-600 hover:bg-amber-700 focus:ring-amber-500',
      iconBg: 'bg-amber-100'
    },
    success: {
      icon: CheckCircle,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
      borderColor: 'border-emerald-100',
      buttonBg: 'bg-emerald-600 hover:bg-emerald-700 focus:ring-emerald-500',
      iconBg: 'bg-emerald-100'
    },
    primary: {
      icon: Info,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-100',
      buttonBg: 'bg-slate-900 hover:bg-slate-800 focus:ring-slate-500', // Standard sleek black/dark
      iconBg: 'bg-blue-100'
    }
  };

  const theme = themes[variant] || themes.primary;
  const IconComponent = theme.icon;

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={!isProcessing ? onCancel : undefined} 
      size="small"
      // We hide the default Modal title to create a custom layout with the icon
      hideHeader={true} 
    >
      <div className="pt-2">
        <div className="sm:flex sm:items-start">
          
          {/* Icon Circle */}
          <div className={`mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full ${theme.iconBg} sm:mx-0 sm:h-10 sm:w-10 mb-4 sm:mb-0`}>
            <IconComponent className={`h-6 w-6 ${theme.color}`} aria-hidden="true" />
          </div>

          {/* Text Content */}
          <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left w-full">
            <h3 className="text-lg font-semibold leading-6 text-slate-900" id="modal-title">
              {title}
            </h3>
            <div className="mt-2">
              <p className="text-sm text-slate-500">
                {message}
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 sm:mt-6 sm:flex sm:flex-row-reverse gap-3">
          <button
            type="button"
            disabled={isProcessing}
            onClick={onConfirm}
            className={`
              inline-flex w-full justify-center items-center rounded-lg px-3 py-2.5 text-sm font-semibold text-white shadow-sm ring-1 ring-inset ring-transparent transition-all sm:w-auto sm:px-6
              ${theme.buttonBg}
              ${isProcessing ? 'opacity-70 cursor-not-allowed' : ''}
              focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2
            `}
          >
            {isProcessing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              confirmText
            )}
          </button>
          
          <button
            type="button"
            disabled={isProcessing}
            onClick={onCancel}
            className="mt-3 inline-flex w-full justify-center rounded-lg bg-white px-3 py-2.5 text-sm font-semibold text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 hover:bg-slate-50 sm:mt-0 sm:w-auto sm:px-5 transition-colors"
          >
            {cancelText}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmDialog;