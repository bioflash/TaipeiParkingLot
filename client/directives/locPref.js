var $ = require('jquery')
export default function(map){
    
    return {
        restrict:'E',
        template:`<div style="margin:20px 10px">
                        <label for='address'>搜尋</label>
                        <input type="text" name='address' ng-model='parking.target.address' id='address' size=20>

                        <label for='radius'>附近的停車位, 搜尋半徑 (公里)</label>
                        <input type="text" name='radius' ng-model='parking.radius' id='radius' size=4>
                        <button id='submit'>Search</button>
                  </div>`,
        link: function(scope, element, attrs){     

            var addressInput = $('#address', element)[0]
            var searchBox = new google.maps.places.SearchBox(addressInput)

            map.addListener('bounds_changed', function() {
               searchBox.setBounds(map.getBounds());
             });

            scope.parking.searchForParkingLot()
            $('#submit',element[0]).on('click', ()=>{
                scope.parking.target.address = $('#address').val()
                scope.parking.searchForParkingLot()

                //Draw the area defined by user on the map
                if (scope.parking.circle) scope.parking.circle.setMap(null)

                scope.parking.circle = new google.maps.Circle({
                  map: map,
                  radius: scope.parking.radius*1000,    // draw in meters
                  fillColor: '#AA0000',
                  fillOpacity: 0.15,
                });
                scope.parking.circle.bindTo('center', scope.parking.target.marker, 'position');
            })


            
        }
    }
}


