var request = require('request');
var proj4 = require('proj4');
var fs = require('fs');
var path = require('path');

exports = module.exports = {
    getAllMaps,
    initMaps,
    proj4,
    projSource,
    projDest,
    getAllAvailParking,
    startRealtimeParkingUpdateSchedular
}


const REFRESH_TIME_FRAME = 30000
//Define projection system used by Taiwan. Captured from http://www.sunriver.com.tw/taiwanmap/grid_tm2_convert.php#a03
proj4.defs["EPSG:3821"] = "+title=經緯度：TWD67 +proj=longlat  +towgs84=-752,-358,-179,-.0000011698,.0000018398,.0000009822,.00002329 +ellps=aust_SA +units=度 +no_defs";
proj4.defs["EPSG:3826"] = "+title=二度分帶：TWD97 TM2 台灣 +proj=tmerc  +lat_0=0 +lon_0=121 +k=0.9999 +x_0=250000 +y_0=0 +ellps=GRS80 +units=公尺 +no_defs"; 
proj4.defs["EPSG:3825"] = "+title=二度分帶：TWD97 TM2 澎湖 +proj=tmerc  +lat_0=0 +lon_0=119 +k=0.9999 +x_0=250000 +y_0=0 +ellps=GRS80 +units=公尺 +no_defs"; 
proj4.defs["EPSG:3828"] = "+title=二度分帶：TWD67 TM2 台灣 +proj=tmerc  +towgs84=-752,-358,-179,-.0000011698,.0000018398,.0000009822,.00002329 +lat_0=0 +lon_0=121 +x_0=250000 +y_0=0 +k=0.9999 +ellps=aust_SA  +units=公尺";
proj4.defs["EPSG:3827"] = "+title=二度分帶：TWD67 TM2 澎湖 +proj=tmerc  +towgs84=-752,-358,-179,-.0000011698,.0000018398,.0000009822,.00002329 +lat_0=0 +lon_0=119 +x_0=250000 +y_0=0 +k=0.9999 +ellps=aust_SA  +units=公尺";

const CAN_NOT_PROVIDE_PARKING_INFO = [-3,-9] /*-3 means Parking lot is not available;  -9 means Parking lot can not provide free space info now*/

//Use EPSG:3826 as source projection system
const projSource = proj4.defs['EPSG:3826'];
//Use Google as dest projection system
const projDest = proj4.defs['WGS84'];

const CITY = {
    TAIPEI_CITY: "TAIPEI_CITY",
    NEW_TAIPEI_CITY:"NEW_TAIPEI_CITY"
}

const MAPS = {};
const AVAIL_PARKING = {};

