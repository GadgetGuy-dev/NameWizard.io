import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create a new express app
const app = express();

// Serve the zip file directly
app.get('/', (req, res) => {
  const filePath = path.resolve('./key_files.zip');
  if (fs.existsSync(filePath)) {
    res.download(filePath, 'namewizard_key_files.zip');
  } else {
    res.status(404).send('File not found');
  }
});

// Start the server on port 3000
const PORT = 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Direct download server running on port ${PORT}`);
});