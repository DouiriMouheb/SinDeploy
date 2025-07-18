// Client/src/components/Auth/AuthMethodSelector.jsx - Authentication Method Selector (OIDC Only)
import { Shield } from 'lucide-react';

export const AuthMethodSelector = ({ onMethodSelect }) => {
  // Since we're only using OIDC now, this component just shows OIDC option

  const authMethods = [
    {
      id: 'jwt',
      name: 'JWT Authentication',
      description: 'Traditional token-based authentication',
      icon: Key,
      features: ['Local database', 'Custom implementation', 'Full control'],
      color: 'blue',
      available: availableAuthMethods.includes('jwt')
    },
    {
      id: 'oidc',
      name: 'AWS Cognito OIDC',
      description: 'Standard OIDC authentication (Recommended)',
      icon: Globe,
      features: ['OIDC standard', 'AWS managed', 'Enterprise ready'],
      color: 'green',
      available: availableAuthMethods.includes('oidc')
    }
  ];

  const handleMethodSelect = (methodId) => {
    switchAuthMethod(methodId);
    onMethodSelect?.(methodId);
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-6">
      <div className="text-center mb-8">
        <div className="flex items-center justify-center mb-4">
          <Shield className="h-8 w-8 text-blue-600 mr-3" />
          <h2 className="text-3xl font-bold text-gray-900">Choose Authentication Method</h2>
        </div>
        <p className="text-gray-600 text-lg">
          Select how you'd like to authenticate. You can switch between methods anytime.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-8">
        {authMethods.map((method) => {
          const IconComponent = method.icon;
          const isSelected = authMethod === method.id;
          const isAvailable = method.available;

          return (
            <div
              key={method.id}
              className={`
                relative p-6 rounded-xl border-2 transition-all duration-200 cursor-pointer
                ${isSelected 
                  ? `border-${method.color}-500 bg-${method.color}-50 shadow-lg` 
                  : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                }
                ${!isAvailable ? 'opacity-50 cursor-not-allowed' : ''}
              `}
              onClick={() => isAvailable && handleMethodSelect(method.id)}
            >
              {/* Selection Indicator */}
              {isSelected && (
                <div className={`absolute top-4 right-4 w-6 h-6 bg-${method.color}-500 rounded-full flex items-center justify-center`}>
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
              )}

              {/* Method Icon */}
              <div className={`inline-flex p-3 rounded-lg mb-4 ${
                isSelected ? `bg-${method.color}-100` : 'bg-gray-100'
              }`}>
                <IconComponent className={`h-6 w-6 ${
                  isSelected ? `text-${method.color}-600` : 'text-gray-600'
                }`} />
              </div>

              {/* Method Info */}
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {method.name}
              </h3>
              <p className="text-gray-600 mb-4">
                {method.description}
              </p>

              {/* Features */}
              <ul className="space-y-2">
                {method.features.map((feature, index) => (
                  <li key={index} className="flex items-center text-sm text-gray-700">
                    <div className={`w-1.5 h-1.5 rounded-full mr-3 ${
                      isSelected ? `bg-${method.color}-500` : 'bg-gray-400'
                    }`}></div>
                    {feature}
                  </li>
                ))}
              </ul>

              {/* Status Badge */}
              <div className="mt-4 pt-4 border-t border-gray-200">
                {isSelected ? (
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-${method.color}-100 text-${method.color}-800`}>
                    <Zap className="w-3 h-3 mr-1" />
                    Currently Active
                  </span>
                ) : isAvailable ? (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                    Available
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                    Not Available
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Current Selection Info */}
      <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
            <span className="text-sm font-medium text-gray-900">
              Current Method: {authMethods.find(m => m.id === authMethod)?.name}
            </span>
          </div>
          <span className="text-xs text-gray-500">
            You can change this anytime in settings
          </span>
        </div>
      </div>

      {/* Development Info */}
      {import.meta.env.DEV && (
        <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <Shield className="h-5 w-5 text-yellow-600" />
            </div>
            <div className="ml-3">
              <h4 className="text-sm font-medium text-yellow-800">Development Mode</h4>
              <p className="text-sm text-yellow-700 mt-1">
                Both authentication methods are available for testing. 
                OIDC uses AWS Cognito with standard OpenID Connect protocol.
              </p>
              <div className="mt-2 text-xs text-yellow-600">
                <strong>Test Accounts:</strong>
                <br />• JWT: Use existing accounts
                <br />• OIDC: admin@sindeploy.com / TempPass123!
                <br />• Note: Users cannot create accounts - admin only
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AuthMethodSelector;
