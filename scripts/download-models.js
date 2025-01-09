const fs = require('fs');
const https = require('https');
const path = require('path');

const MODELS_DIR = path.join(process.cwd(), 'public', 'models');

// Create models directory if it doesn't exist
if (!fs.existsSync(MODELS_DIR)) {
  fs.mkdirSync(MODELS_DIR, { recursive: true });
}

const MODELS = [
  'shard1',
  'face_landmark_68_model-shard1',
  'face_recognition_model-shard1',
  'face_recognition_model-shard2',
  'face_landmark_68_model-weights_manifest.json',
  'face_recognition_model-weights_manifest.json',
  'ssd_mobilenetv1_model-weights_manifest.json'
];

const BASE_URL = 'https://justadudewhohacks.github.io/face-api.js/weights';

async function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https.get(url, response => {
      response.pipe(file);
      file.on('finish', () => {
        file.close();
        resolve();
      });
    }).on('error', err => {
      fs.unlink(dest, () => {
        reject(err);
      });
    });
  });
}

async function downloadModels() {
  console.log('Downloading face-api.js models...');
  
  for (const model of MODELS) {
    const url = `${BASE_URL}/${model}`;
    const dest = path.join(MODELS_DIR, model);
    
    console.log(`Downloading ${model}...`);
    await downloadFile(url, dest);
  }
  
  console.log('All models downloaded successfully!');
}

downloadModels().catch(console.error);
