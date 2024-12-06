const express = require('express');
const multer = require('multer');
const path = require('path');
const whisperController = require('../controllers/whisper.controller');

// Configure multer for media file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const fileFilter = (req, file, cb) => {
    // Accept audio and video files
    if (
        file.mimetype.startsWith('audio/') || 
        file.mimetype.startsWith('video/') ||
        file.originalname.match(/\.(wav|mp3|ogg|m4a|flac|mp4|mkv|avi|mov|webm)$/i)
    ) {
        cb(null, true);
    } else {
        cb(new Error('Only audio and video files are allowed!'), false);
    }
};

const upload = multer({ 
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 500 * 1024 * 1024 // 500MB limit for video files
    }
});

const router = express.Router();

// Routes
router.post('/transcribe', 
    upload.single('media'), 
    whisperController.transcribeMedia
);

// Download route for SRT files
router.get('/download/:filename', whisperController.downloadSrt);

module.exports = router;
