const apiRouter = require('express').Router();
const controller = require('../controller/user.js');
const middleware = require('../middleware/request.js');
const eventController = require('../controller/event.js');
const multer = require('multer');



//Get Requests
apiRouter.get('/loginPage',controller.loginPage);
apiRouter.get('/error',controller.errorPage);
apiRouter.get('/dashboard',middleware.verifyRequest,controller.dashboard);
apiRouter.get('/logout',controller.logout);
apiRouter.get('/event',middleware.verifyRequest,eventController.event);
apiRouter.get('/addEvent',middleware.verifyRequest,eventController.addEvent);
apiRouter.get('/viewEvent',middleware.verifyRequest,eventController.viewEvent);
apiRouter.get('/register',middleware.verifyRequest,eventController.registerStudent);

//Post Requests
apiRouter.post('/login',controller.login);
apiRouter.post('/eventData',middleware.verifyRequest,eventController.eventData);
apiRouter.post('/uploadStudentData',middleware.verifyRequest,multer().single('studentDetails'),eventController.uploadStudentData);

module.exports = apiRouter;