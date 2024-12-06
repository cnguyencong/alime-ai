const express = require('express');
const whisperRoutes = require('./whisper.routes');

const router = express.Router();

// Mount routes
router.use('/whisper', whisperRoutes);

module.exports = router;
