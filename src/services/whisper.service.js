const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs').promises;

/**
 * Run Whisper AI transcription on an audio or video file
 * @param {string} filename - Path to the media file
 * @param {Object} options - Whisper options
 * @param {string} options.language - Target language for transcription
 * @param {string} options.modelSize - Whisper model size (tiny, base, small, medium, large)
 * @param {boolean} options.isVideo - Whether the input file is a video file
 * @returns {Promise} - Returns a promise that resolves with the transcription result
 */
exports.runWhisper = async (filename, options = {}) => {
    try {
        const { language = 'en', modelSize = 'medium', isVideo = false } = options;
        const outputDir = path.join(process.cwd(), 'output');
        
        // Create output directory if it doesn't exist
        await fs.mkdir(outputDir, { recursive: true });

        // Path to the whisper transcribe script
        const scriptPath = path.join(process.cwd(), 'whisper_transcribe.py');

        // Construct whisper command arguments
        const whisperArgs = [
            scriptPath,
            filename,
            '--model', modelSize,
            '--language', language,
            '--output-dir', outputDir,
            '--output-formats', 'srt'
        ];

        // Add video flag if input is video
        if (isVideo) {
            whisperArgs.push('--is-video');
        }

        return new Promise((resolve, reject) => {
            console.log('Executing command:', ['python', ...whisperArgs].join(' '));
            const whisperProcess = spawn('python', whisperArgs, {
                stdio: ['inherit', 'pipe', 'pipe']
            });

            let output = '';
            let error = '';

            whisperProcess.stdout.on('data', (data) => {
                const message = data.toString();
                output += message;
                process.stdout.write(message); // This will show in real-time
            });

            whisperProcess.stderr.on('data', (data) => {
                const message = data.toString();
                error += message;
                process.stderr.write(message); // Show errors in real-time
            });

            whisperProcess.on('close', async (code) => {
                try {
                    // Clean up the media file
                    await fs.unlink(filename).catch(err => {
                        console.warn('Failed to cleanup media file:', err);
                    });

                    if (code !== 0) {
                        console.error('Whisper process exited with code:', code);
                        reject(new Error(`Whisper process failed: ${error}`));
                        return;
                    }

                    // Generate output file path (same as whisper_transcribe.py generates)
                    const outputFile = path.join(outputDir, path.basename(filename, path.extname(filename)) + '.json');
                    resolve({
                        success: true,
                        outputFile,
                        output
                    });
                } catch (err) {
                    reject(err);
                }
            });
        });
    } catch (error) {
        console.error('Error in runWhisper:', error);
        throw error;
    }
};