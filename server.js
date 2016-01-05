'user strict'
require('babel-register');
var path = require('path');
var routes = require('./routes');
var express = require('express');
var parkingInfo = require('./lib/parkingInfo');
var app = express();
var log4js = require('log4js');
var log = log4js.getLogger();
var commons = require('./lib/commons')
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
                            var port  = app.get('port')
                            log.info(`Server started at port ${port}`)
                        });
                       
                        },
                (fail)=> { 
                    log.info('fail')
                    log.error(commons.wrapError(fail, "Start server error"));
                }
);

