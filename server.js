'user strict'
require('babel-register');
var path = require('path');
var routes = require('./routes');
var express = require('express');
var map = require('./lib/map');
var parkingData = require('./lib/parkingData')
var app = express();
app.set('port', process.env.PORT || 3000);
app.use(express.static(path.join(__dirname, 'client')));
//Read all maps before server started
map.initMaps({taipeiParking: {
                url: 'http://data.taipei/tcmsv/alldesc',
                gzip:true,
                handler: (key, str) =>{
                    return JSON.parse(str.trim())['data']['park'].map((pos)=>{
                            var convertedCoord = map.proj4(map.projSource, map.projDest, [pos['tw97x'], pos['tw97y']]);
                            return {id: pos.id, name: pos.name, latitude:convertedCoord[1], longitude:convertedCoord[0], FareInfo: pos.FareInfo};
                        });
                    }
                }
            }).then(
                (values)=>{  
                            //Set map for latter middleware use
                            values.forEach((key)=>{
                                app.use('/api/'+key, (req,res,next)=> {
                                    req['map'] = map.getMap(key);
                                    next();
                                })   
                            })
                            //Defines middlewares to handle request here.  

                            parkingData.startSchedular(map.getMap('taipeiParking')).then(
                                ()=>{
                                     app.get('/api/taipeiParking/addressWithingRange', routes.getAdressWithinRange);
                                     app.get('/api/taipeiParking/available', routes.availableParkingLots);
                                     app.listen(app.get('port'),()=>console.log('server started at port', app.get('port')));

                                },
                                ()=> {throw new Error('Could not get parking info')}
                            )
                           
                            },
                (fail)=> { throw new Error('Unable to init server')}
);

