class WayFloApp {
    constructor() {
        this.locations = [
            {"id": 1, "name": "main_gate"},
            {"id": 2, "name": "reception"},
            {"id": 3, "name": "office"},
            {"id": 13, "name": "lift_1"},
            {"id": 14, "name": "junction_5"},
            {"id": 15, "name": "library_stairs"},
            {"id": 16, "name": "gate_2"},
            {"id": 17, "name": "library"},
            {"id": 18, "name": "junction_4"},
            {"id": 21, "name": "lift_2"},
            {"id": 22, "name": "drawroom_stairs"},
            {"id": 19, "name": "ladies_washroom"},
            {"id": 20, "name": "gents_washroom"},
            {"id": 4, "name": "class_001"},
            {"id": 5, "name": "junction_1"},
            {"id": 6, "name": "class_002"},
            {"id": 7, "name": "class_003"},
            {"id": 8, "name": "junction_2"},
            {"id": 9, "name": "direct_stairs"},
            {"id": 10, "name": "bms_room"},
            {"id": 11, "name": "stationary"},
            {"id": 12, "name": "gate_1"},
            {"id": 23, "name": "lift_3"},
            {"id": 24, "name": "junction_3"},
            {"id": 25, "name": "cc_lab"},
            {"id": 26, "name": "parking_stairs"},
            {"id": 28, "name": "drawing_room"}
        ];
        
        this.html5QrCode = null;
        this.currentLocation = null;
        this.currentStepIndex = 0;
        this.currentRoute = [];
        this.isNavigating = false;
        this.init();
    }

    init() {
        this.populateDropdowns();
        this.bindEvents();
    }

    populateDropdowns() {
        const fromSelect = document.getElementById('fromLocation');
        const toSelect = document.getElementById('toLocation');
        const qrDestSelect = document.getElementById('qrDestination');

        this.locations.forEach(location => {
            const option1 = new Option(this.formatLocationName(location.name), location.id);
            const option2 = new Option(this.formatLocationName(location.name), location.id);
            const option3 = new Option(this.formatLocationName(location.name), location.id);
            
            fromSelect.add(option1);
            toSelect.add(option2);
            qrDestSelect.add(option3);
        });
    }

    formatLocationName(name) {
        return name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    }

    bindEvents() {
        // QR Code Scanner
        document.getElementById('startScan').addEventListener('click', () => this.openQRScanner());
        document.getElementById('closeQR').addEventListener('click', () => this.closeQRScanner());

        // Manual Navigation
        document.getElementById('manualNav').addEventListener('click', () => this.openManualNavigation());
        document.getElementById('closeManual').addEventListener('click', () => this.closeManualNavigation());
        document.getElementById('getDirections').addEventListener('click', () => this.getManualDirections());

        // Destination Modal (for QR)
        document.getElementById('closeDestination').addEventListener('click', () => this.closeDestinationModal());
        document.getElementById('getQRDirections').addEventListener('click', () => this.getQRDirections());

        // Clear route
        document.getElementById('clearRoute').addEventListener('click', () => this.clearRoute());

        // Enable/disable buttons based on selection
        document.getElementById('fromLocation').addEventListener('change', () => this.updateButtonStates());
        document.getElementById('toLocation').addEventListener('change', () => this.updateButtonStates());
        document.getElementById('qrDestination').addEventListener('change', () => this.updateQRButtonState());

        // Navigation controls
        document.getElementById('startNavigation').addEventListener('click', () => this.startNavigation());
        document.getElementById('prevStep').addEventListener('click', () => this.previousStep());
        document.getElementById('nextStep').addEventListener('click', () => this.nextStep());
        
        // QR scan from navigation page
        document.getElementById('scanQRFromNav').addEventListener('click', () => this.openQRScannerFromNav());
    }

    openQRScanner() {
        document.getElementById('qrModal').classList.remove('hidden');
        this.startQRScanner();
    }

    closeQRScanner() {
        document.getElementById('qrModal').classList.add('hidden');
        this.stopQRScanner();
    }

    openManualNavigation() {
        document.getElementById('manualModal').classList.remove('hidden');
    }

    closeManualNavigation() {
        document.getElementById('manualModal').classList.add('hidden');
    }

    openDestinationModal(currentLocationData) {
        this.currentLocation = currentLocationData;
        document.getElementById('currentLocationName').textContent = this.formatLocationName(currentLocationData.name);
        document.getElementById('destinationModal').classList.remove('hidden');
    }

    closeDestinationModal() {
        document.getElementById('destinationModal').classList.add('hidden');
    }

