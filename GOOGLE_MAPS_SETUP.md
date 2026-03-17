# Google Maps API Setup Guide

## 🚨 Current Issue: RefererNotAllowedMapError

The error `RefererNotAllowedMapError` means your Google Maps API key doesn't have the correct HTTP referrers (domains) authorized.

## 🔧 Quick Fix Steps

### 1. Go to Google Cloud Console
1. Visit: https://console.cloud.google.com/
2. Select your project (or create a new one)
3. Go to **APIs & Services** → **Credentials**

### 2. Edit Your API Key
1. Find your Maps API key (starts with `AIzaSy...`)
2. Click on the key name to edit it
3. Scroll down to **Application restrictions**
4. Select **HTTP referrers (web sites)**
5. Add the following referrers:

#### For Development:
```
http://localhost:3000/*
http://localhost:3001/*
http://127.0.0.1:3000/*
http://127.0.0.1:3001/*
```

#### For Production (when deployed):
```
https://yourdomain.com/*
https://your-firebase-project.web.app/*
https://your-firebase-project.firebaseapp.com/*
```

### 3. Enable Required APIs
Make sure these APIs are enabled in your project:
- ✅ **Maps JavaScript API**
- ✅ **Static Maps API** 
- ✅ **Geocoding API** (optional)
- ✅ **Places API** (optional)

### 4. Save and Test
1. Click **Save** at the bottom
2. Wait 2-5 minutes for changes to propagate
3. Restart your React app (`npm start`)
4. Test the map functionality

## 🚨 Alternative: Use No Restriction (Development Only)

If you're still having issues, temporarily remove all restrictions:

1. Edit your API key
2. Under **Application restrictions**, select **None**
3. Save and test
4. ⚠️ **Remember to add restrictions before production!**

## 📱 Testing Different Ports

If your app runs on a different port, add it to the list:
- `http://localhost:8080/*`
- `http://localhost:3002/*`
- etc.

## 🔍 Debugging Steps

1. **Check Console**: Look for specific error messages
2. **Verify API Key**: Ensure it matches your `.env` file
3. **Check Port**: Confirm your app's port number
4. **Wait Time**: API changes can take up to 5 minutes

## 🛡️ Security Best Practices

For production deployment:
- Use specific domain restrictions
- Enable API key restrictions
- Monitor API usage in the console
- Set up billing alerts

## 📞 If Issues Persist

1. Check if the API key is correctly copied
2. Verify all required APIs are enabled
3. Check your Google Cloud billing status
4. Try creating a new API key

## 🔄 After Fixing

Once the referrer issue is resolved:
1. The interactive map should load properly
2. Static map will still work as backup
3. All map features will be functional

---

**Note**: The app will automatically fall back to a static map if Google Maps fails to load, so your users will still see location information.
