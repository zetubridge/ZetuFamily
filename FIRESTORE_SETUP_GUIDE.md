# Complete Firestore Setup Guide for ZetuBridge

## Quick Start Instructions

Your ZetuBridge application is currently running with sample data. Follow these steps to connect it to Firebase Firestore:

### 1. Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create new project: `zetubridge-medical-apps`
3. Enable Google Analytics (optional)

### 2. Enable Firestore
1. Go to "Firestore Database" in your project
2. Click "Create database"
3. Start in "Test mode" 
4. Choose location closest to Kenya (e.g., `europe-west1`)

### 3. Create Collections and Documents

#### Collection: `developers`
Create a collection called `developers` with this sample document:

**Document ID:** `dev_med_a_team`
```json
{
  "email": "developer@med-a.com",
  "name": "MED-A Team", 
  "company": "Medical Education Solutions",
  "password": "$2b$10$example.hashed.password.string",
  "createdAt": "2025-01-04T10:00:00Z",
  "isVerified": true
}
```

#### Collection: `apps`
Create a collection called `apps` with this sample document:

**Document ID:** `app_med_a`
```json
{
  "name": "MED-A",
  "description": "Welcome to MED-A! Your go-to app for accessing past exam papers from Kenya Medical Training College (KMTC). Whether you're a KMTC student or enrolled in a private institution offering courses like nursing and more, MED-A is here to support your studies with valuable resources to help you succeed.",
  "category": "Medical Education",
  "logoUrl": "https://via.placeholder.com/120x120/4F46E5/ffffff?text=MED-A",
  "downloadUrl": "https://example.com/download/med-a.apk",
  "screenshots": [
    "https://via.placeholder.com/400x600/4F46E5/ffffff?text=Screenshot+1",
    "https://via.placeholder.com/400x600/4F46E5/ffffff?text=Screenshot+2",
    "https://via.placeholder.com/400x600/4F46E5/ffffff?text=Screenshot+3"
  ],
  "developerId": "dev_med_a_team",
  "developerName": "MED-A Team",
  "status": "published",
  "paymentStatus": "completed",
  "rating": 4.8,
  "downloads": 1250,
  "createdAt": "2025-01-04T10:00:00Z",
  "updatedAt": "2025-01-04T10:00:00Z"
}
```

#### Collection: `payments`
Create a collection called `payments` with this sample document:

**Document ID:** `payment_med_a`
```json
{
  "appId": "app_med_a",
  "developerId": "dev_med_a_team",
  "amount": 100000,
  "currency": "KES",
  "reference": "med-a-payment-001",
  "status": "completed",
  "paystackReference": "paystack-ref-001",
  "createdAt": "2025-01-04T10:00:00Z",
  "updatedAt": "2025-01-04T10:00:00Z"
}
```

### 4. Get Service Account Key
1. Go to Project Settings → Service Accounts
2. Click "Generate new private key"
3. Download the JSON file
4. Copy the entire JSON content

### 5. Set Environment Variable
Set the `FIREBASE_CONFIG` environment variable with your service account JSON:

```json
{
  "type": "service_account",
  "project_id": "your-project-id",
  "private_key_id": "your-key-id",
  "private_key": "-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY_HERE\n-----END PRIVATE KEY-----\n",
  "client_email": "firebase-adminsdk-xxxxx@your-project-id.iam.gserviceaccount.com",
  "client_id": "your-client-id",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-xxxxx%40your-project-id.iam.gserviceaccount.com"
}
```

### 6. Switch to Firebase Storage
Once Firebase is configured, update `server/storage.ts`:

```typescript
// Change from:
export const storage = new MockStorage();

// To:
export const storage = new FirebaseStorage();
```

### 7. Security Rules
Set these Firestore security rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /apps/{appId} {
      allow read: if resource.data.status == 'published';
      allow write: if true; // For development
    }
    
    match /developers/{developerId} {
      allow read, write: if true; // For development
    }
    
    match /payments/{paymentId} {
      allow read, write: if true; // For development
    }
  }
}
```

## Field Types Reference

### Developers Collection
- `email`: string
- `name`: string
- `company`: string (optional)
- `password`: string (hashed)
- `createdAt`: string (ISO date)
- `isVerified`: boolean

### Apps Collection
- `name`: string
- `description`: string
- `category`: string
- `logoUrl`: string (URL)
- `downloadUrl`: string (URL)
- `screenshots`: array of strings (URLs)
- `developerId`: string (reference to developer)
- `developerName`: string
- `status`: string ("pending", "published", "rejected")
- `paymentStatus`: string ("pending", "completed", "failed")
- `rating`: number (0-5)
- `downloads`: number
- `createdAt`: string (ISO date)
- `updatedAt`: string (ISO date)

### Payments Collection
- `appId`: string (reference to app)
- `developerId`: string (reference to developer)
- `amount`: number (in kobo, 100000 = KES 1,000)
- `currency`: string ("KES")
- `reference`: string (unique payment reference)
- `status`: string ("pending", "completed", "failed")
- `paystackReference`: string (Paystack transaction reference)
- `createdAt`: string (ISO date)
- `updatedAt`: string (ISO date)

## Testing the Connection

1. Follow the setup steps above
2. Set the environment variable
3. Switch to FirebaseStorage in the code
4. Restart the application
5. Visit the home page to see the MED-A app

## Current Status

✅ Application is running with sample data
✅ All UI components are working
✅ Payment integration is configured
✅ Admin and developer dashboards are functional
🔄 Waiting for Firebase configuration

The application is fully functional with mock data. Once you complete the Firebase setup, it will seamlessly switch to using your Firestore database.