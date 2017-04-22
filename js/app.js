// First array of locations of coffee houses around Arizona State University
// Title = Name of Coffee House
// lat = Latitude
// lng = Longitude
// fsid = FourSquare Id = This is to pull info from Foursquare app to lis on map like rating and picture.
var coffeelocations = [
    {
        title: "Press Coffee",
        lat: 33.429729,
        lng: -111.948028,
        fsid: "5558b87c498e46459156137c"
    },
    {
        title: "Cartel Coffee",
        lat: 33.421714,
        lng: -111.942997,
        fsid: "4a3815d1f964a520b29e1fe3"
    },
    {
        title: "Starbucks",
        lat: 33.425846,
        lng: -111.940331,
        fsid: "47e939edf964a5205a4e1fe3"
    },
    {
        title: "King Coffee",
        lat: 33.418509,
        lng: -111.940260,
        fsid: "5529a631498ed037d5b5472c"
    },
    {
        title: "Romancing the Bean",
        lat: 33.431389,
        lng: -111.938489,
        fsid: "4a8d6d4cf964a5209c0f20e3"
    },
    {
        title: "Royal Coffee Bar",
        lat: 33.425165,
        lng: -111.935275,
        fsid: "5342ca9a498e6256f41a48cf"
    },
    {
        title: "The Blend Teahouse",
        lat: 33.424613,
        lng: -111.934786,
        fsid: "530e8cea498e44d529b6151d"
    },
    {
        title: "Cupz",
        lat: 33.422797,
        lng: -111.934567,
        fsid: "4a738200f964a520a3dc1fe3"
    },
    {
        title: "Starbucks",
        lat: 33.418152,
        lng: -111.934719,
        fsid: "540f5562498eda0a5c68c001"
    },
    {
        title: "Starbucks",
        lat: 33.422657,
        lng: -111.932194,
        fsid: "4e4a8b7c1f6e2d88d8baa86b"
    },
    {
        title: "Starbucks",
        lat: 33.417948,
        lng: -111.931935,
        fsid: "4b5dc737f964a520226b29e3"
    },
    {
        title: "Dutch Bros",
        lat: 33.416968,
        lng: -111.926014,
        fsid: "4b3e216bf964a520b09825e3"
    },
    {
        title: "D'Lite Healthy On The Go",
        lat: 33.414426,
        lng: -111.920737,
        fsid: "4f83d911e4b03e850b6671a2"
    }
];

// Here we Initialize Google maps. Center represents the area that the map looks at first.

var map;

function initializeGMap() {
    "use strict";
    map = new google.maps.Map(document.getElementById('map'), {
        center: {
            lat: 33.423259, 
            lng: -111.936728},
        zoom: 15,
        disableDefaultUI: true
    });

    // We want to start our ViewModel but not before Google Maps

    ko.applyBindings(new ViewModel());
}

// error handling

// This function below is not working for some reason.

function gMapError() {
    var mapSection = document.getElementById('map');
    var sorryHTML = '<h3>Oh no! Google Maps is not loading. Please check your internet connection.</h3>';
    mapSection.innerHTML = sorryHTML;
}


// This is the constructor
// Credit https://discussions.udacity.com/t/having-trouble-accessing-data-outside-an-ajax-request/39072/10

var coffeelocation = function (data) {
    "use strict"; //use strict funtion is awesome! This is because it helps prevent certain actions from being taken while throwing more exceptions
    this.title = ko.observable(data.title);
    this.lat = ko.observable(data.lat);
    this.lng = ko.observable(data.lng);
    this.fsid = ko.observable(data.fsid);
    this.marker = ko.observable();
    this.address = ko.observable('');
    this.rating = ko.observable('');
    this.photoPrefix = ko.observable('');
    this.photoSuffix = ko.observable('');
    this.contentString = ko.observable('');
};

// Code for the ViewModel

