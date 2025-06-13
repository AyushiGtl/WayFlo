import React, { useState, useEffect } from 'react';
import { Search, MapPin, Clock, Building, Beaker, BookOpen, Coffee } from 'lucide-react';

interface Location {
  id: number;
  name: string;
  type: string;
}

interface LocationSelectorProps {
  onLocationSelect: (location: Location) => void;
  currentLocationId?: number;
}

const LocationSelector: React.FC<LocationSelectorProps> = ({ onLocationSelect, currentLocationId }) => {
  const [locations, setLocations] = useState<Location[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLocations();
  }, []);

  const fetchLocations = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/locations');
      const data = await response.json();
      setLocations(data);
    } catch (error) {
      console.error('Failed to fetch locations:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'entrance':
        return <MapPin className="w-5 h-5" />;
      case 'office':
        return <Building className="w-5 h-5" />;
      case 'lab':
        return <Beaker className="w-5 h-5" />;
      case 'classroom':
        return <BookOpen className="w-5 h-5" />;
      case 'facility':
        return <Coffee className="w-5 h-5" />;
      default:
        return <MapPin className="w-5 h-5" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'entrance':
        return 'text-blue-600 bg-blue-100';
      case 'office':
        return 'text-purple-600 bg-purple-100';
      case 'lab':
        return 'text-green-600 bg-green-100';
      case 'classroom':
        return 'text-orange-600 bg-orange-100';
      case 'facility':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const filteredLocations = locations.filter(location => {
    const matchesSearch = location.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === 'all' || location.type === selectedType;
    const notCurrentLocation = location.id !== currentLocationId;
    
    return matchesSearch && matchesType && notCurrentLocation;
  });

  const locationTypes = ['all', ...new Set(locations.map(loc => loc.type))];

  if (loading) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-sm border">
        <div className="animate-pulse space-y-4">
          <div className="h-10 bg-gray-200 rounded-lg"></div>
          <div className="space-y-3">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-16 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-xl p-4 shadow-sm border">
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search destinations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div className="flex space-x-2 overflow-x-auto pb-2">
          {locationTypes.map(type => (
            <button
              key={type}
              onClick={() => setSelectedType(type)}
              className={`px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                selectedType === type
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        {filteredLocations.length === 0 ? (
          <div className="bg-white rounded-xl p-8 shadow-sm border text-center">
            <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-500">No destinations found</p>
          </div>
        ) : (
          filteredLocations.map((location) => (
            <div
              key={location.id}
              onClick={() => onLocationSelect(location)}
              className="bg-white rounded-xl p-4 shadow-sm border hover:shadow-md hover:border-blue-200 transition-all cursor-pointer"
            >
              <div className="flex items-center space-x-4">
                <div className={`p-2 rounded-lg ${getTypeColor(location.type)}`}>
                  {getTypeIcon(location.type)}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{location.name}</h3>
                  <p className="text-sm text-gray-500 capitalize">{location.type}</p>
                </div>
                <div className="text-blue-600">
                  <MapPin className="w-5 h-5" />
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default LocationSelector;