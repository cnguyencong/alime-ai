# Subtitle Generator

A powerful subtitle generation service that uses OpenAI's Whisper for transcription and supports multiple languages. The project includes both a REST API service built with Node.js/Express and standalone Python scripts for transcription and translation.

## Features

- Support for both audio and video files
- Multi-language transcription
- SRT subtitle file generation
- Translation capabilities
- GPU acceleration support
- Real-time progress tracking
- Paragraph-based segmentation

## Project Structure

```
project/
├── src/
│   ├── controllers/          # Request handlers
│   │   └── whisper.controller.js
│   ├── services/            # Business logic
│   │   └── whisper.service.js
│   ├── routes/              # Route definitions
│   │   ├── index.js
│   │   └── whisper.routes.js
│   └── index.js             # App entry point
├── whisper_transcribe.py    # Whisper transcription script
├── translate_srt.py         # SRT translation script
├── output/                  # Generated subtitles
├── uploads/                 # Temporary media files
└── package.json
```

## Prerequisites

- Node.js (v16 or higher)
- Python 3.8 or higher
- CUDA-compatible GPU (recommended)
- FFmpeg (required for video processing)

## Dependencies

### Python Dependencies
The following major packages are required:
- `openai-whisper`: OpenAI's Whisper model for transcription
- `torch`: PyTorch for deep learning operations
- `transformers`: Hugging Face Transformers for translation
- `ffmpeg-python`: FFmpeg Python bindings for media processing
- `tqdm`: Progress bar functionality
- Additional dependencies are listed in `requirements.txt`

### Node.js Dependencies
Key packages include:
- `express`: Web framework
- `multer`: File upload handling
- `dotenv`: Environment variable management
- Full list available in `package.json`

## Installation

1. Install Node.js dependencies:
   ```bash
   npm install
   ```

2. Install Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```

   For GPU support (recommended):
   ```bash
   pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu118
   ```

3. Install FFmpeg (if not already installed):
   - Windows: 
     ```bash
     # Using chocolatey
     choco install ffmpeg
     # Or download from https://ffmpeg.org/download.html
     ```
   - Linux: 
     ```bash
     sudo apt update
     sudo apt install ffmpeg
     ```
   - macOS: 
     ```bash
     brew install ffmpeg
     ```

## Usage

### REST API Service

1. Start the server:
   ```bash
   npm run dev
   ```

2. API Endpoints:
   - POST `/api/whisper/transcribe` - Transcribe audio/video file
   - GET `/api/whisper/download/:filename` - Download generated SRT file

Example transcription request:
```bash
curl -X POST http://localhost:3000/api/whisper/transcribe \
  -F "media=@path/to/your/video.mp4" \
  -F "language=en" \
  -F "modelSize=medium"
```

### Standalone Python Scripts

#### Transcription (whisper_transcribe.py)

```bash
python whisper_transcribe.py <input_file> [options]

Options:
  --model        Model size (tiny, base, small, medium, large) [default: base]
  --language     Language code (en, ja, zh, etc.) [default: auto]
  --output-dir   Output directory [default: output/]
  --is-video     Flag for video input
```

Example:
```bash
python whisper_transcribe.py video.mp4 --model medium --language ja --is-video
```

#### Translation (translate_srt.py)

```bash
python translate_srt.py <input_srt> [options]

Options:
  --target-lang  Target language code
  --model       Translation model to use
```

Example:
```bash
python translate_srt.py input.srt --target-lang en
```

## Supported File Formats

### Audio
- MP3
- WAV
- OGG
- M4A
- FLAC

### Video
- MP4
- MKV
- AVI
- MOV
- WebM

## Model Sizes and Performance

| Model  | Memory | Relative Speed | Accuracy |
|--------|--------|----------------|----------|
| tiny   | 1GB    | 32x            | Base     |
| base   | 1GB    | 16x            | Good     |
| small  | 2GB    | 6x             | Better   |
| medium | 5GB    | 2x             | Great    |
| large  | 10GB   | 1x             | Best     |

## Environment Variables

Create a `.env` file in the `src` directory:

```env
PORT=3000
MAX_FILE_SIZE=500MB
```

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request