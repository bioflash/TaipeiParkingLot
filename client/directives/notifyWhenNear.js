var geolib = require('geolib');
var $ = require('jquery');
//const INTERVAL_TO_REFRESH_CURRENT_LOCATION = 10000
const DEFAULT_DISTANCE = 1
export default function($interval){
    return {
        templateUrl: '../templates/notifyWhenNear.html',
        scope:{
                target:"=",
                parking:"=",
                notify:"&invoke",
                cancel:"&cancel"                
            },
        link: function(scope, element, attr){
            scope.distance=DEFAULT_DISTANCE
            scope.mute = true
            
            scope.toggleSpeak = function(){
                if (scope.mute) {
                    scope.mute=false
                }else{
                    scope.mute=true
                    scope.cancel()
                }
            }

            //Check my current location when parking space info is refreshed
            scope.$watch('parking.parkingInfoRefresh', function(){
                let withInDistance = false;
                _updateCurrentLocation(scope).then(
                    ()=>{
                        if (scope.target.coord){
                            withInDistance = geolib.isPointInCircle({latitude: scope.target.coord.latitude, longitude:scope.target.coord.longitude}, {latitude:scope.currentLocation.latitude, longitude:scope.currentLocation.longitude}, Number(scope.distance)*1000)                                
                        }

                        if (withInDistance && !scope.mute){
                            scope.notify()
                        }
                    }
                );
            })    
        }
    }
}


function _updateCurrentLocation(scope){
    //Get current GPS location
    if (navigator.geolocation){
        return new Promise((resolve, reject)=>{
            navigator.geolocation.getCurrentPosition((pos)=>{
                scope.currentLocation = {latitude:pos.coords.latitude,longitude: pos.coords.longitude}
                resolve()
            })
        })
        
    }else{
        alert('您的瀏覽器不支援存取您的所在位置')
    }
}