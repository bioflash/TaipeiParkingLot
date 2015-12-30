var geolib = require('geolib')
var request = require('request')
const CAN_NOT_PROVIDE_PARKING_INFO = [-3,-9] /*-3 means Parking lot is not available;  -9 means Parking lot can not provide free space info now*/
const REFRESH_TIME_FRAME = 30000
var data = undefined

module.exports = {
    fetchRealtimeParkingData: function(map){
        var reqObj = {
        method:'GET',
        gzip:true,
        url:'http://data.taipei/tcmsv/allavailable'
        }

        return new Promise((resolve, reject)=>{
             request(reqObj, (err, response, body)=>{
                if (!err){
                    let data = JSON.parse(body.trim());
                    let updateTime = data.data.UPDATETIME;
                    
                    let parkingDesc = map.reduce((prev,curr)=>{
                                            prev[curr.id] = curr;
                                            return prev;
                    }, {});

                    let avails = data['data']['park'].map((pos)=>{
                        //Only return parking lot that can provide available car info                
                        return Object.assign({},parkingDesc[pos.id], {availablecar: pos.availablecar, availablemotor:pos.availablemotor});            
                    }).filter((pos)=>{
                        return  CAN_NOT_PROVIDE_PARKING_INFO.indexOf(Number(pos.availablecar))<0&&pos.latitude&&pos.longitude
                    });

                    resolve({updateTime, avails});
                }else{
                    reject(err);
                }
            })
        })            
    },

    startSchedular: function(map){
        //Set the schedular to update data
        setInterval(()=>{
            this.fetchRealtimeParkingData(map).then(
                (result)=> data=result,
                (err)=>{throw new Exception('Unable to get parking data')}
            )
        }, REFRESH_TIME_FRAME)

        //Run immediately before server start
        return new Promise((resolve, reject)=>{
                this.fetchRealtimeParkingData(map).then(
                    (result)=>{
                        data=result
                        resolve()
                    },
                    (error)=>{
                        throw new Exception('Unable to get parking data')
                    }
                )
        })
        
    },

    getRealtimeParkingData:function(){
       return data
    }
}
