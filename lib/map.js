var request = require('request');
var proj4 = require('proj4');
var fs = require('fs');
var path = require('path');
//Define projection system used by Taiwan. Captured from http://www.sunriver.com.tw/taiwanmap/grid_tm2_convert.php#a03
proj4.defs["EPSG:3821"] = "+title=經緯度：TWD67 +proj=longlat  +towgs84=-752,-358,-179,-.0000011698,.0000018398,.0000009822,.00002329 +ellps=aust_SA +units=度 +no_defs";
proj4.defs["EPSG:3826"] = "+title=二度分帶：TWD97 TM2 台灣 +proj=tmerc  +lat_0=0 +lon_0=121 +k=0.9999 +x_0=250000 +y_0=0 +ellps=GRS80 +units=公尺 +no_defs"; 
proj4.defs["EPSG:3825"] = "+title=二度分帶：TWD97 TM2 澎湖 +proj=tmerc  +lat_0=0 +lon_0=119 +k=0.9999 +x_0=250000 +y_0=0 +ellps=GRS80 +units=公尺 +no_defs"; 
proj4.defs["EPSG:3828"] = "+title=二度分帶：TWD67 TM2 台灣 +proj=tmerc  +towgs84=-752,-358,-179,-.0000011698,.0000018398,.0000009822,.00002329 +lat_0=0 +lon_0=121 +x_0=250000 +y_0=0 +k=0.9999 +ellps=aust_SA  +units=公尺";
proj4.defs["EPSG:3827"] = "+title=二度分帶：TWD67 TM2 澎湖 +proj=tmerc  +towgs84=-752,-358,-179,-.0000011698,.0000018398,.0000009822,.00002329 +lat_0=0 +lon_0=119 +x_0=250000 +y_0=0 +k=0.9999 +ellps=aust_SA  +units=公尺";


//Use EPSG:3826 as source projection system
const projSource = proj4.defs['EPSG:3826'];
//Use Google as dest projection system
const projDest = proj4.defs['WGS84'];

exports = module.exports = {
    getMap,
    initMaps,
    proj4,
    projSource,
    projDest
}

const MAPS = {};

function initMaps(config){
    let promises = Object.keys(config).map((key)=>{
            return new Promise((resolve, reject)=>{
                let requestObj = {
                    method:'GET',
                    gzip:config[key]['gzip'],
                    url:config[key]['url']
                };

                request(requestObj, (err, res, body)=>{
                    if (!err){
                        try{
                            MAPS[key] = config[key]['handler'](key, body);
                            console.log(`Succesfully got map data for ${key} from ${config[key]['url']}, updating to local repository`);
                            fs.writeFileSync(path.join(__dirname, '../datasets/'+key), body);
                            resolve(key);
                        }catch(e){
                            console.log(`Failed to got map data for ${key} from ${config[key]['url']}, read from local instead`);
                            MAPS[key] = _readMapLocal(key, config[key]['handler']);
                            resolve(key);
                        }
                        
                    }else{
                        console.log(`Failed to got map data for ${key} from ${config[key]['url']}, read from local instead`);
                        MAPS[key] = _readMapLocal(key, config[key]['handler']);
                        resolve(key);
                    }
                })
            });
        });

    return Promise.all(promises);
}

function getMap(key){
    return [...MAPS[key]];
}

function _readMapLocal(key, handler){
    return handler(key,fs.readFileSync(path.join(__dirname, '../datasets/'+key),'utf-8'));
}

