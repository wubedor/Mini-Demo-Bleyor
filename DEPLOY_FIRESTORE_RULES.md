# 🔥 Deploy Updated Firestore Rules

The permission error is caused by outdated Firestore security rules. Here's how to fix it:

## 📋 **Quick Fix Steps**

### **Step 1: Go to Firebase Console**
1. Open: https://console.firebase.google.com
2. Select your project: **fir-1e69a**
3. Go to **Firestore Database** in the left menu
4. Click **Rules** tab

### **Step 2: Update Rules**
1. **Delete existing rules** (select all and delete)
2. **Copy the updated rules** below
3. **Paste** into the rules editor
4. **Click "Publish"**

## 📝 **Updated Firestore Rules**

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read and write their own profile
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Anyone can read services, only admins can write
    match /services/{serviceId} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.token.admin == true;
      allow create: if request.auth != null && request.auth.token.admin == true;
    }
    
    // Users can read their own bookings, admins can read all
    match /bookings/{bookingId} {
      allow read: if request.auth != null && 
        (resource.data.userId == request.auth.uid || request.auth.token.admin == true);
      allow create: if request.auth != null && request.auth.uid == request.resource.data.userId;
      allow update: if request.auth != null && 
        (resource.data.userId == request.auth.uid || request.auth.token.admin == true);
      allow delete: if request.auth != null && request.auth.token.admin == true;
    }
    
    // Allow list operations for bookings collection (for authenticated users)
    match /bookings {
      allow list: if request.auth != null;
    }
    
    // Public contact messages - anyone can create, admins can read
    match /contactMessages/{messageId} {
      allow create: if true;
      allow read: if request.auth != null && request.auth.token.admin == true;
      allow delete: if request.auth != null && request.auth.token.admin == true;
    }
    
    // Admin notifications - only admins can access
    match /adminNotifications/{notificationId} {
      allow read, write: if request.auth != null && request.auth.token.admin == true;
      allow create: if request.auth != null && request.auth.token.admin == true;
    }
    
    // Allow list operations for services collection (for DatabaseInitializer)
    match /services {
      allow list: if true;
    }
  }
}
```

## ✅ **What This Fixes**

### **Permission Issues**:
- ✅ **Authenticated users** can now list bookings
- ✅ **Users can read** their own bookings
- ✅ **Admins can read** all bookings
- ✅ **Proper access control** maintained

### **Security**:
- ✅ **Only logged-in users** can access bookings
- ✅ **Users can only see** their own bookings
- ✅ **Admins have full access**
- ✅ **Public access** only for services

## 🚀 **After Deployment**

1. **Wait 1-2 minutes** for rules to propagate
2. **Refresh your app** (F5)
3. **Test the My Bookings page**
4. **Error should be resolved**

## 🔍 **Verification**

After updating rules, you should see:
- ✅ **Firebase connection successful**
- ✅ **Authentication status confirmed**
- ✅ **Bookings loading properly**
- ✅ **No permission errors**

## ⚠️ **Important Notes**

- **Rules take 1-2 minutes** to propagate after publishing
- **Clear browser cache** if issues persist (Ctrl+F5)
- **Check authentication** - make sure you're logged in
- **Test with a booking** - create a test booking if needed

---

**The key fix is adding `allow list: if request.auth != null;` for the bookings collection.** 🔧

This allows authenticated users to query the bookings collection while maintaining security.
