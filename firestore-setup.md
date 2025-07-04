# Firestore Database Setup Guide for ZetuBridge

## Collections Structure

### 1. `developers` Collection
This stores developer account information.

**Collection Path:** `developers`

**Document Structure:**
```json
{
  "id": "auto-generated-document-id",
  "email": "developer@example.com",
  "name": "Developer Name",
  "company": "Company Name (optional)",
  "password": "hashed-password-string",
  "createdAt": "2025-01-04T10:00:00Z",
  "isVerified": true
}
```

**Sample Documents:**
- Document ID: `dev_001`
- Document ID: `dev_002`

### 2. `apps` Collection
This stores all published and pending apps.

**Collection Path:** `apps`

**Document Structure:**
```json
{
  "id": "auto-generated-document-id",
  "name": "App Name",
  "description": "App description text",
  "category": "Medical Education",
  "logoUrl": "https://example.com/logo.png",
  "downloadUrl": "https://example.com/download/app.apk",
  "screenshots": [
    "https://example.com/screenshot1.png",
    "https://example.com/screenshot2.png"
  ],
  "developerId": "reference-to-developer-document",
  "developerName": "Developer Name",
  "status": "published", // or "pending" or "rejected"
  "paymentStatus": "completed", // or "pending" or "failed"
  "rating": 4.5,
  "downloads": 1250,
  "createdAt": "2025-01-04T10:00:00Z",
  "updatedAt": "2025-01-04T10:00:00Z"
}
```

**Sample Documents:**
- Document ID: `app_001` (MED-A app)
- Document ID: `app_002` (Future apps)

### 3. `payments` Collection
This stores payment transaction records.

**Collection Path:** `payments`

**Document Structure:**
```json
{
  "id": "auto-generated-document-id",
  "appId": "reference-to-app-document",
  "developerId": "reference-to-developer-document",
  "amount": 100000, // Amount in kobo (KES 1,000 = 100000 kobo)
  "currency": "KES",
  "reference": "unique-payment-reference",
  "status": "completed", // or "pending" or "failed"
  "paystackReference": "paystack-transaction-reference",
  "createdAt": "2025-01-04T10:00:00Z",
  "updatedAt": "2025-01-04T10:00:00Z"
}
```

## How to Set Up in Firebase Console

### Step 1: Create Collections
1. Go to Firebase Console → Firestore Database
2. Click "Start collection"
3. Create these collections:
   - `developers`
   - `apps`
   - `payments`

### Step 2: Add Sample Data

#### For `developers` collection:
```json
// Document ID: dev_med_a_team
{
  "email": "developer@med-a.com",
  "name": "MED-A Team",
  "company": "Medical Education Solutions",
  "password": "$2b$10$example-hashed-password",
  "createdAt": "2025-01-04T10:00:00Z",
  "isVerified": true
}
```

#### For `apps` collection:
```json
// Document ID: app_med_a
{
  "name": "MED-A",
  "description": "Welcome to MED-A! Your go-to app for accessing past exam papers from Kenya Medical Training College (KMTC). Whether you're a KMTC student or enrolled in a private institution offering courses like nursing and more, MED-A is here to support your studies with valuable resources to help you succeed.",
  "category": "Medical Education",
  "logoUrl": "https://via.placeholder.com/120x120/4F46E5/ffffff?text=MED-A",
  "downloadUrl": "https://example.com/download/med-a.apk",
  "screenshots": [
    "https://via.placeholder.com/400x600/4F46E5/ffffff?text=Screenshot+1",
    "https://via.placeholder.com/400x600/4F46E5/ffffff?text=Screenshot+2"
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

## Security Rules

Add these security rules to protect your data:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow read access to published apps
    match /apps/{appId} {
      allow read: if resource.data.status == 'published';
      allow write: if request.auth != null;
    }
    
    // Restrict developer access
    match /developers/{developerId} {
      allow read, write: if request.auth != null;
    }
    
    // Restrict payment access
    match /payments/{paymentId} {
      allow read, write: if request.auth != null;
    }
  }
}
```

## Environment Variables Needed

Make sure you have these environment variables set:

```
FIREBASE_CONFIG={"your":"firebase","config":"object"}
```

Or alternatively:

```
FIREBASE_SERVICE_ACCOUNT={"your":"service","account":"json"}
```