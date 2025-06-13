import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Edit2, 
  Trash2, 
  Save, 
  X, 
  MapPin, 
  Building, 
  Beaker, 
  BookOpen, 
  Coffee,
  Navigation,
  Download,
  Upload,
  BarChart3,
  Network,
  AlertCircle,
  CheckCircle
} from 'lucide-react';

interface Location {
  id: number;
  name: string;
  type: string;
  connections: Connection[];
}

interface Connection {
  to: number;
  distance: number;
  direction: string;
}

interface LocationFormData {
  name: string;
  type: string;
  connections: Connection[];
}

const AdminPanel: React.FC = () => {
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [editingLocation, setEditingLocation] = useState<Location | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [activeTab, setActiveTab] = useState<'list' | 'network' | 'stats'>('list');

  const locationTypes = ['entrance', 'office', 'lab', 'classroom', 'facility', 'junction'];
  const directions = ['F', 'B', 'L', 'R'];

  useEffect(() => {
    fetchLocations();
  }, []);

  useEffect(() => {
    if (success || error) {
      const timer = setTimeout(() => {
        setSuccess(null);
        setError(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [success, error]);

  const fetchLocations = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:3001/api/locations');
      if (!response.ok) throw new Error('Failed to fetch locations');
      
      // Get detailed location data including connections
      const locationIds = await response.json();
      const detailedLocations = await Promise.all(
        locationIds.map(async (loc: any) => {
          const detailResponse = await fetch(`http://localhost:3001/api/location/${loc.id}`);
          return detailResponse.json();
        })
      );
      
      setLocations(detailedLocations);
    } catch (err) {
      setError('Failed to fetch locations');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddLocation = async (formData: LocationFormData) => {
    try {
      const response = await fetch('http://localhost:3001/api/admin/location', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error('Failed to add location');
      
      await fetchLocations();
      setShowAddForm(false);
      setSuccess('Location added successfully');
    } catch (err) {
      setError('Failed to add location');
    }
  };

  const handleUpdateLocation = async (id: number, formData: LocationFormData) => {
    try {
      const response = await fetch(`http://localhost:3001/api/admin/location/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error('Failed to update location');
      
      await fetchLocations();
      setEditingLocation(null);
      setSuccess('Location updated successfully');
    } catch (err) {
      setError('Failed to update location');
    }
  };

  const handleDeleteLocation = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this location?')) return;

    try {
      const response = await fetch(`http://localhost:3001/api/admin/location/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete location');
      
      await fetchLocations();
      setSuccess('Location deleted successfully');
    } catch (err) {
      setError('Failed to delete location');
    }
  };

  const exportData = () => {
    const dataStr = JSON.stringify(locations, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = 'navigation-map.json';
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'entrance': return <MapPin className="w-5 h-5" />;
      case 'office': return <Building className="w-5 h-5" />;
      case 'lab': return <Beaker className="w-5 h-5" />;
      case 'classroom': return <BookOpen className="w-5 h-5" />;
      case 'facility': return <Coffee className="w-5 h-5" />;
      default: return <Navigation className="w-5 h-5" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'entrance': return 'text-blue-600 bg-blue-100';
      case 'office': return 'text-purple-600 bg-purple-100';
      case 'lab': return 'text-green-600 bg-green-100';
      case 'classroom': return 'text-orange-600 bg-orange-100';
      case 'facility': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStats = () => {
    const totalConnections = locations.reduce((sum, loc) => sum + loc.connections.length, 0);
    const typeStats = locationTypes.map(type => ({
      type,
      count: locations.filter(loc => loc.type === type).length
    }));

    return {
      totalLocations: locations.length,
      totalConnections,
      typeStats: typeStats.filter(stat => stat.count > 0)
    };
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-16 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-2">Admin Panel</h1>
            <p className="opacity-90">Manage locations and navigation paths</p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={exportData}
              className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
            >
              <Download className="w-4 h-4" />
              <span>Export</span>
            </button>
            <button
              onClick={() => setShowAddForm(true)}
              className="bg-white text-indigo-600 hover:bg-gray-50 px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Add Location</span>
            </button>
          </div>
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-3">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
          <p className="text-red-700">{error}</p>
          <button onClick={() => setError(null)} className="ml-auto text-red-500 hover:text-red-700">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center space-x-3">
          <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
          <p className="text-green-700">{success}</p>
          <button onClick={() => setSuccess(null)} className="ml-auto text-green-500 hover:text-green-700">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <div className="border-b">
          <div className="flex">
            {[
              { id: 'list', label: 'Locations', icon: MapPin },
              { id: 'network', label: 'Network Map', icon: Network },
              { id: 'stats', label: 'Statistics', icon: BarChart3 }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 px-6 py-4 font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="p-6">
          {activeTab === 'list' && (
            <LocationsList
              locations={locations}
              onEdit={setEditingLocation}
              onDelete={handleDeleteLocation}
              getTypeIcon={getTypeIcon}
              getTypeColor={getTypeColor}
            />
          )}

          {activeTab === 'network' && (
            <NetworkMap
              locations={locations}
              getTypeIcon={getTypeIcon}
              getTypeColor={getTypeColor}
            />
          )}

          {activeTab === 'stats' && (
            <Statistics
              stats={getStats()}
              getTypeIcon={getTypeIcon}
              getTypeColor={getTypeColor}
            />
          )}
        </div>
      </div>

      {/* Add Location Modal */}
      {showAddForm && (
        <LocationForm
          onSubmit={handleAddLocation}
          onCancel={() => setShowAddForm(false)}
          locations={locations}
          locationTypes={locationTypes}
          directions={directions}
        />
      )}

      {/* Edit Location Modal */}
      {editingLocation && (
        <LocationForm
          location={editingLocation}
          onSubmit={(data) => handleUpdateLocation(editingLocation.id, data)}
          onCancel={() => setEditingLocation(null)}
          locations={locations}
          locationTypes={locationTypes}
          directions={directions}
        />
      )}
    </div>
  );
};

// Locations List Component
const LocationsList: React.FC<{
  locations: Location[];
  onEdit: (location: Location) => void;
  onDelete: (id: number) => void;
  getTypeIcon: (type: string) => React.ReactElement;
  getTypeColor: (type: string) => string;
}> = ({ locations, onEdit, onDelete, getTypeIcon, getTypeColor }) => {
  return (
    <div className="space-y-4">
      {locations.length === 0 ? (
        <div className="text-center py-12">
          <MapPin className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No locations yet</h3>
          <p className="text-gray-600">Add your first location to get started</p>
        </div>
      ) : (
        locations.map((location) => (
          <div key={location.id} className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className={`p-2 rounded-lg ${getTypeColor(location.type)}`}>
                  {getTypeIcon(location.type)}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{location.name}</h3>
                  <p className="text-sm text-gray-600 capitalize">
                    {location.type} • {location.connections.length} connections
                  </p>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {location.connections.map((conn, idx) => (
                      <span key={idx} className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                        →{conn.to} ({conn.distance}m, {conn.direction})
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => onEdit(location)}
                  className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onDelete(location.id)}
                  className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

// Network Map Component
const NetworkMap: React.FC<{
  locations: Location[];
  getTypeIcon: (type: string) => React.ReactElement;
  getTypeColor: (type: string) => string;
}> = ({ locations, getTypeIcon, getTypeColor }) => {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Network Visualization</h3>
        <p className="text-gray-600">Visual representation of location connections</p>
      </div>
      
      <div className="bg-gray-50 rounded-xl p-8 min-h-96">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {locations.map((location) => (
            <div key={location.id} className="text-center">
              <div className={`p-4 rounded-xl ${getTypeColor(location.type)} mx-auto w-fit mb-2`}>
                {getTypeIcon(location.type)}
              </div>
              <h4 className="font-medium text-sm text-gray-900 mb-1">{location.name}</h4>
              <p className="text-xs text-gray-600">{location.connections.length} connections</p>
              <div className="mt-2 space-y-1">
                {location.connections.map((conn, idx) => (
                  <div key={idx} className="text-xs text-blue-600">
                    → Location {conn.to}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Statistics Component
const Statistics: React.FC<{
  stats: {
    totalLocations: number;
    totalConnections: number;
    typeStats: { type: string; count: number }[];
  };
  getTypeIcon: (type: string) => React.ReactElement;
  getTypeColor: (type: string) => string;
}> = ({ stats, getTypeIcon, getTypeColor }) => {
  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
          <div className="flex items-center space-x-3 mb-2">
            <MapPin className="w-6 h-6 text-blue-600" />
            <h3 className="text-lg font-semibold text-blue-900">Total Locations</h3>
          </div>
          <p className="text-3xl font-bold text-blue-600">{stats.totalLocations}</p>
        </div>
        
        <div className="bg-green-50 rounded-xl p-6 border border-green-200">
          <div className="flex items-center space-x-3 mb-2">
            <Network className="w-6 h-6 text-green-600" />
            <h3 className="text-lg font-semibold text-green-900">Total Connections</h3>
          </div>
          <p className="text-3xl font-bold text-green-600">{stats.totalConnections}</p>
        </div>
      </div>

      <div className="bg-white border rounded-xl p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Location Types</h3>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {stats.typeStats.map((stat) => (
            <div key={stat.type} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <div className={`p-2 rounded-lg ${getTypeColor(stat.type)}`}>
                {getTypeIcon(stat.type)}
              </div>
              <div>
                <p className="font-medium text-gray-900 capitalize">{stat.type}</p>
                <p className="text-sm text-gray-600">{stat.count} locations</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Location Form Component
const LocationForm: React.FC<{
  location?: Location;
  onSubmit: (data: LocationFormData) => void;
  onCancel: () => void;
  locations: Location[];
  locationTypes: string[];
  directions: string[];
}> = ({ location, onSubmit, onCancel, locations, locationTypes, directions }) => {
  const [formData, setFormData] = useState<LocationFormData>({
    name: location?.name || '',
    type: location?.type || locationTypes[0],
    connections: location?.connections || []
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const addConnection = () => {
    setFormData({
      ...formData,
      connections: [...formData.connections, { to: 0, distance: 0, direction: 'F' }]
    });
  };

  const updateConnection = (index: number, field: keyof Connection, value: any) => {
    const newConnections = [...formData.connections];
    newConnections[index] = { ...newConnections[index], [field]: value };
    setFormData({ ...formData, connections: newConnections });
  };

  const removeConnection = (index: number) => {
    setFormData({
      ...formData,
      connections: formData.connections.filter((_, i) => i !== index)
    });
  };

  const availableLocations = locations.filter(loc => loc.id !== location?.id);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">
              {location ? 'Edit Location' : 'Add New Location'}
            </h2>
            <button onClick={onCancel} className="text-gray-400 hover:text-gray-600">
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Location Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Location Type
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {locationTypes.map(type => (
                  <option key={type} value={type} className="capitalize">
                    {type}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-4">
              <label className="block text-sm font-medium text-gray-700">
                Connections
              </label>
              <button
                type="button"
                onClick={addConnection}
                className="bg-blue-600 text-white px-3 py-1 rounded-lg text-sm hover:bg-blue-700 transition-colors flex items-center space-x-1"
              >
                <Plus className="w-4 h-4" />
                <span>Add</span>
              </button>
            </div>

            <div className="space-y-3">
              {formData.connections.map((connection, index) => (
                <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <select
                    value={connection.to}
                    onChange={(e) => updateConnection(index, 'to', parseInt(e.target.value))}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  >
                    <option value={0}>Select destination</option>
                    {availableLocations.map(loc => (
                      <option key={loc.id} value={loc.id}>{loc.name}</option>
                    ))}
                  </select>

                  <input
                    type="number"
                    value={connection.distance}
                    onChange={(e) => updateConnection(index, 'distance', parseInt(e.target.value))}
                    placeholder="Distance"
                    className="w-20 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    min="1"
                  />

                  <select
                    value={connection.direction}
                    onChange={(e) => updateConnection(index, 'direction', e.target.value)}
                    className="w-16 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  >
                    {directions.map(dir => (
                      <option key={dir} value={dir}>{dir}</option>
                    ))}
                  </select>

                  <button
                    type="button"
                    onClick={() => removeConnection(index)}
                    className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-end space-x-3 pt-4 border-t">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg font-medium transition-colors flex items-center space-x-2"
            >
              <Save className="w-4 h-4" />
              <span>{location ? 'Update' : 'Create'} Location</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminPanel;