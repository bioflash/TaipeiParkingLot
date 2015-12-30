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
            scope.parking.searchForParkingLot()

            $('#submit',element[0]).on('click', ()=>{
                scope.parking.searchForParkingLot()
            })
        }
    }
}

