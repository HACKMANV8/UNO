# Kriti Chrome Extension - Installation & Testing Guide

## 🚀 Quick Installation

1. **Remove Old Extension** (if installed):
   - Go to `chrome://extensions/`
   - Find "Kriti Job Auto-Fill" and click "Remove"

2. **Install New Version**:
   - Go to `chrome://extensions/`
   - Enable "Developer mode" (top right toggle)
   - Click "Load unpacked"
   - Select this `chrome-extension` folder
   - Extension should install without errors!

## 🧪 Testing Steps

### Step 1: Test Basic Loading
- Extension should appear in toolbar (puzzle piece icon if no custom icon)
- No errors in `chrome://extensions/` page
- No console errors

### Step 2: Test Login
1. Click the extension icon
2. Enter your Kriti credentials:
   - Email: Your Kriti account email
   - Password: Your Kriti account password
3. Click "Login"
4. Should show user dashboard with your name

### Step 3: Test Form Detection
1. Open `test-form.html` in Chrome
2. Click extension icon → "Detect Forms"
3. Should show "Found 1 compatible form(s)"

### Step 4: Test Auto-Fill
1. On `test-form.html`, click extension icon → "Fill Current Page"
2. Form fields should auto-populate with your data
3. Fields should turn light green when filled

### Step 5: Test Floating Button
1. Visit job sites like LinkedIn, Indeed, etc.
2. Should see floating 🎓 button (bottom right)
3. Click it to auto-fill forms on that page

## 🔧 Troubleshooting

### Extension Won't Install
- Make sure you're in Developer mode
- Try refreshing the extensions page
- Check Chrome console for errors

### Login Fails
- Verify your Kriti account credentials
- Check internet connection
- Make sure you have data in Firestore

### Auto-Fill Not Working
- Login first through extension popup
- Make sure you're on a page with forms
- Check if your profile data is complete

### Console Errors
- Open Chrome DevTools (F12)
- Check Console and Network tabs
- Look for specific error messages

## 📊 Firebase Data Requirements

For best auto-fill results, ensure your Firestore has:

### Collection: `users/{userId}`
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+1234567890",
  "role": "student"
}
```

### Collection: `resumes/{userId}` (Optional)
```json
{
  "personalInfo": {
    "fullName": "John Doe",
    "email": "john@example.com",
    "phone": "+1234567890",
    "location": "New York, NY, USA",
    "summary": "Experienced software developer..."
  },
  "experience": [
    {
      "company": "Tech Corp",
      "position": "Software Developer",
      "startDate": "2022-01-01",
      "endDate": null
    }
  ],
  "education": [
    {
      "institution": "University Name",
      "degree": "Computer Science",
      "graduationDate": "2021-05-01"
    }
  ],
  "skills": ["JavaScript", "React", "Node.js"]
}
```

## 🎯 Success Indicators

✅ Extension loads without errors
✅ Login works with your credentials
✅ User data appears in popup
✅ Forms are detected on job sites
✅ Auto-fill populates form fields
✅ Floating button appears on job sites

## 📞 Support

If issues persist:
1. Check Chrome DevTools console for errors
2. Verify your Firebase data structure
3. Ensure you're using the latest Chrome version
4. Try removing and reinstalling the extension

---

**Ready to use!** The extension should now work perfectly with your Firebase credentials. 🎉