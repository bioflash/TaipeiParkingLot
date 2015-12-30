'use strict';
var proj4 = require('proj4');
var request = require('request');
//Define projection system used by Taiwan. Captured from http://www.sunriver.com.tw/taiwanmap/grid_tm2_convert.php#a03
proj4.defs["EPSG:3821"] = "+title=經緯度：TWD67 +proj=longlat  +towgs84=-752,-358,-179,-.0000011698,.0000018398,.0000009822,.00002329 +ellps=aust_SA +units=度 +no_defs";
proj4.defs["EPSG:3826"] = "+title=二度分帶：TWD97 TM2 台灣 +proj=tmerc  +lat_0=0 +lon_0=121 +k=0.9999 +x_0=250000 +y_0=0 +ellps=GRS80 +units=公尺 +no_defs"; 
proj4.defs["EPSG:3825"] = "+title=二度分帶：TWD97 TM2 澎湖 +proj=tmerc  +lat_0=0 +lon_0=119 +k=0.9999 +x_0=250000 +y_0=0 +ellps=GRS80 +units=公尺 +no_defs"; 
proj4.defs["EPSG:3828"] = "+title=二度分帶：TWD67 TM2 台灣 +proj=tmerc  +towgs84=-752,-358,-179,-.0000011698,.0000018398,.0000009822,.00002329 +lat_0=0 +lon_0=121 +x_0=250000 +y_0=0 +k=0.9999 +ellps=aust_SA  +units=公尺";
proj4.defs["EPSG:3827"] = "+title=二度分帶：TWD67 TM2 澎湖 +proj=tmerc  +towgs84=-752,-358,-179,-.0000011698,.0000018398,.0000009822,.00002329 +lat_0=0 +lon_0=119 +x_0=250000 +y_0=0 +k=0.9999 +ellps=aust_SA  +units=公尺";


//Use EPSG:3826 as source projection system
var projSource = proj4.defs['EPSG:3826'];
//Use Google as dest projection system
var projDest = proj4.defs['WGS84'];

var destPoint = proj4(projSource, projDest,[307143.74, 2770011.52]);

//console.log(destPoint);

var requestObj = {
    method:'GET',
    url: 'http://data.taipei/tcmsv/alldesc',
    gzip: true
}
request(requestObj, (err, resp, body)=>{
    if (!err){
       let allParkingLots = JSON.parse(body.trim())['data']['park'].map((item)=>{
            let converted = proj4(projSource, projDest, [item['tw97x'], item['tw97y']]);

            return {id: item.id, convertedX:converted[0], convertedY:converted[1]}

        });

        console.log(allParkingLots);
    }
});