var ViewModel = function () {
    "use strict";
    // Make this available
    var self = this;

    // Here we create an array of all coffee houses
    this.coffeeList = ko.observableArray([]);

    // Call the constructor
    // Create coffee house objects for each item in coffeelocations & store them in the array above
    coffeelocations.forEach(function (coffeeItem) {
        self.coffeeList.push(new coffeelocation(coffeeItem));
    });

    // Then we initialize the infowindow
    var infowindow = new google.maps.InfoWindow({
        maxWidth: 200,
    });

    // After we make a marker variable
    var marker;

    // For each coffee house we then make a marker. This is to call data from FourSquare for our info windows
    self.coffeeList().forEach(function (coffeeItem) {
    	// Here we define markers for each coffee house
    	marker = new google.maps.Marker({
            position: new google.maps.LatLng(coffeeItem.lat(), coffeeItem.lng()),
            map: map,
            animation: google.maps.Animation.DROP
        });
        coffeeItem.marker = marker;

        // Then we make an AJAX request to Foursquare
        $.ajax({
            url: 'https://api.foursquare.com/v2/venues/' + coffeeItem.fsid() +
            '?client_id=RBEBEA24PTYL2BA24BRKJ1FWSLJ2ZAKEMXL50RXPGSLIB2BN&client_secret=RK02AGWPV3TYRWUSH3JZ54AVGTM43NPGGP3ICJYZIKQDJZKC&v=20130815',
            dataType: "json",
            success: function (data) {
                //  This makes request easier to handle
                var result = data.response.venue;

                // We check if he data exist on Foursquare and then add it to the info window. 

                var location = result.hasOwnProperty('location') ? result.location : '';
                if (location.hasOwnProperty('address')) {
                    coffeeItem.address(location.address || '');
                }

                //https://developer.foursquare.com/docs/responses/photo
                //prefix is for the start of the photo url
                //suffix is for the end of the photo url

                var bestPhoto = result.hasOwnProperty('bestPhoto') ? result.bestPhoto : '';
                if (bestPhoto.hasOwnProperty('prefix')) {
                    coffeeItem.photoPrefix(bestPhoto.prefix || '');
                }

                if (bestPhoto.hasOwnProperty('suffix')) {
                    coffeeItem.photoSuffix(bestPhoto.suffix || '');
                }

                //pulls rating data from FourSquare

                var rating = result.hasOwnProperty('rating') ? result.rating : '';
                coffeeItem.rating(rating || 'none');

                // This is all of the content for each infowindow

                var contentString = '<div id="iWindow"><h4>' + coffeeItem.title() + '</h4><div id="pic"><img src="' +
                        coffeeItem.photoPrefix() + '180x100' + coffeeItem.photoSuffix() +
                        '" alt="Image Location"></div><hr><p>' + coffeeItem.address() + 
                        '</p><img style="width: 30px" src="img/fscolor.png"><p>Rating: ' + coffeeItem.rating() +
                        '</p>';

                // Click responsiveness for each marker

                google.maps.event.addListener(coffeeItem.marker, 'click', function () {
                    infowindow.open(map, this);

                    // Bounce Animation for each marker

                    coffeeItem.marker.setAnimation(google.maps.Animation.BOUNCE);
                    setTimeout(function () {
                        coffeeItem.marker.setAnimation(null);
                    }, 500);
                    infowindow.setContent(contentString);
                    map.setCenter(coffeeItem.marker.getPosition());
                });
            },
            // Alert the user if there is an error. Here we will set the message in the coffee house menu. 
            error: function (e) {
                document.getElementById("house-view").innerHTML = "<h4>Whoops! Looks like Foursquare is just not working. Try again later.</h4>";
            }
        });

        // This event listener makes the error message on AJAX error display in the infowindow
        google.maps.event.addListener(marker, 'click', function () {
            infowindow.open(map, this);
            coffeeItem.marker.setAnimation(google.maps.Animation.BOUNCE);
            setTimeout(function () {
                coffeeItem.marker.setAnimation(null);
            }, 500);
        });
    });

    // This will open the correct info window when the user clicks the marker
    self.showInfo = function (coffeeItem) {
        google.maps.event.trigger(coffeeItem.marker, 'click');
        self.hideElements();
    };

    // This is for toggling the info window
    self.toggleNav = ko.observable(false);
    this.navStatus = ko.pureComputed (function () {
        return self.toggleNav() === false ? 'nav' : 'navClosed';
        }, this);

    self.hideElements = function (toggleNav) {
        self.toggleNav(true);
        // Allow default action
        // Credit Stacy https://discussions.udacity.com/t/click-binding-blocking-marker-clicks/35398/2
        return true;
    };

    self.showElements = function (toggleNav) {
        self.toggleNav(false);
        return true;
    };

    //This shows our markers based on the search
    self.visible = ko.observableArray();

    //This shows all of the markers before a search is made
    self.coffeeList().forEach(function (coffee) {
        self.visible.push(coffee);
    });

    //Here the input of the user is made. 
    self.userInput = ko.observable('');

    //Depending on user input, if the coffee house name exists the marker will be shown, if not then it will be hidden
    self.filterMarkers = function () {
        // First all of our markers will be hidden.
        var searchInput = self.userInput().toLowerCase();
        self.visible.removeAll();
        self.coffeeList().forEach(function (coffee) {
            coffee.marker.setVisible(false);
            //Once we compare the name to the user input. All matching coffee houses will be shown
            if (coffee.title().toLowerCase().indexOf(searchInput) !== -1) {
                self.visible.push(coffee);
            }
        });
        self.visible().forEach(function (coffee) {
            coffee.marker.setVisible(true);
        });
    };

}; // End of ViewModel



