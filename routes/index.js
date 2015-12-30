var map = require('../lib/map');
var geolib = require('geolib');
var request = require('request');
var parkingData = require('../lib/parkingData')

exports = module.exports  ={
    getAdressWithinRange: function(req, res, next){
        let {latitude,longitude,limit} = req.query;

        res.json(req.map.filter((pos)=>{
            return filterWithinLimit(pos, latitude, longitude, limit);
        }));
    },

    availableParkingLots: function(req, res, next){
        let {latitude, longitude, limit} = req.query
        let avails = parkingData.getRealtimeParkingData().avails.filter((pos)=>{
            return filterWithinLimit(pos, latitude, longitude, limit)
        })
        res.json({updateTime:parkingData.getRealtimeParkingData().updateTime, avails:avails})
    }
}

function filterWithinLimit(pos, latitude, longitude, limit){
    return geolib.isPointInCircle({latitude: latitude, longitude:longitude}, {latitude:pos.latitude, longitude:pos.longitude}, limit);
}
