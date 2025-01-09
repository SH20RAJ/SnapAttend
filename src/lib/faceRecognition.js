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
    faceLandmarksModel = await faceLandmarksDetection.load(
      faceLandmarksDetection.SupportedPackages.mediapipeFacemesh
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
    const faceDescriptors = await Promise.all(
      predictions.map(async (prediction) => {
        const landmarks = await faceLandmarksModel.estimateFaces({
          input: tensor,
          predictIrises: false,
          flipHorizontal: false
        });
        return landmarks[0]?.annotations || null;
      })
    );

    tensor.dispose();

    // For now, we'll mark students as present based on the number of faces detected
    // In a real implementation, you would:
    // 1. Store face descriptors for each student during registration
    // 2. Compare detected faces with stored descriptors using cosine similarity
    // 3. Match students based on the most similar face descriptor
    const numFaces = predictions.length;
    
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
  
  if (landmarks) {
    // Extract relative positions of key facial landmarks
    const nose = landmarks.noseTip?.[0] || [0, 0, 0];
    const leftEye = landmarks.leftEyeUpper0?.[0] || [0, 0, 0];
    const rightEye = landmarks.rightEyeUpper0?.[0] || [0, 0, 0];
    const mouth = landmarks.lipsUpperOuter?.[0] || [0, 0, 0];
    
    // Calculate relative distances and angles
    features.push(
      // Distance between eyes
      Math.sqrt(
        Math.pow(leftEye[0] - rightEye[0], 2) +
        Math.pow(leftEye[1] - rightEye[1], 2)
      ),
      // Distance from nose to mouth
      Math.sqrt(
        Math.pow(nose[0] - mouth[0], 2) +
        Math.pow(nose[1] - mouth[1], 2)
      ),
      // Angle of eyes relative to horizontal
      Math.atan2(rightEye[1] - leftEye[1], rightEye[0] - leftEye[0]),
      // Relative position of nose between eyes
      (nose[0] - leftEye[0]) / (rightEye[0] - leftEye[0]),
      (nose[1] - leftEye[1]) / (rightEye[1] - leftEye[1])
    );
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
