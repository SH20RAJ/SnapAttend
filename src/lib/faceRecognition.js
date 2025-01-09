import * as tf from '@tensorflow/tfjs';
import * as blazeface from '@tensorflow-models/blazeface';

let model = null;

async function loadModels() {
  if (!model) {
    // Load the BlazeFace model
    model = await blazeface.load({
      maxFaces: 10, // Detect up to 10 faces
      inputWidth: 128,
      inputHeight: 128,
      iouThreshold: 0.3, // Intersection over union threshold
      scoreThreshold: 0.75 // Detection confidence threshold
    });
  }
}

export async function processImage(imageElement, students) {
  try {
    await loadModels();

    // Prepare the image
    const img = tf.browser.fromPixels(imageElement);
    
    // Normalize and resize the image
    const resized = tf.image.resizeBilinear(img, [128, 128]);
    const normalized = tf.div(resized, 255.0);
    
    // Run face detection
    const predictions = await model.estimateFaces(normalized, false);
    
    // Clean up tensors
    img.dispose();
    resized.dispose();
    normalized.dispose();

    if (!predictions || predictions.length === 0) {
      console.log('No faces detected');
      return students.map(student => ({ ...student, isPresent: false }));
    }

    console.log(`Detected ${predictions.length} faces`);

    // For testing: Mark students as present based on number of faces detected
    const numFaces = predictions.length;
    const presentIndices = new Set();
    
    // Randomly select students to mark as present based on number of faces
    while (presentIndices.size < numFaces && presentIndices.size < students.length) {
      presentIndices.add(Math.floor(Math.random() * students.length));
    }

    // Update student attendance
    return students.map((student, index) => ({
      ...student,
      isPresent: presentIndices.has(index),
      // Store face detection data for debugging
      faceData: presentIndices.has(index) ? {
        confidence: predictions[presentIndices.size - 1]?.probability?.[0] || 0,
        box: predictions[presentIndices.size - 1]?.topLeft || null
      } : null
    }));

  } catch (error) {
    console.error('Error processing image:', error);
    return students.map(student => ({ ...student, isPresent: false }));
  }
}

// Helper function to draw face detection boxes (for debugging)
export function drawFaceDetectionBoxes(canvas, predictions) {
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  predictions.forEach(prediction => {
    const start = prediction.topLeft;
    const end = prediction.bottomRight;
    const size = [end[0] - start[0], end[1] - start[1]];

    ctx.strokeStyle = '#28a745';
    ctx.lineWidth = 2;
    ctx.strokeRect(start[0], start[1], size[0], size[1]);

    // Draw confidence score
    const confidence = (prediction.probability[0] * 100).toFixed(1);
    ctx.fillStyle = '#28a745';
    ctx.font = '14px Arial';
    ctx.fillText(`${confidence}%`, start[0], start[1] > 10 ? start[1] - 5 : 10);
  });
}