const parkingConfig = {
    TAIPEI_CITY:{
        parkingLotMapURL:"http://data.taipei/tcmsv/alldesc",
        availParkingURL:"http://data.taipei/tcmsv/allavailable",

        gzip:true,
        mapHandler: (str) =>{
            let getter = mapFieldGetter(CITY.TAIPEI_CITY);
            return JSON.parse(str.trim())['data']['park'].map((pos)=>{                    

                    var convertedCoord = proj4(projSource, projDest, [getter(pos,'tw97x'), getter(pos,'tw97y')]);
                    return {id: getter(pos,'id'), name: getter(pos,'name'), latitude:convertedCoord[1], longitude:convertedCoord[0]};
                });
            }
        ,

        availHandler: (str) =>{
            str = str.replace(/\"([^\t\s]+?)\t\"/g,'"$1"');
            let data = JSON.parse(str.trim());
            let updateTime = data.data.UPDATETIME;
            
            let parkingDesc = MAPS[CITY.TAIPEI_CITY].reduce((prev,curr)=>{
                                    prev[curr.id] = curr;
                                    return prev;
            }, {});
            let getter = mapFieldGetter(CITY.TAIPEI_CITY);
            let avails = data['data']['park'].map((pos)=>{                             
                return Object.assign({},parkingDesc[getter(pos,"id")], {availableCar: getter(pos,'availableCar')});            
            }).filter((pos)=>{
                //Only return parking lot that can provide available car info   
                return  CAN_NOT_PROVIDE_PARKING_INFO.indexOf(Number(pos.availableCar))<0&&pos.latitude&&pos.longitude
            });

            return avails;
        }
    },
    NEW_TAIPEI_CITY:{
        parkingLotMapURL:"http://data.ntpc.gov.tw/od/data/api/B1464EF0-9C7C-4A6F-ABF7-6BDF32847E68;jsessionid=F058C1CFA07FB3284A7E1827DDD9A55E?$format=json",
        availParkingURL:"http://data.ntpc.gov.tw/od/data/api/E09B35A5-A738-48CC-B0F5-570B67AD9C78;jsessionid=E832F7DF69348B0E82AC8A0CCBD9CA62?$format=json",
        gzip:false,
        mapHandler: (str) =>{
            let getter = mapFieldGetter(CITY.NEW_TAIPEI_CITY);
            return JSON.parse(str.trim()).map((pos)=>{                
                    var convertedCoord = proj4(projSource, projDest, [getter(pos,'tw97x'), getter(pos,'tw97y')]);
                    return {id: getter(pos,'id'), name: getter(pos,'name'), latitude:convertedCoord[1], longitude:convertedCoord[0]};
                });
            }
        ,
        availHandler: (str) =>{
            let data = JSON.parse(str.trim());
            let parkingDesc = MAPS[CITY.NEW_TAIPEI_CITY].reduce((prev, curr)=>{
                prev[curr.id] = curr;
                return prev;
            },{})

            let getter = mapFieldGetter(CITY.NEW_TAIPEI_CITY)

            let avails = data.map((pos)=>{
                
                return Object.assign({},parkingDesc[getter(pos,"id")], {availableCar: getter(pos,'availableCar')});            
            }).filter((pos)=>{
                //Only return parking lot that can provide available car info
                return  CAN_NOT_PROVIDE_PARKING_INFO.indexOf(Number(pos.availableCar))<0&&pos.latitude&&pos.longitude
            })

            return avails
        }
    }
}

function initMaps(){
    let promises = Object.keys(parkingConfig).map((key)=>{
            return new Promise((resolve, reject)=>{
                //First get parkingLot map
                let requestObjForMap = {
                    method:'GET',
                    gzip:parkingConfig[key]['gzip'],
                    url:parkingConfig[key]['parkingLotMapURL']
                };

                request(requestObjForMap, (err, res, body)=>{
                    if (!err){
                        try{
                            MAPS[key] = parkingConfig[key]['mapHandler'](body);
                            console.log(`Succesfully got map data for ${key} from ${parkingConfig[key]['parkingLotMapURL']}, updating to local repository`);
                            fs.writeFileSync(path.join(__dirname, '../datasets/'+key), body);
                        }catch(e){
                            console.log(`Failed to got map data for ${key} from ${parkingConfig[key]['parkingLotMapURL']}, read from local instead`);
                            MAPS[key] = _readMapLocal(key, parkingConfig[key]['mapHandler']);
                        }                  
                    }else{
                        console.log(`Failed to got map data for ${key} from ${parkingConfig[key]['parkingLotMapURL']}, read from local instead`);
                        MAPS[key] = _readMapLocal(key, parkingConfig[key]['mapHandler']);
                    }

                    //Second, get available parking lots
                    fetchRealtimeParkingData(key, resolve, reject)
                })
            });
        });

    return Promise.all(promises);
}

function fetchRealtimeParkingData(key, resolve, reject){
    let requestObjForAvailParking = {
        method:"GET",
        gzip:parkingConfig[key]['gzip'],
        url:parkingConfig[key]['availParkingURL']
    };

    request(requestObjForAvailParking, (err, res, body)=>{
        if (!err){
            AVAIL_PARKING[key] = parkingConfig[key]['availHandler'](body)
            if (typeof resolve==='function') resolve();
        }else{
            if(typeof reject==='function') reject(`Unable to get available parking in ${key} for error ${err}`);
        }
    })
}

function startRealtimeParkingUpdateSchedular(){
    setInterval(()=>Object.keys(parkingConfig).forEach((key)=>{
        fetchRealtimeParkingData(key)
        console.log(`Update realtime parking data for ${key} finished`)
    }),REFRESH_TIME_FRAME)
}

function mapFieldGetter(city){
    let toFieldName = {
        "TAIPEI_CITY":{
            "id":"id",
            "area":"area",
            "name":"name",
            "type":"type",
            "summary":"summary",
            "address":"address",
            "tel": "tel",
            "payex":"payex",
            "serviceTime":"servicetime",
            "tw97x":"tw97x",
            "tw97y":"tw97y",
            "totalCar":"totalcar",
            "totalMotor":"totalmotor",
            "totalBike":"totalbike",
            "availableCar":"availablecar",
            "availableMotor":"availalemotor"
        },
        'NEW_TAIPEI_CITY':{
            "id":"ID",
            "area":"AREA",
            "name":"NAME",
            "type":"TYPE",
            "summary":"SUMMARY",
            "address":"address",
            "tel": "tel",
            "payex":"PAYEX",
            "serviceTime":"SERVICETIME",
            "tw97x":"TW97X",
            "tw97y":"TW97Y",
            "totalCar":"TOTALCAR",
            "totalMotor":"TOTALMOTOR",
            "totalBike":"TOTALBIKE",
            "availableCar":"AVAILABLECAR",
            "availableMotor":"AVAILABLEMOTOR"
        }
    }

    switch(city){
        case 'TAIPEI_CITY':
            return function(object, propName){
                if (!object.hasOwnProperty(toFieldName['TAIPEI_CITY'][propName])) throw new Error("object has no property "+propName+" defined");

                return object[toFieldName['TAIPEI_CITY'][propName]];
            }
            break;
        case 'NEW_TAIPEI_CITY':
            return function(object, propName){
                if (!object.hasOwnProperty(toFieldName['NEW_TAIPEI_CITY'][propName])) {
                    throw new Error("object has no property "+propName+" defined");
                }

                return object[toFieldName['NEW_TAIPEI_CITY'][propName]];
            }
            break;
        default: 
            throw new Error("The parking info of "+city+" is not available yet")
    }
}

function getAllMaps(){
    let allMap = []
    Object.keys(MAPS).forEach((key)=>
        allMap = allMap.concat(MAPS[key])
    )
    return allMap;
}

function getAllAvailParking(){
    let allAvail = []

    Object.keys(AVAIL_PARKING).forEach((key)=>allAvail = allAvail.concat(AVAIL_PARKING[key]))
    return allAvail;
}
function _readMapLocal(key, handler){
    return handler(key,fs.readFileSync(path.join(__dirname, '../datasets/'+key),'utf-8'));
}


