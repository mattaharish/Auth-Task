const router = require('express').Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const auth = require('./../middlewares/auth')

const User = require('./../models/User.js');
const Token = require('./../models/Token.js')

const storage = multer.diskStorage({ //multers disk storage settings
    destination: function (req, file, cb) {
        cb(null, './files/');
    },
    filename: function (req, file, cb) {
        console.log('..............', req.user);
        let datetimestamp = Date.now();
        cb(null, req.user.email + '-' + datetimestamp + '.' + file.originalname.split('.')[file.originalname.split('.').length - 1])
    }
});

const upload = multer({ //multer settings
    storage: storage
}).single('profile');

router.post('/signup', async (req, res) => {
    req.body.password = bcrypt.hashSync(req.body.password, 10);
    let newuser = new User(req.body);
    newuser.save(err => {
        if (err) {
            res.send(err);
        } else {
            res.send(newuser)
        }
    });
});

router.post('/login', (req, res) => {
    console.log(req.body);
    User.findOne({
        'email': req.body.email
    }, (err, result) => {
        if (err) {
            res.send(err);
        } else if (result == null) {
            res.send("No User Found!/ Incorrect Username");
        } else {
            if (bcrypt.compareSync(req.body.password, result.password)) {
                let payload = {
                    email: result.email,
                    id: result.id
                };
                console.log(payload);
                let token = jwt.sign(payload, 'edwisor', {
                    expiresIn: 30 * 60
                });
                new Token({
                    'token': token,
                    'active': true
                }).save(err => {
                    if (err) {
                        res.send(err);
                    }
                    res.send(token);
                })
            } else {
                res.send("Invalid Password!")
            }
        }
    });
});

router.use(auth.auth)

router.get('/getMyData', (req, res) => {
    User.findById(req.user.id, (err, result) => {
        if (err) {
            res.send(err);
        }
        res.send(result);
    });
});

router.put('/editInfo', (req, res) => {
    User.findByIdAndUpdate(req.user.id, req.body, (err, result) => {
        console.log(result);
        if (err) {
            res.send(err);
        }
        res.send(result);
    });
});

router.put('/changePassword', (req, res) => {
    if (Object.keys(req.body).length > 1) {
        res.send("Only Password Field Must Be Passed");
    }
    User.findByIdAndUpdate(req.user.id, {
        '$set': {
            'password': req.body.password
        }
    }, (err, result) => {
        console.log(result);
        if (err) {
            res.send(err);
        }
        res.send(result);
    });
});

router.post('/upload', (req, res) => {
    upload(req, res, function (err) {
        if (err) {
            res.send(err)
        }
        User.findByIdAndUpdate(req.user.id, {
            '$set': {
                'profile': req.file.filename
            }
        }, (err, result) => {
            if (err) {
                res.send(err)
            }
            console.log(result);
            res.send("Profile uploaded succesfully !");
        });
    });
});

router.get('/logout', (req, res) => {
    let token = req.headers['x-access-token']
    Token.findOneAndUpdate({
        'token': token
    }, {
        '$set': {
            active: false
        }
    }, (err, result) => {
        if (err) {
            res.send(err);
        }
        res.send("Logged Out Success!");
    })
});

module.exports = router;