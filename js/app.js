var ViewModel = function() {
    var self = this;
    this.filterText = ko.observable('');
    this.map = null;
    this.markers = [];

    this.populateInfoWindow = function(marker, infowindow) {
        // Check to make sure the infowindow is
        // not already opened on this marker.
        if (infowindow.marker != marker) {
            infowindow.marker = marker;

            var loadingMessage = 'LOADING FROM FOURSQUARE';
            infowindow.setContent('<div>' + loadingMessage + '</div>');
            infowindow.open(this.map, marker);

            var REQUEST_SUFFIX = '?client_secret=4DNGUXLINKXF3BUPQFCFGAXFCIBE' +
                '1LPK0UMDAKOJVU5HJEW4&client_id=HNG5O2' +
                'XJN4KQFOSEHGBQPPI0KQCQDHV0GXY0GWU5ZVNW5YAK&v=20170419';
            requestURL = 'https://api.foursquare.com/v2/venues/';

            $.ajax({
                type: 'GET',
                url: requestURL + marker.fourSquareId + REQUEST_SUFFIX
            }).done(function(data) { 
                var venue = data.response.venue;
                var venueName = venue.name;
                var formattedAddress = venue.location.formattedAddress[0] || 'Address not available';
                var fourSquareURL = venue.shortUrl;
                var rating = venue.rating || 'Rating not available';

                var htmlBuilder = '';
                htmlBuilder += venueName + '<br>';
                htmlBuilder += 'Address: ' + formattedAddress + '<br>';
                htmlBuilder += '<a href = ' + fourSquareURL +
                    '> Link To Page' + '</a><br>';
                htmlBuilder +=  'Rating: ' + rating + '<br>';
                
                infowindow.setContent('<div>' + htmlBuilder + '</div>');

                infowindow.open(self.map, marker);
                infowindow.addListener('closeclick', function() {
                    infowindow.marker = null;
                });
            }).fail(function() {
                var failMessage = 'Failed to get info from Foursquare!';
                infowindow.setContent('<div>' + failMessage + '</div>');
            });
        }
    };

    this.populateAndAnimateMarker = function() {
        self.populateInfoWindow(this, self.largeInfowindow);
        this.setAnimation(google.maps.Animation.BOUNCE);
        setTimeout((function() {
            this.setAnimation(null);
        }).bind(this), 730);
    };

    this.initMap = function() {
        var self = this;
        // Constructor creates a new map - only center and zoom are required.
        this.map = new google.maps.Map(document.getElementById('map'), {
            center: {lat: 37.32219926307509, lng: -122.03122815574045},
            zoom: 14,
            mapTypeControl: false
        });

        var locations = TEA_PIN_LOCATIONS;

        this.largeInfowindow = new google.maps.InfoWindow();
        // The following group uses the location array
        // to create an array of markers on initialize.
        for (var i = 0; i < locations.length; i++) {
            // Get the position from the location array.
            var position = locations[i].location;
            var title = locations[i].title;
            var fourSquareId = locations[i].fourSquareId;
            // Create a marker per location, and put into markers array.
            var marker = new google.maps.Marker({
                position: position,
                title: title,
                animation: google.maps.Animation.DROP,
                id: i,
                fourSquareId: fourSquareId
            });
            marker.setMap(this.map);
            // Push the marker to our array of markers.
            this.markers.push(marker);
            // Create an onclick event to open an infowindow at each marker.
            marker.addListener('click', self.populateAndAnimateMarker);
        }
    };

    this.initMap();

    this.filteredShops = ko.computed(function() {
        var result = [];
        for (var i = 0; i < this.markers.length; i++) {
            var shop = this.markers[i];
            if (shop.title.toLowerCase().includes(this.filterText().toLowerCase())) {
                result.push(shop);
                this.markers[i].setVisible(true);
            } else {
                this.markers[i].setVisible(false);
            }
        }

        return result;
    }, this);
};

var init = function() {
    ko.applyBindings(new ViewModel());
};

var mapError = function() {
    console.log("map error");
    alert("Map error!");
};