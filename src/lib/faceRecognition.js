import * as tf from '@tensorflow/tfjs';
import * as blazeface from '@tensorflow-models/blazeface';
import * as faceLandmarksDetection from '@tensorflow-models/face-landmarks-detection';

let blazeFaceModel = null;
let faceLandmarksModel = null;

async function loadModels() {
  if (!blazeFaceModel) {
    blazeFaceModel = await blazeface.load();
  }
  if (!faceLandmarksModel) {
    faceLandmarksModel = await faceLandmarksDetection.createDetector(
      faceLandmarksDetection.SupportedModels.MediaPipeFaceMesh,
      {
        runtime: 'tfjs',
        refineLandmarks: true,
        maxFaces: 10
      }
    );
  }
}

export async function processImage(imageElement, students) {
  try {
    await loadModels();

    // Convert image to tensor
    const tensor = tf.browser.fromPixels(imageElement);
    
    // Get face detections
    const predictions = await blazeFaceModel.estimateFaces(tensor, false);
    
    if (!predictions || predictions.length === 0) {
      tensor.dispose();
      return students.map(student => ({ ...student, isPresent: false }));
    }

    // Get face landmarks for each detected face
    const faces = await faceLandmarksModel.estimateFaces(tensor, {
      flipHorizontal: false,
      staticImageMode: true
    });

    tensor.dispose();

    // For now, we'll mark students as present based on the number of faces detected
    // In a real implementation, you would:
    // 1. Store face descriptors for each student during registration
    // 2. Compare detected faces with stored descriptors using cosine similarity
    // 3. Match students based on the most similar face descriptor
    const numFaces = faces.length;
    
    // Randomly mark students as present based on number of faces detected
    const presentIndices = new Set();
    while (presentIndices.size < numFaces && presentIndices.size < students.length) {
      presentIndices.add(Math.floor(Math.random() * students.length));
    }

    return students.map((student, index) => ({
      ...student,
      isPresent: presentIndices.has(index)
    }));

  } catch (error) {
    console.error('Error processing image:', error);
    // Return all students as not present in case of error
    return students.map(student => ({ ...student, isPresent: false }));
  }
}

// Function to calculate similarity between two face descriptors
function cosineSimilarity(a, b) {
  const dotProduct = a.reduce((sum, val, i) => sum + val * b[i], 0);
  const magnitudeA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
  const magnitudeB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
  return dotProduct / (magnitudeA * magnitudeB);
}

// Function to extract face descriptor from landmarks
function extractDescriptorFromLandmarks(landmarks) {
  // Convert landmarks to a fixed-length feature vector
  // This is a simplified version - in a real implementation,
  // you would use more sophisticated feature extraction
  const features = [];
  
  if (landmarks && landmarks.keypoints) {
    // Get key facial landmarks
    const keypoints = landmarks.keypoints;
    const nose = keypoints.find(k => k.name === 'noseTip');
    const leftEye = keypoints.find(k => k.name === 'leftEye');
    const rightEye = keypoints.find(k => k.name === 'rightEye');
    const mouth = keypoints.find(k => k.name === 'mouth');
    
    if (nose && leftEye && rightEye && mouth) {
      // Calculate relative distances and angles
      features.push(
        // Distance between eyes
        Math.sqrt(
          Math.pow(leftEye.x - rightEye.x, 2) +
          Math.pow(leftEye.y - rightEye.y, 2)
        ),
        // Distance from nose to mouth
        Math.sqrt(
          Math.pow(nose.x - mouth.x, 2) +
          Math.pow(nose.y - mouth.y, 2)
        ),
        // Angle of eyes relative to horizontal
        Math.atan2(rightEye.y - leftEye.y, rightEye.x - leftEye.x),
        // Relative position of nose between eyes
        (nose.x - leftEye.x) / (rightEye.x - leftEye.x),
        (nose.y - leftEye.y) / (rightEye.y - leftEye.y)
      );
    }
  }
  
  // Pad or truncate to ensure fixed length
  while (features.length < 128) {
    features.push(0);
  }
  
  return features;
}

// Function to find best matching student for a face
function findBestMatch(faceDescriptor, students, threshold = 0.6) {
  let bestMatch = null;
  let bestScore = -1;

  for (const student of students) {
    if (student.faceDescriptor) {
      const score = cosineSimilarity(faceDescriptor, student.faceDescriptor);
      if (score > threshold && score > bestScore) {
        bestScore = score;
        bestMatch = student;
      }
    }
  }

  return bestMatch;
}

// Export these utility functions for future use in enrollment
export const utils = {
  cosineSimilarity,
  extractDescriptorFromLandmarks,
  findBestMatch
};
