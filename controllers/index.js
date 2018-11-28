var router = require('express').Router();


router.use('/api/v1', require('./users.js'));

module.exports = router;