    async startQRScanner() {
        try {
            this.html5QrCode = new Html5Qrcode("qr-reader");
            
            const config = {
                fps: 10,
                qrbox: { width: 250, height: 250 },
                aspectRatio: 1.0
            };

            await this.html5QrCode.start(
                { facingMode: "environment" },
                config,
                (decodedText) => this.onQRScanSuccess(decodedText),
                (errorMessage) => {
                    // Ignore scan errors - they're frequent and normal
                }
            );
        } catch (err) {
            this.showError("Unable to start camera. Please ensure camera permissions are granted.");
        }
    }

    async stopQRScanner() {
        if (this.html5QrCode && this.html5QrCode.isScanning) {
            try {
                await this.html5QrCode.stop();
                this.html5QrCode = null;
            } catch (err) {
                console.error("Error stopping QR scanner:", err);
            }
        }
    }

    openQRScannerFromNav() {
        // Store current navigation state
        this.wasNavigating = this.isNavigating;
        this.previousStepIndex = this.currentStepIndex;
        
        // Reset QR result display
        document.getElementById('qr-result').classList.add('hidden');
        
        // Open QR scanner
        document.getElementById('qrModal').classList.remove('hidden');
        this.startQRScanner();
    }

    onQRScanSuccess(decodedText) {
        try {
            const qrData = JSON.parse(decodedText);
            
            if (qrData.id && qrData.name) {
                document.getElementById('qr-data').textContent = `Location: ${this.formatLocationName(qrData.name)}`;
                document.getElementById('qr-result').classList.remove('hidden');
                
                // Stop the scanner immediately after successful scan
                this.stopQRScanner();
                
                setTimeout(() => {
                    this.closeQRScanner();
                    // Check if we're coming from navigation page
                    if (this.wasNavigating !== undefined) {
                        this.handleNavQRScanResult(qrData);
                    } else {
                        this.openDestinationModal(qrData);
                    }
                }, 1500);
            } else {
                throw new Error("Invalid QR code format");
            }
        } catch (err) {
            this.showError("Invalid QR code. Please scan a valid location QR code.");
        }
    }

    handleNavQRScanResult(qrData) {
        // Check if scanned location is already in our current route
        const scannedLocationName = qrData.name;
        
        // Find if this location exists in current route (check both 'from' and 'to' positions)
        let routeStepIndex = this.currentRoute.findIndex(step => step.from === scannedLocationName);
        
        // Also check if it's the final destination
        if (routeStepIndex === -1 && this.currentRoute.length > 0) {
            const lastStep = this.currentRoute[this.currentRoute.length - 1];
            if (lastStep.to === scannedLocationName) {
                routeStepIndex = this.currentRoute.length - 1;
            }
        }
        
        if (routeStepIndex !== -1) {
            // Location found in current route - update navigation position
            this.currentStepIndex = routeStepIndex;
            this.isNavigating = true;
            
            // Update navigation display
            document.getElementById('startNavigation').classList.add('hidden');
            document.getElementById('navigationControls').classList.remove('hidden');
            
            this.updateNavigationDisplay();
            
            // Show success message instead of error
            this.showSuccessMessage(`Navigation updated! You are now at ${this.formatLocationName(scannedLocationName)}.`);
        } else {
            // Location not in current route - ask for new destination
            this.currentLocation = qrData;
            this.openDestinationModal(qrData);
        }
        
        // Reset navigation state flags
        this.wasNavigating = undefined;
        this.previousStepIndex = undefined;
    }

    async getManualDirections() {
        const fromId = document.getElementById('fromLocation').value;
        const toId = document.getElementById('toLocation').value;
        
        if (!fromId || !toId) {
            this.showError("Please select both current location and destination.");
            return;
        }

        if (fromId === toId) {
            this.showError("Current location and destination cannot be the same.");
            return;
        }

        this.closeManualNavigation();
        await this.fetchAndDisplayRoute(fromId, toId);
    }

    async getQRDirections() {
        const toId = document.getElementById('qrDestination').value;
        
        if (!toId || !this.currentLocation) {
            this.showError("Please select a destination.");
            return;
        }

        if (toId == this.currentLocation.id) {
            this.showError("You are already at the selected destination.");
            return;
        }

        this.closeDestinationModal();
        await this.fetchAndDisplayRoute(this.currentLocation.id, toId);
    }

