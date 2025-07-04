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

**Step-by-Step Instructions:**

1. In Firebase Console, go to "Firestore Database"
2. Click "Start collection"
3. Enter collection name: `developers`
4. Click "Next"
5. Enter document ID: `dev_med_a_team`
6. Add fields one by one using the table below
7. Click "Save"
8. Repeat for `apps` and `payments` collections

#### Collection: `developers`
Create a collection called `developers` with this sample document:

**Document ID:** `dev_med_a_team`

| Field | Type | Value |
|-------|------|-------|
| `email` | **string** | `developer@med-a.com` |
| `name` | **string** | `MED-A Team` |
| `company` | **string** | `Medical Education Solutions` |
| `password` | **string** | `$2b$10$example.hashed.password.string` |
| `createdAt` | **timestamp** | `January 4, 2025 at 10:00:00 AM UTC+3` |
| `isVerified` | **boolean** | `true` |

#### Collection: `apps`
Create a collection called `apps` with this sample document:

**Document ID:** `app_med_a`

| Field | Type | Value |
|-------|------|-------|
| `name` | **string** | `MED-A` |
| `description` | **string** | `Welcome to MED-A! Your go-to app for accessing past exam papers from Kenya Medical Training College (KMTC). Whether you're a KMTC student or enrolled in a private institution offering courses like nursing and more, MED-A is here to support your studies with valuable resources to help you succeed.` |
| `category` | **string** | `Medical Education` |
| `logoUrl` | **string** | `https://via.placeholder.com/120x120/4F46E5/ffffff?text=MED-A` |
| `downloadUrl` | **string** | `https://example.com/download/med-a.apk` |
| `screenshots` | **array** | Add array with these string values:<br/>• `https://via.placeholder.com/400x600/4F46E5/ffffff?text=Screenshot+1`<br/>• `https://via.placeholder.com/400x600/4F46E5/ffffff?text=Screenshot+2`<br/>• `https://via.placeholder.com/400x600/4F46E5/ffffff?text=Screenshot+3` |
| `developerId` | **string** | `dev_med_a_team` |
| `developerName` | **string** | `MED-A Team` |
| `status` | **string** | `published` |
| `paymentStatus` | **string** | `completed` |
| `rating` | **number** | `4.8` |
| `downloads` | **number** | `1250` |
| `createdAt` | **timestamp** | `January 4, 2025 at 10:00:00 AM UTC+3` |
| `updatedAt` | **timestamp** | `January 4, 2025 at 10:00:00 AM UTC+3` |

#### Collection: `payments`
Create a collection called `payments` with this sample document:

**Document ID:** `payment_med_a`

| Field | Type | Value |
|-------|------|-------|
| `appId` | **string** | `app_med_a` |
| `developerId` | **string** | `dev_med_a_team` |
| `amount` | **number** | `100000` |
| `currency` | **string** | `KES` |
| `reference` | **string** | `med-a-payment-001` |
| `status` | **string** | `completed` |
| `paystackReference` | **string** | `paystack-ref-001` |
| `createdAt` | **timestamp** | `January 4, 2025 at 10:00:00 AM UTC+3` |
| `updatedAt` | **timestamp** | `January 4, 2025 at 10:00:00 AM UTC+3` |

## How to Add Each Field Type in Firebase Console

### Adding String Fields:
1. Click "Add field"
2. Enter field name (e.g., `email`)
3. Select type: **string**
4. Enter the value
5. Click "Update"

### Adding Number Fields:
1. Click "Add field"
2. Enter field name (e.g., `rating`)
3. Select type: **number**
4. Enter the numeric value (e.g., `4.8`)
5. Click "Update"

### Adding Boolean Fields:
1. Click "Add field"
2. Enter field name (e.g., `isVerified`)
3. Select type: **boolean**
4. Choose `true` or `false`
5. Click "Update"

### Adding Timestamp Fields:
1. Click "Add field"
2. Enter field name (e.g., `createdAt`)
3. Select type: **timestamp**
4. Click the calendar icon to set date and time
5. Set to: January 4, 2025 at 10:00:00 AM UTC+3
6. Click "Update"

### Adding Array Fields (for screenshots):
1. Click "Add field"
2. Enter field name: `screenshots`
3. Select type: **array**
4. Click "Add item" for each screenshot URL
5. For each item, select type: **string**
6. Enter the URL values:
   - `https://via.placeholder.com/400x600/4F46E5/ffffff?text=Screenshot+1`
   - `https://via.placeholder.com/400x600/4F46E5/ffffff?text=Screenshot+2`
   - `https://via.placeholder.com/400x600/4F46E5/ffffff?text=Screenshot+3`
7. Click "Update"

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

## Important Notes

### Data Types in Firebase Console:
- **string**: Text fields
- **number**: Numeric values (integers and decimals)
- **boolean**: true/false values
- **timestamp**: Date and time values
- **array**: List of items (each item can be string, number, etc.)

### Special Values:
- **Amount**: Always in kobo (100000 = KES 1,000)
- **Password**: Must be hashed with bcrypt
- **URLs**: Use full URLs starting with https://
- **Status fields**: Must match exact values ("pending", "published", "rejected")

### Creating Collections Order:
1. Create `developers` collection first
2. Create `apps` collection (references developers)
3. Create `payments` collection (references both apps and developers)

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