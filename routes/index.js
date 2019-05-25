var express = require('express');
var router = express.Router();
let loginSystem = require('../controllers/loginSystem');

/* GET home page. */
router.get('/register', function(req, res, next) {
  res.render('register', { title: 'CADASTRO' });
});

router.get('/confirmation', function(req, res, next) {
  res.render('confirmation', { title: 'CONFIRMAÇÃO' });
});

router.get('/login', function(req, res, next) {
  res.render('login', { title: 'LOGIN' });
});

router.get('/index', function(req, res, next) {
  res.render('index', { title: 'DASHBOARD' });
});

router.post('/register', loginSystem.registerUser);
router.post('/confirmation', loginSystem.confirmUser);
router.post('/login', loginSystem.login);


module.exports = router;
