'use strict';

const AuthAPI = require('./auth');
const OtpAPI = require('./otp');
const RootAPI = require('./root');


const { Router } = require('express');

class API {
    constructor(app) {
        this.app = app;
        this.router = Router();
        this.routeGroups = [];
    }

    loadRouteGroups() {
        this.routeGroups.push(new RootAPI());
        this.routeGroups.push(new AuthAPI());
        this.routeGroups.push(new OtpAPI());
        // this.routeGroups.push(new userApi());
        // this.routeGroups.push(new notificationApi());
        // this.routeGroups.push(new messageApi());
        // this.routeGroups.push(new propertyApi());
        // this.routeGroups.push(new reviewApi());
        // this.routeGroups.push(new requestApi());
        // this.routeGroups.push(new favouriteApi());

    }

    setContentType(req, res, next) {
        res.set('Content-Type', 'application/json');
        next();
    }

    registerGroups() {
        this.loadRouteGroups();
        this.routeGroups.forEach((rg) => {

            this.app.use('/api' + rg.getRouterGroup(), this.setContentType, rg.getRouter());
        });
    }
}

module.exports = API;