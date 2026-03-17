# 🗺️ Google Maps Fix Checklist

## ✅ Step 1: Access Google Cloud Console
1. Open: https://console.cloud.google.com/
2. Sign in with your Google account
3. Select your project (likely the one with your Firebase project)

## ✅ Step 2: Navigate to Credentials
1. In the left menu, go to **APIs & Services** → **Credentials**
2. Look for your Maps API key (starts with `AIzaSyBN6liH_bwAewQTeM-3DeF1MUZdcPMjwxg`)

## ✅ Step 3: Edit API Key Restrictions
1. Click on the API key name to edit it
2. Scroll down to **Application restrictions**
3. Select **HTTP referrers (web sites)**
4. Click **+ ADD ITEM** and add these referrers:

```
http://localhost:3000/*
http://localhost:3001/*
http://127.0.0.1:3000/*
http://127.0.0.1:3001/*
```

## ✅ Step 4: Verify APIs Enabled
Make sure these are enabled in **APIs & Services** → **Library**:
- ✅ Maps JavaScript API
- ✅ Static Maps API
- ✅ Places API

## ✅ Step 5: Save and Wait
1. Click **Save** at the bottom
2. Wait 2-5 minutes for changes to propagate

## ✅ Step 6: Test
1. Restart your React app
2. Navigate to the location page
3. Check if the map loads properly

---

## 🚨 If Still Not Working

### Option A: Remove Restrictions (Temporary)
1. Edit API key again
2. Set **Application restrictions** to **None**
3. Save and test
4. ⚠️ Remember to add restrictions before production!

### Option B: Create New API Key
1. Click **+ CREATE CREDENTIALS** → **API key**
2. Copy the new key
3. Update your `.env` file
4. Add referrer restrictions
5. Restart app

---

## 🔍 Debugging Tips

- Check browser console for specific error messages
- Verify the port number your app is running on
- Make sure billing is enabled in your Google Cloud project
- API changes can take up to 5 minutes to take effect

## 📞 Current Status

- ✅ App code is properly configured
- ✅ Fallback static map is working
- ⏳ Waiting for API key referrers to be updated
- 🔄 Ready to test after Google Cloud Console updates
