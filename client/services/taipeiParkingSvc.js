export default function($http){

    return {
        query: function(latitude,longitude,limit){
            return $http({
                method:'GET',
                url:'./api/available',
                params:{latitude:latitude, longitude: longitude, limit: limit}
            })
        }
    }
}