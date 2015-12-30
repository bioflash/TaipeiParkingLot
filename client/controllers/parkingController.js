var icon = require('../images/human.gif')
var geolib = require('geolib')

import {geocodeAddress, createMarker, setCenter} from '../utils/googleMap'
const REFRESH_TIME_FRAME = 20000
export default function($scope, map,taipeiParkingSvc,$interval){
    $scope.parking = {}
    $scope.parking.radius = 1
    $scope.parking.target = {address:'南港展覽館', coord:undefined, marker:undefined, removeFromMap: function(){if (this.marker) this.marker.setMap(null)}}
    $scope.parking.parkingLots = []
    $scope.parking.geocoder = new google.maps.Geocoder()
    $scope.parking.parkingInfoRefresh = 0
    let isSpeaking = false //used to defer speaking parkinglot info while it is speaking now
    let mute = false //used to remember whether to mute the speaking

    $scope.parking.searchForParkingLot = function(){
        $scope.parking.target.removeFromMap();

        geocodeAddress($scope.parking.target.address, $scope.parking.geocoder, map, (geoLocation)=>{
            setCenter(map, geoLocation);
            $scope.parking.target.marker = createMarker(map, geoLocation, icon);
            $scope.parking.target.coord = {latitude: geoLocation.lat(), longitude: geoLocation.lng()}        
            $scope.parking.refreshParkingInfo(geoLocation.lat(), geoLocation.lng(), $scope.parking.radius)
        })            
    }


    $scope.parking.refreshParkingInfo = function(latitude, longitude, radius){
        $scope.parking.clearParkingPositions()
        taipeiParkingSvc.query(latitude, longitude, radius*1000).then(
                (response)=>{
                    if (response.status==200){
                        response.data.avails.forEach((park)=>{
                            let marker = createMarker(map, {lat:Number(park.latitude), lng: Number(park.longitude)},undefined,park.name)
                            marker.name = park.name
                            marker.avail = park.availablecar
                            marker.fareInfo = park.FareInfo

                            let infoWindow = new google.maps.InfoWindow({
                                content: marker.name
                            })
                            marker.addListener('click', function(){
                                infoWindow.open(map, marker)    
                            })
                            marker.distanceToTarget = geolib.getDistance({latitude: Number(park.latitude), longitude:Number(park.longitude)}, {latitude:latitude, longitude:longitude})/1000
                            $scope.parking.parkingLots.push(marker)

                        })
                        let direction = ($scope.parking.sortedBy==='avail')?-1:1
                        $scope.parking.sortParkingLot(direction)
                        $scope.parking.parkingInfoRefresh++
                    }else{
                        throw new Error("Unable to query parking lot info")
                    }
                }
            )
    }
    $scope.parking.speakParkingInfo = function(){
        if (!isSpeaking){
            isSpeaking = true;
            mute=false

            var invocations = $scope.parking.parkingLots.map((mark,index, arr)=>{
                if (index<arr.length-1){
                    return function(){
                            if(!mute)
                            _speak(mark.name,mark.avail, invocations[index+1])
                        }
                }else{
                    return function(){
                            if(!mute)
                            _speak(mark.name,mark.avail, function(){isSpeaking=false})
                        }
                }
            });  
            invocations[0]();  
        }
    }

    $scope.parking.sortParkingLot = function(direction=1){
        if(typeof direction!=='number') throw new Error("direction needs to be number")
        $scope.parking.parkingLots = $scope.parking.parkingLots.sort((a,b)=>{
                            return direction* ((Number(a[$scope.parking.sortedBy])<Number(b[$scope.parking.sortedBy]))?-1:(Number(a[$scope.parking.sortedBy])==Number(b[$scope.parking.sortedBy]))?0:1)
                        })
    }
    $scope.parking.stopSpeakParkingInfo = function(){
        mute = true
        isSpeaking=false
    }
    function _speak(parkingLotName,avail, next){
        var su = new SpeechSynthesisUtterance();
        su.lang = "zh-TW";
        su.text = parkingLotName+"有"+avail+"個車位";
        su.onend = next
        window.speechSynthesis.speak(su);

        //responsiveVoice.speak(,"Chinese Female",{onend:next})
    }
    $scope.parking.clearParkingPositions = function(){
        $scope.parking.parkingLots.forEach((mark)=>mark.setMap(null));
        $scope.parking.parkingLots = [];
    }

    $interval(()=>{
        $scope.parking.refreshParkingInfo($scope.parking.target.coord.latitude, $scope.parking.target.coord.longitude, $scope.parking.radius)
    },REFRESH_TIME_FRAME)

}
