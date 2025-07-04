import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';

let firebaseApp: any;
let db: any;
let auth: any;

function parseFirebaseConfig(configString: string) {
  // Try direct JSON parse first
  try {
    return JSON.parse(configString);
  } catch (error) {
    // If direct parse fails, try to fix the escaped string
    try {
      // Handle escaped JSON from environment variables
      let fixed = configString;
      
      // Remove outer quotes if present
      if (fixed.startsWith('"') && fixed.endsWith('"')) {
        fixed = fixed.slice(1, -1);
      }
      
      // Basic unescape for quotes and backslashes
      fixed = fixed.replace(/\\"/g, '"').replace(/\\\\/g, '\\');
      
      // Try parsing again
      return JSON.parse(fixed);
    } catch (secondError) {
      // Last resort: use eval (careful approach)
      try {
        // Create a safe object from the string
        const cleanConfig = configString
          .replace(/\\n/g, '\\n')  // Keep escaped newlines as literal
          .replace(/\\"/g, '"')
          .replace(/\\\\/g, '\\');
        
        // Use Function constructor instead of eval for safer execution
        const parseFunction = new Function('return ' + cleanConfig);
        return parseFunction();
      } catch (thirdError) {
        throw new Error(`Failed to parse Firebase config: ${error.message}`);
      }
    }
  }
}

export function initializeFirebase() {
  if (!firebaseApp) {
    const firebaseConfig = process.env.FIREBASE_CONFIG || process.env.FIREBASE_SERVICE_ACCOUNT;
    
    if (!firebaseConfig) {
      throw new Error('Firebase configuration not found. Please set FIREBASE_CONFIG or FIREBASE_SERVICE_ACCOUNT environment variable.');
    }

    try {
      const serviceAccount = parseFirebaseConfig(firebaseConfig);
      
      // Ensure private_key has proper formatting
      if (serviceAccount.private_key) {
        serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');
      }
      
      firebaseApp = initializeApp({
        credential: cert(serviceAccount),
        databaseURL: `https://${serviceAccount.project_id}-default-rtdb.firebaseio.com`
      });
      
      db = getFirestore(firebaseApp);
      auth = getAuth(firebaseApp);
      
      console.log('Firebase initialized successfully');
    } catch (error) {
      console.error('Error initializing Firebase:', error);
      throw error;
    }
  }
  
  return { db, auth };
}

export { db, auth };
