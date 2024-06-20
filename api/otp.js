'use strict';

const { Router } = require('express');
const { verifyOtp, generateOTP } = require('../controller/otp');

class OtpAPI {
    constructor() {
        this.router = Router();
        this.setupRoutes();
    }

    setupRoutes() {
        const router = this.router;
        router.post('/verify-otp', verifyOtp);
        router.post("/generate-otp",generateOTP)
      

    }

    getRouter() {
        return this.router;
    }

    getRouterGroup() {
        return '/otp';
    }
}

module.exports = OtpAPI; 