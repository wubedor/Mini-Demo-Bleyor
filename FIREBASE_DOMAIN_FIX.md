# 🔥 Firebase Domain Authorization Fix - Quick Guide

## 🎯 **Your Error Message**
"Google sign-in is not authorized for this domain. This is a configuration issue that needs to be fixed in firebase console."

## 🚀 **Quick Fix Steps**

### **Step 1: Open Firebase Console**
1. **Go to**: https://console.firebase.google.com/
2. **Select your project**: `fir-1e69a`
3. **Navigate**: Authentication → Sign-in method

### **Step 2: Configure Google Sign-In**
1. **Click on "Google"** provider
2. **Make sure it's enabled** (toggle should be on)
3. **Scroll down** to "Authorized domains" section

### **Step 3: Add Your Domain**
1. **Click "Add domain"** button
2. **Add these domains** exactly:

```
localhost
127.0.0.1
10.170.45.252
*.localhost
```

3. **Click "Add"** for each domain
4. **Click "Save"** at the bottom

### **Step 4: Test Again**
1. **Wait 2-3 minutes** for Firebase to update
2. **Clear your phone browser cache**
3. **Try Google Sign-In** again

## 📱 **For Mobile Access**

### **Your Current IP**: `10.170.45.252`
This is the domain your phone is using to access the app.

### **Why This Happens**:
- Firebase only allows authorized domains for security
- Mobile devices access via IP address, not localhost
- Need to add your computer's IP to the authorized list

## 🔧 **Alternative: Use ngrok (If Above Doesn't Work)**

### **Install ngrok**:
```bash
npm install -g ngrok
```

### **Run ngrok**:
```bash
ngrok http 3000
```

### **Add ngrok URL**:
- Copy the ngrok URL (e.g., `https://abc123.ngrok.io`)
- Add it to Firebase authorized domains
- Update QR code to use ngrok URL

## ✅ **Verification**

### **Success Indicators**:
- ✅ No more "unauthorized domain" error
- ✅ Google Sign-In popup appears
- ✅ Successfully logged in with Google
- ✅ Redirected to home page

### **If Still Not Working**:
1. **Double-check domains** are added correctly
2. **Wait 5 minutes** for Firebase to update
3. **Try different browser** on phone
4. **Check console** for current domain message

## 🎯 **What to Add to Firebase Console**

### **Authorized Domains List**:
```
✓ localhost
✓ 127.0.0.1  
✓ 10.170.45.252
✓ *.localhost
```

### **How to Add**:
1. **Authentication** → **Sign-in method**
2. **Google** → **Authorized domains**
3. **Click "Add domain"**
4. **Type domain name**
5. **Click "Add"**
6. **Click "Save"**

## 📞 **Need Help?**

### **Check Console Logs**:
- Open browser console (F12)
- Look for: "Current domain: [domain-name]"
- Add that exact domain to Firebase

### **Contact Support**:
- Include the domain from console logs
- Mention you've added the domains above
- Describe any error messages you see

---

## 🎉 **Summary**

**The fix is simple:**
1. **Open Firebase Console** → Authentication → Sign-in method → Google
2. **Add these domains**: `localhost`, `127.0.0.1`, `10.170.45.252`
3. **Save and test** Google Sign-In

**After adding these domains, Google Sign-In will work perfectly on your phone!** 🚀✨
