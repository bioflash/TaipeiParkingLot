
export default {
    init: function(afterInit){
        window.initMap = function(){            
            var map = new google.maps.Map(document.getElementById('map'), {
            zoom: 16
            });
            afterInit(map)
        }
        var googleMapScript = document.createElement('script');
        googleMapScript.innerHTML = ""
        googleMapScript.setAttribute('async', '');
        googleMapScript.setAttribute('defer', '');
        googleMapScript.setAttribute('src', "https://maps.googleapis.com/maps/api/js?key="+GOOGLE_API_KEY+"&callback=initMap");
        document.getElementsByTagName('BODY')[0].appendChild(googleMapScript);
    }
}


export function geocodeAddress(address, geocoder, resultsMap, callback) {
  geocoder.geocode({'address': address}, function(results, status) {
    if (status === google.maps.GeocoderStatus.OK) {

      //resultsMap.setCenter(results[0].geometry.location);
      /*var marker = new google.maps.Marker({
        map: resultsMap,
        position: results[0].geometry.location,
        icon: icon
      });*/
      //markers.push(marker)
      if (typeof callback === 'function'){
        callback(results[0].geometry.location)
      }
    } else {
      alert('Geocode was not successful for the following reason: ' + status);
    }
  });
}

export function setCenter(map,geoLocation){
    map.setCenter(geoLocation);
}
export function createMarker(map, geoLocation, icon, title){
    return new google.maps.Marker({
        map: map,
        position: geoLocation,
        icon: icon,
        title: title
    })
}