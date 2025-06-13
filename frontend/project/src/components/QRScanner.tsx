import React, { useState, useRef } from 'react';
import { Camera, Upload, MapPin, AlertCircle } from 'lucide-react';

interface QRScannerProps {
  onLocationScanned: (location: any) => void;
}

const QRScanner: React.FC<QRScannerProps> = ({ onLocationScanned }) => {
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [manualInput, setManualInput] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleStartScanning = async () => {
    try {
      setError(null);
      setIsScanning(true);
      
      // In a real implementation, you would use the camera API here
      // For demo purposes, we'll simulate scanning
      setTimeout(() => {
        // Simulate successful scan - in reality, this would come from QR code content
        const mockLocation = {
          id: 1,
          name: "Main Entrance",
          type: "entrance"
        };
        
        setIsScanning(false);
        onLocationScanned(mockLocation);
      }, 3000);
      
    } catch (err) {
      setError('Camera access denied. Please allow camera permission or enter location manually.');
      setIsScanning(false);
    }
  };

  const handleManualInput = async () => {
    if (!manualInput.trim()) {
      setError('Please enter a location ID');
      return;
    }

    try {
      setError(null);
      const response = await fetch(`http://localhost:3001/api/location/${manualInput}`);
      
      if (!response.ok) {
        throw new Error('Location not found');
      }
      
      const location = await response.json();
      onLocationScanned(location);
    } catch (err) {
      setError('Location not found. Please check the ID and try again.');
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // In a real implementation, you would decode QR from image file
      // For demo purposes, we'll simulate this
      const mockLocation = {
        id: 2,
        name: "Reception",
        type: "office"
      };
      onLocationScanned(mockLocation);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Camera className="w-8 h-8 text-blue-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Scan QR Code</h2>
        <p className="text-gray-600">Point your camera at a QR code to identify your location</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-3">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
          <p className="text-red-700">{error}</p>
        </div>
      )}

      <div className="bg-white rounded-xl p-6 shadow-sm border">
        {!isScanning ? (
          <div className="space-y-4">
            <button
              onClick={handleStartScanning}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
            >
              <Camera className="w-5 h-5" />
              <span>Start Camera Scan</span>
            </button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Or</span>
              </div>
            </div>

            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-200 transition-colors flex items-center justify-center space-x-2"
            >
              <Upload className="w-5 h-5" />
              <span>Upload QR Image</span>
            </button>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="w-32 h-32 border-4 border-blue-600 border-dashed rounded-lg mx-auto mb-4 flex items-center justify-center">
              <div className="animate-pulse">
                <Camera className="w-12 h-12 text-blue-600" />
              </div>
            </div>
            <p className="text-gray-600 mb-4">Scanning for QR code...</p>
            <button
              onClick={() => setIsScanning(false)}
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Cancel
            </button>
          </div>
        )}
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm border">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Manual Entry</h3>
        <p className="text-gray-600 mb-4">Enter the location ID if you can't scan the QR code</p>
        <div className="flex space-x-3">
          <input
            type="text"
            value={manualInput}
            onChange={(e) => setManualInput(e.target.value)}
            placeholder="Enter location ID (e.g., 1, 2, 3...)"
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <button
            onClick={handleManualInput}
            className="bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center space-x-2"
          >
            <MapPin className="w-4 h-4" />
            <span>Go</span>
          </button>
        </div>
      </div>

      <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
        <h3 className="text-lg font-semibold text-blue-900 mb-2">Demo Locations</h3>
        <p className="text-blue-700 mb-4">For testing, try these location IDs:</p>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="text-blue-800"><strong>1:</strong> Main Entrance</div>
          <div className="text-blue-800"><strong>2:</strong> Reception</div>
          <div className="text-blue-800"><strong>3:</strong> Security Office</div>
          <div className="text-blue-800"><strong>4:</strong> Cafeteria</div>
          <div className="text-blue-800"><strong>5:</strong> Library</div>
          <div className="text-blue-800"><strong>7:</strong> Computer Lab 1</div>
        </div>
      </div>
    </div>
  );
};

export default QRScanner;