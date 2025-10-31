# Kriti Job Auto-Fill Chrome Extension

This Chrome extension automatically fills job application forms using your verified credentials stored in Firebase Firestore.

## Features

- 🔐 **Secure Login**: Uses your existing Kriti account credentials
- 🚀 **Auto-Fill**: Automatically detects and fills job application forms
- 🎯 **Smart Detection**: Recognizes various job sites and form patterns
- 📝 **Resume Integration**: Uses your stored resume data for comprehensive filling
- 🔍 **Form Detection**: Shows how many compatible forms are on a page
- 💾 **Offline Storage**: Caches your data locally for faster filling

## Supported Job Sites

- LinkedIn
- Indeed
- Naukri.com
- Glassdoor
- Monster
- Dice
- ZipRecruiter
- Simply Hired
- CareerBuilder
- And many more general job sites

## Installation

1. **Download the Extension**:
   - Download all files from the `chrome-extension` folder
   - Keep all files in the same directory

2. **Install in Chrome**:
   - Open Chrome and go to `chrome://extensions/`
   - Enable "Developer mode" (toggle in top right)
   - Click "Load unpacked"
   - Select the `chrome-extension` folder
   - The extension should now appear in your extensions list

## Setup

1. **Login**:
   - Click the extension icon in your Chrome toolbar
   - Enter your Kriti account email and password
   - Click "Login"

2. **Data Sync**:
   - The extension will automatically fetch your profile data from Firebase
   - Your resume data will be used for auto-filling forms

## Usage

### Method 1: Extension Popup
1. Go to any job site with application forms
2. Click the Kriti extension icon
3. Click "Fill Current Page" to auto-fill detected forms
4. Or click "Detect Forms" to see how many forms are available

### Method 2: Floating Button
1. On job sites, you'll see a floating 🎓 button in the bottom-right corner
2. This provides quick access to auto-fill functionality

## Data Fields Supported

The extension can automatically fill the following types of fields:

### Personal Information
- ✅ First Name
- ✅ Last Name
- ✅ Full Name
- ✅ Email Address
- ✅ Phone Number
- ✅ Address/Location
- ✅ City, State, ZIP Code
- ✅ Country

### Professional Information
- ✅ Years of Experience
- ✅ Current Position/Job Title
- ✅ Current Company
- ✅ Work Experience Summary

### Education
- ✅ Highest Degree
- ✅ University/Institution
- ✅ Graduation Year

### Skills & Summary
- ✅ Skills List
- ✅ Professional Summary
- ✅ Cover Letter Template

## Security & Privacy

- 🔒 **Local Storage**: Your data is cached locally in Chrome's secure storage
- 🔐 **Firebase Security**: Uses Firebase's built-in security rules
- 🚫 **No External Sharing**: Your data is never shared with third parties
- 🔄 **Secure Sync**: Data is synced directly from your Firebase account

## Troubleshooting

### Extension Not Working
1. Check if you're logged in (extension icon should show user info)
2. Refresh the page and try again
3. Check if the site has job application forms
4. Try clicking "Detect Forms" to see if forms are found

### Login Issues
1. Verify your email and password are correct
2. Ensure you have a Kriti account with profile data
3. Check your internet connection
4. Try logging out and logging back in

### Auto-Fill Not Working
1. Make sure you're on a page with job application forms
2. Some fields may require manual filling (salary, sensitive info)
3. Complex forms might need manual adjustment after auto-fill
4. Try clicking "Refresh Data" to update your profile information

### Missing Data
1. Go to your Kriti web dashboard and complete your profile
2. Add resume information including experience and education
3. Click "Refresh Data" in the extension
4. Some fields might be left empty if data isn't available

## Data Requirements

For best results, ensure your Kriti account has:

1. **Complete Profile**:
   - Name
   - Email (automatically available)
   - Phone number
   - Location/Address

2. **Resume Data**:
   - Work experience with companies, positions, and dates
   - Education with degrees, institutions, and graduation dates
   - Skills list
   - Professional summary

3. **Personal Information**:
   - Full contact details
   - Current employment information

## Limitations

- 🚫 **Sensitive Data**: Salary information is not auto-filled for privacy
- 📱 **Mobile Sites**: Works best on desktop versions of job sites
- 🔧 **Complex Forms**: Some advanced forms may require manual adjustment
- 🌐 **JavaScript-Heavy Sites**: Some modern SPA sites might need page refresh

## Support

If you encounter issues:

1. Check the browser console for error messages
2. Ensure your Kriti account has complete profile data
3. Verify you're using the latest version of Chrome
4. Some sites may have anti-automation measures

## Free Firebase Usage

This extension is designed to work within Firebase's free tier limits:

- **Firestore**: 50k reads/writes per day
- **Authentication**: Unlimited for email/password
- **Storage**: 1GB total storage

For normal usage, these limits are more than sufficient.

## Version History

### v1.0.0
- Initial release
- Basic auto-fill functionality
- Firebase integration
- Support for major job sites
- Secure login and data caching