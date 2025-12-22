import React from 'react';
import { AlertTriangle } from 'lucide-react';
import Spinner from './Spinner';

const ConfirmationModal = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = 'Confirm',
    confirmButtonClass = 'bg-red-600 hover:bg-red-700',
    isLoading = false
}) => {
    if (!isOpen) {
        return null;
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-[100] p-4">
            <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg w-full max-w-md">
                <div className="flex items-start">
                    <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/50 sm:mx-0 sm:h-10 sm:w-10">
                        <AlertTriangle className="h-6 w-6 text-red-600" aria-hidden="true" />
                    </div>
                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                        <h3 className="text-lg leading-6 font-bold text-gray-900 dark:text-gray-100">
                            {title}
                        </h3>
                        <div className="mt-2">
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                {message}
                            </p>
                        </div>
                    </div>
                </div>
                <div className="mt-8 sm:flex sm:flex-row-reverse">
                    <button
                        type="button"
                        className={`w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 text-base font-medium text-white focus:outline-none sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 ${confirmButtonClass}`}
                        onClick={onConfirm}
                        disabled={isLoading}
                    >
                        {isLoading ? <Spinner size="sm" /> : confirmText}
                    </button>
                    <button
                        type="button"
                        className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 dark:border-gray-500 shadow-sm px-4 py-2 bg-white dark:bg-gray-700 text-base font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none sm:mt-0 sm:w-auto sm:text-sm"
                        onClick={onClose}
                        disabled={isLoading}
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmationModal;