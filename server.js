'user strict'
require('babel-register');
var path = require('path');
var routes = require('./routes');
var express = require('express');
var parkingInfo = require('./lib/parkingInfo');
//var parkingData = require('./lib/parkingData')
var app = express();
app.set('port', process.env.PORT || 3000);
app.use(express.static(path.join(__dirname, 'client')));
//Read all maps before server started
parkingInfo.initMaps().then(
                ()=>{  
                        app.use('/api', (req, res, next)=>{
                            req['map'] = parkingInfo.getAllMaps();
                            req['avail'] = parkingInfo.getAllAvailParking()
                            next()
                        })
                        
                        app.get('/api/addressWithingRange', routes.getAdressWithinRange);
                        app.get('/api/available', routes.availableParkingLots);
                        app.listen(app.get('port'),()=>{
                            parkingInfo.startRealtimeParkingUpdateSchedular();
                            console.log('server started at port', app.get('port'))}
                        );
                       
                        },
                (fail)=> { throw new Error('Unable to init server')}
);

