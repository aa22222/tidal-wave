const express = require('express');
const fileUpload = require('express-fileupload');
const cors = require('cors');
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(fileUpload({
  useTempFiles: true,
  tempFileDir: '/tmp/'
}));

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

// API endpoint to handle file uploads and run Python script
app.post('/api/upload', async (req, res) => {
  try {
    console.log("Upload request");
    // Check if files were uploaded
    if (!req.files || Object.keys(req.files).length === 0) {
      return res.status(400).json({ error: 'No files were uploaded' });
    }

    // Get the two uploaded files
    const file1 = req.files.file1;
    const file2 = req.files.file2;

    if (!file1 || !file2) {
      return res.status(400).json({ error: 'Both files are required' });
    }

    // Save files to uploads directory
    const file1Path = path.join(uploadsDir, req.ip + file1.name);
    const file2Path = path.join(uploadsDir, req.ip + file2.name);

    await file1.mv(file1Path);
    await file2.mv(file2Path);

    console.log('Files uploaded successfully');
    console.log('File 1:', file1Path);
    console.log('File 2:', file2Path);

    // Run Python script with file paths as arguments
    const pythonProcess = spawn('python3', [
      path.join(__dirname, 'scripts', 'process_files.py'),
      file1Path,
      file2Path
    ]);

    let pythonOutput = '';
    let pythonError = '';

    // Collect data from Python script
    pythonProcess.stdout.on('data', (data) => {
      pythonOutput += data.toString();
    });

    pythonProcess.stderr.on('data', (data) => {
      pythonError += data.toString();
    });

    // Handle Python script completion
    pythonProcess.on('close', (code) => {
      if (code !== 0) {
        console.error('Python script error:', pythonError);
        return res.status(500).json({
          error: 'Python script execution failed',
          details: pythonError
        });
      }

      console.log('Python script output:', pythonOutput);

      // Clean up uploaded files (optional)
      fs.unlinkSync(file1Path);
      fs.unlinkSync(file2Path);

      res.json({
        message: 'Files processed successfully',
        result: pythonOutput,
        files: {
          file1: file1.name,
          file2: file2.name
        }
      });
    });

  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Server error', details: error.message });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// Serve frontend
app.use(express.static(path.join(__dirname, './frontend/build')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, './frontend/build', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
