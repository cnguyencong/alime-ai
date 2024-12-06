const whisperService = require('../services/whisper.service');
const fs = require('fs').promises;
const path = require('path');

exports.transcribeMedia = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                error: 'No media file provided'
            });
        }

        // Check if file is audio or video
        const isVideo = req.file.mimetype.startsWith('video/') || 
            /\.(mp4|mkv|avi|mov|webm)$/i.test(req.file.originalname);

        const language = req.body.language || 'en';
        const modelSize = req.body.modelSize || 'medium';

        // Run whisper transcription
        const transcriptionResult = await whisperService.runWhisper(req.file.path, {
            language,
            modelSize,
            isVideo
        });

        // Generate download URL for the transcription
        const srtFilename = path.basename(transcriptionResult.outputFile);
        
        res.json({
            success: true,
            message: 'Transcription completed successfully',
            data: {
                file: transcriptionResult.outputFile,
                downloadUrl: `/api/whisper/download/${srtFilename}`,
                mediaType: isVideo ? 'video' : 'audio'
            }
        });

    } catch (error) {
        console.error('Controller error:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to process transcription'
        });
    }
};

exports.downloadSrt = async (req, res) => {
    try {
        const filename = req.params.filename;
        const filePath = path.join(process.cwd(), 'output', filename);

        // Check if file exists
        try {
            await fs.access(filePath);
        } catch (error) {
            return res.status(404).json({
                success: false,
                error: 'File not found'
            });
        }

        // Set headers for file download
        res.setHeader('Content-Type', 'text/srt');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

        // Stream the file
        const fileStream = fs.createReadStream(filePath);
        fileStream.pipe(res);

    } catch (error) {
        console.error('Download error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to download file'
        });
    }
};