    async fetchAndDisplayRoute(fromId, toId) {
        this.showLoading(true);
        this.hideError();

        try {
            const response = await fetch(`https://wayflo-1.onrender.com/route?id_from=${fromId}&id_to=${toId}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
                mode: 'cors'
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const routeData = await response.json();
            this.displayRoute(routeData, fromId, toId);
        } catch (err) {
            console.error('Fetch error:', err);
            if (err.message.includes('CORS') || err.message.includes('fetch')) {
                this.showError("CORS error: Please run the app through a local server or configure CORS on your API.");
            } else {
                this.showError("Unable to fetch route. Please check your connection and try again.");
            }
        } finally {
            this.showLoading(false);
        }
    }

    displayRoute(routeData, fromId, toId) {
        const fromLocation = this.locations.find(loc => loc.id == fromId);
        const toLocation = this.locations.find(loc => loc.id == toId);

        document.getElementById('routeFrom').textContent = this.formatLocationName(fromLocation.name);
        document.getElementById('routeTo').textContent = this.formatLocationName(toLocation.name);

        // Store route data for navigation
        this.currentRoute = routeData;
        this.currentStepIndex = 0;
        this.isNavigating = false;

        // Calculate total steps
        const totalSteps = routeData.reduce((sum, step) => sum + step.distance, 0);
        document.getElementById('totalSteps').textContent = `${totalSteps} total steps`;
        document.getElementById('routeSteps').textContent = `${routeData.length} steps`;

        const directionsContainer = document.getElementById('directions');
        directionsContainer.innerHTML = '';

        if (!routeData || routeData.length === 0) {
            directionsContainer.innerHTML = '<p class="text-gray-600">No route found between selected locations.</p>';
        } else {
            const directions = this.generateDirections(routeData);
            directionsContainer.innerHTML = directions;
        }

        // Show start navigation button, hide step controls
        document.getElementById('startNavigation').classList.remove('hidden');
        document.getElementById('navigationControls').classList.add('hidden');

        document.getElementById('navigationResults').classList.remove('hidden');
        document.getElementById('navigationResults').scrollIntoView({ behavior: 'smooth' });
    }

    generateDirections(routeData) {
        let directionsHTML = '<div class="mb-6"><h3 class="text-2xl font-bold text-gray-800 mb-4">Step-by-Step Directions</h3></div>';
        
        for (let i = 0; i < routeData.length; i++) {
            const step = routeData[i];
            const stepNumber = i + 1;
            const direction = this.getDirectionText(step.direction);
            const distance = step.distance;
            const directionColor = this.getDirectionColor(step.direction);
            const isActive = this.isNavigating && i === this.currentStepIndex;
            const isCompleted = this.isNavigating && i < this.currentStepIndex;
            
            let cardClass = 'bg-gradient-to-r from-white to-gray-50 border-gray-200';
            let stepNumberClass = 'bg-gradient-to-r from-blue-500 to-purple-600';
            
            if (isActive) {
                cardClass = 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-300 ring-2 ring-blue-200';
                stepNumberClass = 'bg-gradient-to-r from-blue-600 to-indigo-700';
            } else if (isCompleted) {
                cardClass = 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200';
                stepNumberClass = 'bg-gradient-to-r from-green-500 to-emerald-600';
            }
            
            directionsHTML += `
                <div id="step-${i}" class="flex items-start space-x-4 p-6 ${cardClass} rounded-2xl shadow-lg border-2 hover:shadow-xl transition-all duration-300 mb-4">
                    <div class="${stepNumberClass} text-white rounded-2xl w-12 h-12 flex items-center justify-center text-lg font-bold flex-shrink-0 shadow-lg">
                        ${isCompleted ? '<i class="fas fa-check"></i>' : stepNumber}
                    </div>
                    <div class="flex-1">
                        <p class="font-bold text-gray-800 text-lg mb-2">
                            Go ${direction} for ${distance} steps from ${this.formatLocationName(step.from)} to ${this.formatLocationName(step.to)}
                        </p>
                        <div class="flex items-center space-x-2 mb-1">
                            <span class="bg-${directionColor}-100 text-${directionColor}-800 px-3 py-1 rounded-full text-sm font-semibold">
                                Direction: ${direction.charAt(0).toUpperCase() + direction.slice(1)}
                            </span>
                            <span class="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm font-semibold">
                                Distance: ${distance} steps
                            </span>
                        </div>
                    </div>
                    ${isActive ? '<div class="text-4xl text-blue-500 animate-pulse flex-shrink-0">📍</div>' : ''}
                </div>
            `;
        }

        return directionsHTML;
    }

    startNavigation() {
        this.isNavigating = true;
        this.currentStepIndex = 0;
        
        // Hide start button, show navigation controls
        document.getElementById('startNavigation').classList.add('hidden');
        document.getElementById('navigationControls').classList.remove('hidden');
        
        // Refresh the directions display
        const directions = this.generateDirections(this.currentRoute);
        document.getElementById('directions').innerHTML = directions;
        
        this.updateNavigationControls();
        this.scrollToCurrentStep();
    }

    nextStep() {
        if (this.currentStepIndex < this.currentRoute.length - 1) {
            this.currentStepIndex++;
            this.updateNavigationDisplay();
        }
    }

    previousStep() {
        if (this.currentStepIndex > 0) {
            this.currentStepIndex--;
            this.updateNavigationDisplay();
        }
    }

    updateNavigationDisplay() {
        // Refresh the directions display
        const directions = this.generateDirections(this.currentRoute);
        document.getElementById('directions').innerHTML = directions;
        
        this.updateNavigationControls();
        this.scrollToCurrentStep();
    }

    updateNavigationControls() {
        const prevBtn = document.getElementById('prevStep');
        const nextBtn = document.getElementById('nextStep');
        
        prevBtn.disabled = this.currentStepIndex === 0;
        nextBtn.disabled = this.currentStepIndex === this.currentRoute.length - 1;
        
        // Update button text for last step
        if (this.currentStepIndex === this.currentRoute.length - 1) {
            nextBtn.innerHTML = '<i class="fas fa-flag-checkered mr-2"></i>Finish';
        } else {
            nextBtn.innerHTML = 'Next <i class="fas fa-arrow-right ml-2"></i>';
        }
    }

    scrollToCurrentStep() {
        const currentStepElement = document.getElementById(`step-${this.currentStepIndex}`);
        if (currentStepElement) {
            currentStepElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }

    updateButtonStates() {
        const fromLocation = document.getElementById('fromLocation').value;
        const toLocation = document.getElementById('toLocation').value;
        const getDirectionsBtn = document.getElementById('getDirections');
        
        if (getDirectionsBtn) {
            getDirectionsBtn.disabled = !fromLocation || !toLocation || fromLocation === toLocation;
        }
    }

    updateQRButtonState() {
        const destination = document.getElementById('qrDestination').value;
        const getQRDirectionsBtn = document.getElementById('getQRDirections');
        
        if (getQRDirectionsBtn) {
            getQRDirectionsBtn.disabled = !destination || (this.currentLocation && destination == this.currentLocation.id);
        }
    }

    getDirectionText(direction) {
        const directions = {
            'F': 'forward',
            'L': 'left',
            'R': 'right',
            'B': 'back'
        };
        return directions[direction] || direction;
    }

    getDirectionIcon(direction) {
        const icons = {
            'F': '↑',
            'L': '←',
            'R': '→',
            'B': '↓'
        };
        return icons[direction] || '→';
    }

    getDirectionColor(direction) {
        const colors = {
            'F': 'blue',
            'L': 'yellow',
            'R': 'purple',
            'B': 'red'
        };
        return colors[direction] || 'gray';
    }

    clearRoute() {
        document.getElementById('navigationResults').classList.add('hidden');
        // Reset navigation state
        this.isNavigating = false;
        this.currentStepIndex = 0;
        this.currentRoute = [];
        // Reset form values
        document.getElementById('fromLocation').value = '';
        document.getElementById('toLocation').value = '';
        document.getElementById('qrDestination').value = '';
        this.updateButtonStates();
        this.updateQRButtonState();
    }

    showLoading(show) {
        const loadingSpinner = document.getElementById('loadingSpinner');
        if (show) {
            loadingSpinner.classList.remove('hidden');
        } else {
            loadingSpinner.classList.add('hidden');
        }
    }

    showError(message) {
        document.getElementById('errorText').textContent = message;
        document.getElementById('errorMessage').classList.remove('hidden');
        
        // Auto-hide error after 5 seconds
        setTimeout(() => {
            this.hideError();
        }, 5000);
    }

    hideError() {
        document.getElementById('errorMessage').classList.add('hidden');
    }

    showSuccessMessage(message) {
        // Create a temporary success message element
        const successDiv = document.createElement('div');
        successDiv.className = 'fixed top-4 right-4 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-2xl p-4 shadow-lg z-50';
        successDiv.innerHTML = `
            <div class="flex items-center space-x-3">
                <div class="bg-green-500 p-2 rounded-lg">
                    <i class="fas fa-check text-white"></i>
                </div>
                <div>
                    <p class="text-green-800 font-semibold">Success!</p>
                    <p class="text-green-700">${message}</p>
                </div>
            </div>
        `;
        
        document.body.appendChild(successDiv);
        
        // Auto-remove after 3 seconds
        setTimeout(() => {
            if (successDiv.parentNode) {
                successDiv.parentNode.removeChild(successDiv);
            }
        }, 3000);
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new WayFloApp();
});
