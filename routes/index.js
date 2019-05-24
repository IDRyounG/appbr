var express = require('express');
var router = express.Router();
let loginSystem = require('../controllers/loginSystem');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index2', { title: 'O LOGIN' });
});

router.get('/login', function(req, res, next) {
  res.render('login', { title: 'LOGOU' });
});

router.post('/register', loginSystem.registerUser);

module.exports = router;
