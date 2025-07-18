// Client/src/components/Auth/AuthMethodSelector.jsx - Simple OIDC Only Selector
import { Shield } from 'lucide-react';

export const AuthMethodSelector = ({ onMethodSelect }) => {
  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          Choose Authentication Method
        </h2>
        <p className="text-gray-600 dark:text-gray-300">
          Select how you'd like to sign in to your account
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
        <div className="text-center">
          <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-blue-600 dark:text-blue-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            AWS Cognito (OIDC)
          </h3>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Secure authentication powered by Amazon Web Services
          </p>
          <button
            onClick={() => onMethodSelect('oidc')}
            className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Continue with AWS Cognito
          </button>
        </div>
      </div>

      <div className="text-center mt-6">
        <p className="text-xs text-gray-500">
          © 2025 Sinergia Company Portal. All rights reserved.
        </p>
      </div>
    </div>
  );
};
