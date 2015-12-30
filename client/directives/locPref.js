var $ = require('jquery')
export default function(map){
    
    return {
        restrict:'E',
        templateUrl:'../templates/locPref.html',
        link: function(scope, element, attrs){
            //var geocoder = new google.maps.Geocoder()
            
            scope.parking.searchForParkingLot()
            /*geocodeAddress(scope.parking.address, geocoder, map, (geoLocation)=>{
                setCenter(map,geoLocation);
                scope.parking.markers.push(createMarker(map, geoLocation, icon));
            })*/

            $('#submit',element[0]).on('click', ()=>{
                scope.parking.searchForParkingLot()
            })
        }
    }
}

