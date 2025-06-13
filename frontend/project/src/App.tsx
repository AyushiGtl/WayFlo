import React, { useState } from 'react';
import { MapPin, QrCode, Navigation, Settings, Home } from 'lucide-react';
import QRScanner from './components/QRScanner';
import LocationSelector from './components/LocationSelector';
import NavigationView from './components/NavigationView';
import AdminPanel from './components/AdminPanel';

type View = 'home' | 'scan' | 'navigate' | 'admin';

function App() {
  const [currentView, setCurrentView] = useState<View>('home');
  const [currentLocation, setCurrentLocation] = useState<any>(null);
  const [navigationData, setNavigationData] = useState<any>(null);

  const handleLocationScanned = (location: any) => {
    setCurrentLocation(location);
    setCurrentView('navigate');
  };

  const handleNavigationStart = (data: any) => {
    setNavigationData(data);
  };

  const renderView = () => {
    switch (currentView) {
      case 'scan':
        return <QRScanner onLocationScanned={handleLocationScanned} />;
      case 'navigate':
        return (
          <NavigationView
            currentLocation={currentLocation}
            navigationData={navigationData}
            onNavigationStart={handleNavigationStart}
          />
        );
      case 'admin':
        return <AdminPanel />;
      default:
        return <HomeView onViewChange={setCurrentView} />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-600 rounded-lg">
                <MapPin className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Campus Navigator</h1>
                <p className="text-sm text-gray-500">QR-Based Indoor Navigation</p>
              </div>
            </div>
            <button
              onClick={() => setCurrentView('home')}
              className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            >
              <Home className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6">
        {renderView()}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex justify-around py-3">
            <button
              onClick={() => setCurrentView('home')}
              className={`flex flex-col items-center space-y-1 px-4 py-2 rounded-lg transition-colors ${
                currentView === 'home' ? 'text-blue-600 bg-blue-50' : 'text-gray-600 hover:text-blue-600'
              }`}
            >
              <Home className="w-5 h-5" />
              <span className="text-xs font-medium">Home</span>
            </button>
            <button
              onClick={() => setCurrentView('scan')}
              className={`flex flex-col items-center space-y-1 px-4 py-2 rounded-lg transition-colors ${
                currentView === 'scan' ? 'text-blue-600 bg-blue-50' : 'text-gray-600 hover:text-blue-600'
              }`}
            >
              <QrCode className="w-5 h-5" />
              <span className="text-xs font-medium">Scan</span>
            </button>
            <button
              onClick={() => setCurrentView('navigate')}
              className={`flex flex-col items-center space-y-1 px-4 py-2 rounded-lg transition-colors ${
                currentView === 'navigate' ? 'text-blue-600 bg-blue-50' : 'text-gray-600 hover:text-blue-600'
              }`}
            >
              <Navigation className="w-5 h-5" />
              <span className="text-xs font-medium">Navigate</span>
            </button>
            <button
              onClick={() => setCurrentView('admin')}
              className={`flex flex-col items-center space-y-1 px-4 py-2 rounded-lg transition-colors ${
                currentView === 'admin' ? 'text-blue-600 bg-blue-50' : 'text-gray-600 hover:text-blue-600'
              }`}
            >
              <Settings className="w-5 h-5" />
              <span className="text-xs font-medium">Admin</span>
            </button>
          </div>
        </div>
      </nav>
    </div>
  );
}

function HomeView({ onViewChange }: { onViewChange: (view: View) => void }) {
  return (
    <div className="space-y-8">
      <div className="text-center">
        <div className="w-24 h-24 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <MapPin className="w-12 h-12 text-white" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Welcome to Campus Navigator</h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Navigate through your college campus with ease using QR codes placed at key locations. 
          Simply scan a QR code to get started!
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div
          onClick={() => onViewChange('scan')}
          className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow cursor-pointer border hover:border-blue-200"
        >
          <div className="flex items-center space-x-4 mb-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <QrCode className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900">Scan QR Code</h3>
          </div>
          <p className="text-gray-600">
            Scan a QR code at your current location to start navigation
          </p>
        </div>

        <div
          onClick={() => onViewChange('navigate')}
          className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow cursor-pointer border hover:border-green-200"
        >
          <div className="flex items-center space-x-4 mb-4">
            <div className="p-3 bg-green-100 rounded-lg">
              <Navigation className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900">Navigate</h3>
          </div>
          <p className="text-gray-600">
            Get step-by-step directions to any location on campus
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm border">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">How It Works</h3>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-blue-600 font-bold">1</span>
            </div>
            <h4 className="font-medium text-gray-900 mb-2">Scan QR Code</h4>
            <p className="text-sm text-gray-600">Find and scan a QR code at your current location</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-green-600 font-bold">2</span>
            </div>
            <h4 className="font-medium text-gray-900 mb-2">Choose Destination</h4>
            <p className="text-sm text-gray-600">Select where you want to go from the available locations</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-orange-600 font-bold">3</span>
            </div>
            <h4 className="font-medium text-gray-900 mb-2">Follow Directions</h4>
            <p className="text-sm text-gray-600">Get step-by-step navigation with distances and turns</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;