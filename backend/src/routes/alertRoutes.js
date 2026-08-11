const express = require('express')
const router = express.Router()
const alertController = require('../controllers/alertController')

router.get('/dismissals', alertController.listDismissals)
router.post('/dismissals', alertController.dismissAlert)

module.exports = router
