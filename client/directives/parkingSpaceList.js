export default function(){
    return {
        template:`<div id='parkingList' style="margin:20px 10px">  
                    <table>
                        <thead>
                            <td>停車場</td>
                            <td>剩餘車位</td>
                        </thead>
                        <tbody>
                            <tr ng-repeat='park in parking.parkingLots'>
                                <td>{{park.name | limitStringLength:10}}</td>
                                <td>{{park.avail}}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>`,
        link: function(scope, ele, attr){
            
        }
    }
}