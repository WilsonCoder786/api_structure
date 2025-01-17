'use strict';

const rootApi = require('./root');
const authApi = require('./auth');
const otpApi = require('./otp');
const userApi = require('./user');
const notificationApi = require('./notification');
const propertyApi = require('./property')
const messageApi = require('./message');
const requestApi =  require('./request')
const reviewApi =  require('./review')
const favouriteApi =  require('./favourite')

const { Router } = require('express');

class API {
    constructor(app) {
        this.app = app;
        this.router = Router();
        this.routeGroups = [];
    }

    loadRouteGroups() {
        this.routeGroups.push(new rootApi());
        this.routeGroups.push(new authApi());
        this.routeGroups.push(new otpApi());
        this.routeGroups.push(new userApi());
        this.routeGroups.push(new notificationApi());
        this.routeGroups.push(new messageApi());
        this.routeGroups.push(new propertyApi());
        this.routeGroups.push(new reviewApi());
        this.routeGroups.push(new requestApi());
        this.routeGroups.push(new favouriteApi());




    }

    setContentType(req, res, next) {
        res.set('Content-Type', 'application/json');
        next();
    }

    registerGroups() {
        this.loadRouteGroups();
        this.routeGroups.forEach((rg) => {
            console.log('Route group: ' + rg.getRouterGroup());
            this.app.use('/api' + rg.getRouterGroup(), this.setContentType, rg.getRouter());
        });
    }
}

module.exports = API;