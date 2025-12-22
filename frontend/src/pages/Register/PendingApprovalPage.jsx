import React from 'react';
import { Link } from 'react-router-dom';
import { MailCheck, ArrowLeft } from 'lucide-react';

export default function PendingApprovalPage() {
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex flex-col justify-center items-center p-4">
      <div className="max-w-md w-full mx-auto text-center bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl">
        <div className="flex justify-center items-center mx-auto w-20 h-20 bg-primary-100 dark:bg-primary-900/50 rounded-full mb-6">
          <MailCheck className="w-12 h-12 text-primary-600 dark:text-primary-300" />
        </div>
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">Registration Submitted</h1>
        <p className="mt-4 text-md text-gray-600 dark:text-gray-300">
          Thank you for registering. Your account has been created and is now waiting for administrator approval.
        </p>
        <p className="mt-2 text-md text-gray-600 dark:text-gray-300">
          You will be able to log in once your account has been activated.
        </p>
        <div className="mt-8">
          <Link
            to="/"
            className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
          >
            <ArrowLeft size={16} className="mr-2" />
            Go to Homepage
          </Link>
        </div>
      </div>
    </div>
  );
}