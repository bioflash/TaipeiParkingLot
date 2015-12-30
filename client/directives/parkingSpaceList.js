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
                                <td>{{park.name | limitStringLength:10}}</td>
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
                scope.parking.sortParkingLot()
            }

        }
    }
}