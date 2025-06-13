import React, { useState } from 'react';
import { Navigation, MapPin, ArrowRight, ArrowLeft, ArrowUp, ArrowDown, Clock, Footprints } from 'lucide-react';
import LocationSelector from './LocationSelector';

interface NavigationStep {
  from: string;
  to: string;
  direction: string;
  distance: number;
}

interface NavigationData {
  path: NavigationStep[];
  totalSteps: number;
}

interface NavigationViewProps {
  currentLocation: any;
  navigationData: NavigationData | null;
  onNavigationStart: (data: NavigationData) => void;
}

const NavigationView: React.FC<NavigationViewProps> = ({
  currentLocation,
  navigationData,
  onNavigationStart
}) => {
  const [selectedDestination, setSelectedDestination] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  const handleStartNavigation = async () => {
    if (!currentLocation || !selectedDestination) return;

    setLoading(true);
    try {
      const response = await fetch('http://localhost:3001/api/navigate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: currentLocation.id,
          to: selectedDestination.id,
        }),
      });

      if (!response.ok) {
        throw new Error('Navigation failed');
      }

      const data = await response.json();
      onNavigationStart(data);
      setCurrentStep(0);
    } catch (error) {
      console.error('Navigation error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDirectionIcon = (direction: string) => {
    switch (direction.toUpperCase()) {
      case 'F':
        return <ArrowUp className="w-5 h-5" />;
      case 'B':
        return <ArrowDown className="w-5 h-5" />;
      case 'L':
        return <ArrowLeft className="w-5 h-5" />;
      case 'R':
        return <ArrowRight className="w-5 h-5" />;
      default:
        return <ArrowUp className="w-5 h-5" />;
    }
  };

  const getDirectionText = (direction: string) => {
    switch (direction.toUpperCase()) {
      case 'F':
        return 'Go Forward';
      case 'B':
        return 'Go Back';
      case 'L':
        return 'Turn Left';
      case 'R':
        return 'Turn Right';
      default:
        return 'Continue';
    }
  };

  if (!currentLocation) {
    return (
      <div className="text-center py-12">
        <MapPin className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">No Current Location</h2>
        <p className="text-gray-600">Please scan a QR code first to set your current location</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl p-6 shadow-sm border">
        <div className="flex items-center space-x-4 mb-4">
          <div className="p-3 bg-green-100 rounded-lg">
            <MapPin className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Current Location</h2>
            <p className="text-gray-600">{currentLocation.name}</p>
          </div>
        </div>
      </div>

      {!navigationData ? (
        <div className="space-y-6">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Choose Your Destination</h3>
            <p className="text-gray-600">Select where you'd like to go</p>
          </div>

          <LocationSelector 
            onLocationSelect={setSelectedDestination}
            currentLocationId={currentLocation.id}
          />

          {selectedDestination && (
            <div className="bg-white rounded-xl p-6 shadow-sm border">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h4 className="font-semibold text-gray-900">Selected Destination</h4>
                  <p className="text-gray-600">{selectedDestination.name}</p>
                </div>
                <button
                  onClick={() => setSelectedDestination(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>

              <button
                onClick={handleStartNavigation}
                disabled={loading}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Navigation className="w-5 h-5" />
                    <span>Start Navigation</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-xl font-bold">Navigation Active</h3>
                <p className="opacity-90">From {currentLocation.name} to {selectedDestination?.name}</p>
              </div>
              <button
                onClick={() => onNavigationStart(null)}
                className="text-white hover:text-blue-200 text-lg font-bold"
              >
                ×
              </button>
            </div>
            
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <Footprints className="w-5 h-5" />
                <span className="font-medium">{navigationData.totalSteps} steps total</span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="w-5 h-5" />
                <span className="font-medium">{Math.ceil(navigationData.totalSteps / 2)} min</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
            <div className="bg-gray-50 px-6 py-4">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold text-gray-900">Step {currentStep + 1} of {navigationData.path.length}</h4>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
                    disabled={currentStep === 0}
                    className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setCurrentStep(Math.min(navigationData.path.length - 1, currentStep + 1))}
                    disabled={currentStep === navigationData.path.length - 1}
                    className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50"
                  >
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            <div className="p-6">
              {navigationData.path[currentStep] && (
                <div className="text-center">
                  <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <div className="text-blue-600">
                      {getDirectionIcon(navigationData.path[currentStep].direction)}
                    </div>
                  </div>
                  
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    {getDirectionText(navigationData.path[currentStep].direction)}
                  </h3>
                  
                  <p className="text-gray-600 mb-4">
                    Walk {navigationData.path[currentStep].distance} steps to reach{' '}
                    <span className="font-medium">{navigationData.path[currentStep].to}</span>
                  </p>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
                      <span>From: {navigationData.path[currentStep].from}</span>
                      <ArrowRight className="w-4 h-4" />
                      <span>To: {navigationData.path[currentStep].to}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border">
            <h4 className="font-semibold text-gray-900 mb-4">Complete Route</h4>
            <div className="space-y-3">
              {navigationData.path.map((step, index) => (
                <div
                  key={index}
                  className={`flex items-center space-x-4 p-3 rounded-lg transition-colors ${
                    index === currentStep ? 'bg-blue-50 border border-blue-200' : 'bg-gray-50'
                  }`}
                >
                  <div className={`p-2 rounded-lg ${
                    index === currentStep ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
                  }`}>
                    {getDirectionIcon(step.direction)}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">
                      {getDirectionText(step.direction)}
                    </p>
                    <p className="text-sm text-gray-600">
                      {step.distance} steps to {step.to}
                    </p>
                  </div>
                  {index === currentStep && (
                    <div className="text-blue-600 font-medium text-sm">Current</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NavigationView;