# 🔥 Add Correct Domain to Firebase Console - Step by Step

## 🎯 **Goal**
Fix "Google sign-in is not authorized for this domain" error by adding your domain to Firebase Authentication settings.

## 📱 **Step 1: Find Your Current Domain**

### **Method 1: Check Terminal QR Code**
Look at your terminal when you run `yarn start`:
```
🌐 Local IP: 10.170.45.252
🚀 Port: 3000
```
**Your domain is**: `10.170.45.252`

### **Method 2: Check Browser Console**
1. Open your app on phone
2. Open browser console (Chrome: Menu → More → Tools → Developer Tools)
3. Look for: `Current domain: [domain-name]`

### **Method 3: Check URL**
Your phone's URL bar shows: `http://10.170.45.252:3000`
**Domain is**: `10.170.45.252`

## 🔥 **Step 2: Open Firebase Console**

### **Direct Link**:
https://console.firebase.google.com/

### **Steps**:
1. **Click the link above**
2. **Sign in** to your Google account
3. **Select project**: `fir-1e69a`
4. **Click "Authentication"** in the left sidebar
5. **Click "Sign-in method"** tab

## ⚙️ **Step 3: Configure Google Sign-In**

### **Find Google Provider**:
1. **Scroll down** to "Sign-in providers" section
2. **Click on "Google"** (it should be enabled)
3. **Look for "Authorized domains"** section

### **What You'll See**:
```
Authorized domains
[Add domain] button
├── localhost (if already added)
└── [Add new domain]
```

## ➕ **Step 4: Add Your Domain**

### **Click "Add domain"** and add these exactly:

#### **Primary Domain (Most Important)**:
```
10.170.45.252
```

#### **Additional Domains (Recommended)**:
```
localhost
127.0.0.1
*.localhost
```

### **How to Add Each Domain**:
1. **Type domain name** in the input field
2. **Click "Add"** button
3. **Repeat** for each domain

### **Final List Should Look Like**:
```
Authorized domains
✓ localhost
✓ 127.0.0.1
✓ 10.170.45.252
✓ *.localhost
```

## 💾 **Step 5: Save Changes**

### **Important**:
1. **Scroll to bottom** of the Google provider settings
2. **Click "Save"** button
3. **Wait for success message**: "Google provider updated successfully"

## ⏱️ **Step 6: Wait for Propagation**

### **Firebase Update Time**:
- **Wait 2-3 minutes** for changes to take effect
- **Firebase needs time** to update authentication settings
- **Don't test immediately** after saving

## 🧪 **Step 7: Test Google Sign-In**

### **Testing Steps**:
1. **Clear phone browser cache**
2. **Open your app** on phone
3. **Click "Sign in with Google"**
4. **Should work now** - no more domain error!

### **Expected Result**:
```
✅ Google Sign-In popup appears
✅ Select your Google account
✅ Successfully logged in
✅ Redirected to home page
```

## 🔍 **Troubleshooting**

### **If Still Not Working**:
1. **Double-check domain spelling** in Firebase Console
2. **Wait 5 more minutes** for Firebase to update
3. **Clear browser cache** on phone
4. **Check console** for current domain message

### **Common Mistakes**:
- ❌ Adding `http://10.170.45.252:3000` (add only `10.170.45.252`)
- ❌ Forgetting to click "Save"
- ❌ Not waiting for Firebase to update
- ❌ Adding wrong IP address

## 📊 **Verification Checklist**

### **Before Testing**:
- [ ] Firebase Console opened
- [ ] Project `fir-1e69a` selected
- [ ] Authentication → Sign-in method → Google opened
- [ ] Domains added: `10.170.45.252`, `localhost`, `127.0.0.1`
- [ ] Changes saved
- [ ] Waited 3 minutes

### **After Testing**:
- [ ] Google Sign-In works
- [ ] No domain error message
- [ ] Successfully logged in
- [ ] Redirected to home page

## 🎯 **Quick Reference**

### **Domains to Add**:
```
10.170.45.252
localhost
127.0.0.1
*.localhost
```

### **Firebase Console Path**:
```
Firebase Console → Authentication → Sign-in method → Google → Authorized domains
```

### **Save Button Location**:
```
Bottom of Google provider settings page
```

## 🚀 **Success Indicators**

### **You'll Know It Worked When**:
✅ No more "unauthorized domain" error  
✅ Google Sign-In popup appears immediately  
✅ You can select your Google account  
✅ Login completes successfully  
✅ App redirects to home page  

---

## 🎉 **Final Step**

**After adding `10.170.45.252` to Firebase authorized domains and saving, Google Sign-In will work perfectly on your phone!**

**The fix is instant once Firebase updates (2-3 minutes).** 🚀✨
