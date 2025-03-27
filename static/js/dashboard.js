document.addEventListener('DOMContentLoaded', function() {
    // Initialize map
    let map;
    let markers = {};
    let infoWindows = {};
    let currentLocationMarker;
    const socket = io();
    
    // Initialize map
    function initMap() {
        map = new google.maps.Map(document.getElementById("map"), {
            center: { lat: 0, lng: 0 },
            zoom: 12,
            mapTypeControl: false,
            streetViewControl: false,
            fullscreenControl: true
        });
        
        // Load initial data
        fetchInitialData();
        
        // Set up socket listeners
        setupSocketListeners();
        
        // Set up UI controls
        setupUIControls();
    }
    
    // Fetch initial ambulance and hospital data
    function fetchInitialData() {
        fetch('/api/ambulances')
            .then(response => response.json())
            .then(data => {
                data.forEach(ambulance => {
                    createAmbulanceMarker(ambulance);
                });
            });
        
        fetch('/api/hospitals')
            .then(response => response.json())
            .then(data => {
                data.forEach(hospital => {
                    createHospitalMarker(hospital);
                });
            });
    }
    
    // Create ambulance marker
    function createAmbulanceMarker(ambulance) {
        const marker = new google.maps.Marker({
            position: { lat: ambulance.lat, lng: ambulance.lng },
            map: map,
            icon: {
                url: ambulance.status === 'available' ? 
                    'http://maps.google.com/mapfiles/ms/icons/green-dot.png' :
                    'http://maps.google.com/mapfiles/ms/icons/red-dot.png',
                scaledSize: new google.maps.Size(32, 32)
            },
            title: `Ambulance ${ambulance.license_plate}`
        });
        
        const infoWindow = new google.maps.InfoWindow({
            content: `
                <div class="map-info-window">
                    <h6>Ambulance ${ambulance.license_plate}</h6>
                    <p>Status: <span class="badge ${ambulance.status === 'available' ? 'bg-success' : 'bg-danger'}">
                        ${ambulance.status}
                    </span></p>
                    <button class="btn btn-sm btn-primary dispatch-btn" 
                            data-ambulance-id="${ambulance.id}">
                        Dispatch
                    </button>
                </div>
            `
        });
        
        marker.addListener('click', () => {
            infoWindow.open(map, marker);
        });
        
        markers[ambulance.id] = { marker, infoWindow, data: ambulance };
        updateAmbulanceList();
    }
    
    // Create hospital marker
    function createHospitalMarker(hospital) {
        new google.maps.Marker({
            position: { lat: hospital.lat, lng: hospital.lng },
            map: map,
            icon: {
                url: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png',
                scaledSize: new google.maps.Size(32, 32)
            },
            title: hospital.name
        });
    }
    
    // Set up socket listeners
    function setupSocketListeners() {
        socket.on('location_update', function(data) {
            updateAmbulanceMarker(data);
        });
        
        socket.on('status_update', function(data) {
            updateAmbulanceStatus(data);
        });
        
        socket.on('new_dispatch', function(data) {
            showNewDispatchAlert(data);
        });
    }
    
    // Update ambulance marker position
    function updateAmbulanceMarker(data) {
        if (markers[data.id]) {
            markers[data.id].marker.setPosition({ lat: data.lat, lng: data.lng });
            markers[data.id].data = { ...markers[data.id].data, ...data };
            updateAmbulanceList();
        } else {
            createAmbulanceMarker(data);
        }
    }
    
    // Update ambulance status
    function updateAmbulanceStatus(data) {
        if (markers[data.id]) {
            markers[data.id].marker.setIcon({
                url: data.status === 'available' ? 
                    'http://maps.google.com/mapfiles/ms/icons/green-dot.png' :
                    'http://maps.google.com/mapfiles/ms/icons/red-dot.png',
                scaledSize: new google.maps.Size(32, 32)
            });
            markers[data.id].data.status = data.status;
            updateAmbulanceList();
        }
    }
    
    // Update ambulance list in sidebar
    function updateAmbulanceList() {
        const ambulanceList = document.getElementById('ambulanceList');
        ambulanceList.innerHTML = '';
        
        Object.values(markers).forEach(({ data }) => {
            const item = document.createElement('div');
            item.className = `list-group-item ambulance-list-item ${data.status === 'available' ? 'list-group-item-success' : 'list-group-item-danger'}`;
            item.innerHTML = `
                <div class="d-flex justify-content-between align-items-center">
                    <div>
                        <h6 class="mb-1">${data.license_plate}</h6>
                        <small>Status: <span class="badge ${data.status === 'available' ? 'bg-success' : 'bg-danger'}">${data.status}</span></small>
                    </div>
                    <div>
                        <small class="text-muted">${new Date().toLocaleTimeString()}</small>
                    </div>
                </div>
            `;
            ambulanceList.appendChild(item);
        });
    }
    
    // Set up UI controls
    function setupUIControls() {
        // Locate button
        document.getElementById('locate-btn').addEventListener('click', () => {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        const pos = {
                            lat: position.coords.latitude,
                            lng: position.coords.longitude
                        };
                        
                        if (currentLocationMarker) {
                            currentLocationMarker.setPosition(pos);
                        } else {
                            currentLocationMarker = new google.maps.Marker({
                                position: pos,
                                map: map,
                                icon: {
                                    url: 'http://maps.google.com/mapfiles/ms/icons/yellow-dot.png',
                                    scaledSize: new google.maps.Size(32, 32)
                                },
                                title: 'Your Location'
                            });
                        }
                        
                        map.setCenter(pos);
                    },
                    () => {
                        alert('Error: The Geolocation service failed.');
                    }
                );
            } else {
                alert('Error: Your browser doesn\'t support geolocation.');
            }
        });
        
        // Status buttons for drivers
        document.querySelectorAll('.status-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                document.querySelectorAll('.status-btn').forEach(b => b.classList.remove('active'));
                this.classList.add('active');
                
                const status = this.dataset.status;
                socket.emit('status_update', { status });
            });
        });
        
        // Dispatch form for dispatchers
        const dispatchForm = document.getElementById('dispatchForm');
        if (dispatchForm) {
            dispatchForm.addEventListener('submit', function(e) {
                e.preventDefault();
                
                const formData = {
                    location: document.getElementById('emergencyLocation').value,
                    priority: document.getElementById('priority').value
                };
                
                // In a real app, you would send this to your backend
                console.log('Dispatching:', formData);
                alert('Dispatch request sent!');
                this.reset();
            });
        }
    }
    
    // Initialize the map when Google Maps API is loaded
    window.initMap = initMap;
});