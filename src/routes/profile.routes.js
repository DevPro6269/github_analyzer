const express = require('express');
const router = express.Router();
const { analyzeProfile, listProfiles, getSingleProfile } = require('../controllers/profile.controller');

router.post('/analyze/:username', analyzeProfile);
router.get('/profiles', listProfiles);
router.get('/profiles/:username', getSingleProfile);

module.exports = router;
