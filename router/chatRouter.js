var express = require('express')

var router = express.Router()

const messenger = require('../controller/chatController')

router.get('/', messenger.index)

router.post('/send', messenger.send)

module.exports = router