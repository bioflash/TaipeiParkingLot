export default function(){
    return {
        template:`<div id='parkingList' style="margin:20px 10px">  
                    <table>
                        <thead>
                            <td><b>停車場</b></td>
                            <td><b><a href="#" ng-click="parking.setSortBy('avail')">剩餘車位</a></b></td>
                            <td><b><a href="#" ng-click="parking.setSortBy('distanceToTarget')">距離目標(公里)</a></b></td>
                        </thead>
                        <tbody>
                            <tr ng-repeat='park in parking.parkingLots'>
                                <td><a href="https://maps.google.com.tw/maps?daddr={{park.position.lat()+','+park.position.lng()}}">{{park.name | limitStringLength:10}}</a></td>
                                <td>{{park.avail}}</td>
                                <td>{{park.distanceToTarget}}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>`,
        link: function(scope, ele, attr){
            scope.parking.sortedBy = "distanceToTarget"

            scope.parking.setSortBy = function(sortedBy){
                scope.parking.sortedBy=sortedBy
                let direction = (sortedBy==='avail')?-1:1
                scope.parking.sortParkingLot(direction)
            }

        }
    }
}