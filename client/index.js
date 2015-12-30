import parkingController from './controllers/parkingController'
import locPrefDirective from './directives/locPref'
import googleMap from './utils/googleMap'
import taipeiParkingSvc from './services/taipeiParkingSvc'
import parkingSpaceList  from './directives/parkingSpaceList'
import limitStringLength from './filters/limitStringLength'
import notifyWhenNear from './directives/notifyWhenNear'
require('./css/w3.css')

googleMap.init((map)=>{
    var angular = require('angular');
    require('jquery');
    var myApp = angular.module('myModule',[])
    myApp.factory('map', function(){
        return map;
    })

    myApp.factory('taipeiParkingSvc', ['$http',taipeiParkingSvc])
    myApp.filter('limitStringLength', limitStringLength)
    myApp.controller('parkingController', ['$scope','map','taipeiParkingSvc','$interval',parkingController])
    myApp.directive('mapLocPref', ['map',locPrefDirective])
    myApp.directive('parkingSpaceList', parkingSpaceList)
    myApp.directive('notifyWhenNear', ['$interval',notifyWhenNear])

});
