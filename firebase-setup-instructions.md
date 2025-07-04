# Firebase Setup Instructions for ZetuBridge

## Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project"
3. Project name: `zetubridge-medical-apps`
4. Enable Google Analytics (optional)
5. Click "Create project"

## Step 2: Enable Firestore Database

1. In your Firebase project, go to "Firestore Database"
2. Click "Create database"
3. Choose "Start in test mode" for now
4. Select a location (choose closest to Kenya, like `europe-west1`)
5. Click "Done"

## Step 3: Generate Service Account Key

1. Go to Project Settings (gear icon) → "Service accounts"
2. Click "Generate new private key"
3. Download the JSON file
4. **Important**: Keep this file secure - it contains your private keys

## Step 4: Set Environment Variable

Copy the entire contents of the downloaded JSON file and set it as your `FIREBASE_CONFIG` environment variable.

The JSON should look like this:
```json
{
  "type": "service_account",
  "project_id": "your-project-id",
  "private_key_id": "key-id",
  "private_key": "-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY\n-----END PRIVATE KEY-----\n",
  "client_email": "firebase-adminsdk-xxxxx@your-project-id.iam.gserviceaccount.com",
  "client_id": "your-client-id",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-xxxxx%40your-project-id.iam.gserviceaccount.com"
}
```

## Step 5: Create Firestore Collections

### Method 1: Using Firebase Console (Recommended)

1. Go to Firestore Database in Firebase Console
2. Click "Start collection"
3. Create these collections with sample documents:

#### Collection: `developers`
- Document ID: `dev_med_a_team`
- Fields:
  ```
  email: developer@med-a.com (string)
  name: MED-A Team (string)
  company: Medical Education Solutions (string)
  password: $2b$10$example-hashed-password (string)
  createdAt: 2025-01-04T10:00:00Z (string)
  isVerified: true (boolean)
  ```

#### Collection: `apps`
- Document ID: `app_med_a`
- Fields:
  ```
  name: MED-A (string)
  description: Welcome to MED-A! Your go-to app for accessing past exam papers from Kenya Medical Training College (KMTC). Whether you're a KMTC student or enrolled in a private institution offering courses like nursing and more, MED-A is here to support your studies with valuable resources to help you succeed. (string)
  category: Medical Education (string)
  logoUrl: https://via.placeholder.com/120x120/4F46E5/ffffff?text=MED-A (string)
  downloadUrl: https://example.com/download/med-a.apk (string)
  screenshots: [
    "https://via.placeholder.com/400x600/4F46E5/ffffff?text=Screenshot+1",
    "https://via.placeholder.com/400x600/4F46E5/ffffff?text=Screenshot+2"
  ] (array)
  developerId: dev_med_a_team (string)
  developerName: MED-A Team (string)
  status: published (string)
  paymentStatus: completed (string)
  rating: 4.8 (number)
  downloads: 1250 (number)
  createdAt: 2025-01-04T10:00:00Z (string)
  updatedAt: 2025-01-04T10:00:00Z (string)
  ```

#### Collection: `payments`
- Document ID: `payment_med_a`
- Fields:
  ```
  appId: app_med_a (string)
  developerId: dev_med_a_team (string)
  amount: 100000 (number)
  currency: KES (string)
  reference: med-a-payment-001 (string)
  status: completed (string)
  paystackReference: paystack-ref-001 (string)
  createdAt: 2025-01-04T10:00:00Z (string)
  updatedAt: 2025-01-04T10:00:00Z (string)
  ```

## Step 6: Update Security Rules

1. Go to Firestore Database → Rules
2. Replace the default rules with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow read access to published apps
    match /apps/{appId} {
      allow read: if resource.data.status == 'published';
      allow write: if true; // For development - restrict in production
    }
    
    // Allow developer access
    match /developers/{developerId} {
      allow read, write: if true; // For development - restrict in production
    }
    
    // Allow payment access
    match /payments/{paymentId} {
      allow read, write: if true; // For development - restrict in production
    }
  }
}
```

3. Click "Publish"

## Step 7: Test Connection

After setting up everything, restart your application and check if the Firebase connection works.

## Troubleshooting

### Common Issues:

1. **Private Key Format**: Make sure the private key in your JSON has proper `\n` characters for line breaks.

2. **Environment Variable**: Make sure the entire JSON is properly escaped when setting as environment variable.

3. **Permissions**: Ensure the service account has Firestore permissions.

4. **Project ID**: Double-check the project ID matches in your Firebase console.

### If You Still Get Errors:

1. Check that Firestore is enabled in Firebase Console
2. Verify your service account has the correct permissions
3. Make sure you're using the correct project ID
4. Try regenerating the service account key

Once you complete these steps, let me know and I can help you test the connection!