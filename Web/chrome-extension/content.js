// Content script for auto-filling job application forms
(function() {
  'use strict';

  let userData = null;
  let resumeData = null;

  // Initialize content script
  chrome.storage.local.get(['kritiUserData', 'kritiResumeData'], (result) => {
    userData = result.kritiUserData;
    resumeData = result.kritiResumeData;
  });

  // Listen for messages from popup
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'autoFillPage') {
      autoFillCurrentPage(sendResponse);
      return true; // Will respond asynchronously
    } else if (request.action === 'detectForms') {
      detectForms(sendResponse);
      return true; // Will respond asynchronously
    }
  });

  // Storage change listener to update local data
  chrome.storage.onChanged.addListener((changes) => {
    if (changes.kritiUserData) {
      userData = changes.kritiUserData.newValue;
    }
    if (changes.kritiResumeData) {
      resumeData = changes.kritiResumeData.newValue;
    }
  });

  function autoFillCurrentPage(sendResponse) {
    if (!userData) {
      sendResponse({ success: false, message: 'User data not available. Please login first.' });
      return;
    }

    const forms = detectJobApplicationForms();
    
    if (forms.length === 0) {
      sendResponse({ success: false, message: 'No compatible job application forms found on this page.' });
      return;
    }

    let filledForms = 0;
    
    forms.forEach(form => {
      if (fillForm(form)) {
        filledForms++;
      }
    });

    if (filledForms > 0) {
      sendResponse({ 
        success: true, 
        message: `Successfully filled ${filledForms} form(s)` 
      });
    } else {
      sendResponse({ 
        success: false, 
        message: 'Found forms but could not fill any fields' 
      });
    }
  }

  function detectForms(sendResponse) {
    const forms = detectJobApplicationForms();
    sendResponse({ 
      success: true, 
      forms: forms.map(form => ({
        id: form.id || form.className || 'unnamed',
        fields: getFormFields(form).length
      }))
    });
  }

  function detectJobApplicationForms() {
    const forms = document.querySelectorAll('form');
    const jobForms = [];

    forms.forEach(form => {
      const formText = form.innerText.toLowerCase();
      const formHtml = form.innerHTML.toLowerCase();
      
      // Check if form looks like a job application
      const jobKeywords = [
        'application', 'apply', 'job', 'career', 'position', 'resume', 'cv',
        'first name', 'last name', 'email', 'phone', 'experience',
        'education', 'skills', 'cover letter', 'employment', 'work'
      ];

      const hasJobKeywords = jobKeywords.some(keyword => 
        formText.includes(keyword) || formHtml.includes(keyword)
      );

      // Check for common job application field patterns
      const nameFields = form.querySelectorAll('input[name*="name"], input[id*="name"], input[placeholder*="name"]');
      const emailFields = form.querySelectorAll('input[type="email"], input[name*="email"], input[id*="email"]');
      const phoneFields = form.querySelectorAll('input[type="tel"], input[name*="phone"], input[id*="phone"]');

      if (hasJobKeywords || (nameFields.length > 0 && emailFields.length > 0)) {
        jobForms.push(form);
      }
    });

    return jobForms;
  }

  function getFormFields(form) {
    return form.querySelectorAll('input, textarea, select');
  }

  function fillForm(form) {
    let filledFields = 0;
    const fields = getFormFields(form);

    fields.forEach(field => {
      if (fillField(field)) {
        filledFields++;
      }
    });

    return filledFields > 0;
  }

  function fillField(field) {
    if (field.disabled || field.readonly || field.type === 'hidden') {
      return false;
    }

    const fieldInfo = getFieldInfo(field);
    const value = getValueForField(fieldInfo);

    if (value) {
      setFieldValue(field, value);
      return true;
    }

    return false;
  }

  function getFieldInfo(field) {
    const name = (field.name || '').toLowerCase();
    const id = (field.id || '').toLowerCase();
    const placeholder = (field.placeholder || '').toLowerCase();
    const label = getFieldLabel(field).toLowerCase();
    const type = field.type || field.tagName.toLowerCase();

    return {
      element: field,
      name,
      id,
      placeholder,
      label,
      type,
      allText: `${name} ${id} ${placeholder} ${label}`.toLowerCase()
    };
  }

  function getFieldLabel(field) {
    // Try to find associated label
    if (field.id) {
      const label = document.querySelector(`label[for="${field.id}"]`);
      if (label) return label.innerText;
    }

    // Look for parent label
    const parentLabel = field.closest('label');
    if (parentLabel) return parentLabel.innerText;

    // Look for preceding text
    const prevSibling = field.previousElementSibling;
    if (prevSibling && (prevSibling.tagName === 'LABEL' || prevSibling.tagName === 'SPAN' || prevSibling.tagName === 'DIV')) {
      return prevSibling.innerText;
    }

    return '';
  }

  function getValueForField(fieldInfo) {
    const text = fieldInfo.allText;

    // Personal Information
    if (isMatch(text, ['first name', 'firstname', 'fname', 'given name'])) {
      return getFirstName();
    }
    
    if (isMatch(text, ['last name', 'lastname', 'lname', 'surname', 'family name'])) {
      return getLastName();
    }
    
    if (isMatch(text, ['full name', 'fullname', 'name', 'your name']) && 
        !isMatch(text, ['first', 'last', 'company', 'organization'])) {
      return getFullName();
    }

    if (isMatch(text, ['email', 'e-mail', 'email address', 'mail'])) {
      return userData?.email || '';
    }

    if (isMatch(text, ['phone', 'telephone', 'mobile', 'contact', 'number']) && 
        !isMatch(text, ['emergency', 'reference'])) {
      return userData?.phone || resumeData?.personalInfo?.phone || '';
    }

    // Address fields
    if (isMatch(text, ['address', 'street', 'location']) && 
        !isMatch(text, ['email', 'web'])) {
      return resumeData?.personalInfo?.location || '';
    }

    if (isMatch(text, ['city'])) {
      const location = resumeData?.personalInfo?.location || '';
      return location.split(',')[0]?.trim() || '';
    }

    if (isMatch(text, ['state', 'province'])) {
      const location = resumeData?.personalInfo?.location || '';
      return location.split(',')[1]?.trim() || '';
    }

    if (isMatch(text, ['zip', 'postal', 'pincode'])) {
      const location = resumeData?.personalInfo?.location || '';
      const parts = location.split(',');
      return parts[parts.length - 1]?.trim() || '';
    }

    if (isMatch(text, ['country'])) {
      return 'India'; // Default country
    }

    // Professional Information
    if (isMatch(text, ['experience', 'years of experience', 'work experience']) && fieldInfo.type !== 'textarea') {
      return getYearsOfExperience();
    }

    if (isMatch(text, ['current', 'present']) && isMatch(text, ['position', 'job', 'title', 'role'])) {
      return getCurrentPosition();
    }

    if (isMatch(text, ['company', 'employer', 'organization']) && !isMatch(text, ['previous', 'last'])) {
      return getCurrentCompany();
    }

    if (isMatch(text, ['salary', 'compensation', 'expected salary', 'current salary'])) {
      return ''; // Sensitive information - let user fill manually
    }

    // Education
    if (isMatch(text, ['degree', 'qualification', 'education'])) {
      return getHighestDegree();
    }

    if (isMatch(text, ['university', 'college', 'school', 'institution'])) {
      return getLatestInstitution();
    }

    if (isMatch(text, ['graduation', 'completed', 'passing year'])) {
      return getGraduationYear();
    }

    // Skills and Summary
    if (isMatch(text, ['skills', 'expertise', 'competencies']) && fieldInfo.type === 'textarea') {
      return getSkillsText();
    }

    if (isMatch(text, ['summary', 'objective', 'about', 'profile', 'bio']) && fieldInfo.type === 'textarea') {
      return resumeData?.personalInfo?.summary || '';
    }

    if (isMatch(text, ['cover letter', 'message', 'why']) && fieldInfo.type === 'textarea') {
      return generateCoverLetterTemplate();
    }

    // LinkedIn/Portfolio
    if (isMatch(text, ['linkedin', 'linked in'])) {
      return ''; // User should fill manually
    }

    if (isMatch(text, ['portfolio', 'website', 'github'])) {
      return ''; // User should fill manually
    }

    return null;
  }

  function isMatch(text, keywords) {
    return keywords.some(keyword => text.includes(keyword));
  }

  function getFirstName() {
    const fullName = userData?.name || '';
    return fullName.split(' ')[0] || '';
  }

  function getLastName() {
    const fullName = userData?.name || '';
    const parts = fullName.split(' ');
    return parts.length > 1 ? parts[parts.length - 1] : '';
  }

  function getFullName() {
    return userData?.name || '';
  }

  function getYearsOfExperience() {
    if (!resumeData?.experience?.length) return '0';
    
    let totalMonths = 0;
    resumeData.experience.forEach(exp => {
      const start = new Date(exp.startDate);
      const end = exp.endDate ? new Date(exp.endDate) : new Date();
      const months = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
      totalMonths += Math.max(0, months);
    });

    return Math.floor(totalMonths / 12).toString();
  }

  function getCurrentPosition() {
    if (!resumeData?.experience?.length) return '';
    
    // Find current position (no end date or most recent)
    const currentExp = resumeData.experience.find(exp => !exp.endDate) || 
                      resumeData.experience[0]; // Assuming sorted by recency
    
    return currentExp?.position || '';
  }

  function getCurrentCompany() {
    if (!resumeData?.experience?.length) return '';
    
    const currentExp = resumeData.experience.find(exp => !exp.endDate) || 
                      resumeData.experience[0];
    
    return currentExp?.company || '';
  }

  function getHighestDegree() {
    if (!resumeData?.education?.length) return '';
    
    // Return the first/highest degree
    return resumeData.education[0]?.degree || '';
  }

  function getLatestInstitution() {
    if (!resumeData?.education?.length) return '';
    
    return resumeData.education[0]?.institution || '';
  }

  function getGraduationYear() {
    if (!resumeData?.education?.length) return '';
    
    const gradDate = resumeData.education[0]?.graduationDate;
    if (gradDate) {
      return new Date(gradDate).getFullYear().toString();
    }
    return '';
  }

  function getSkillsText() {
    if (!resumeData?.skills?.length) return '';
    
    return resumeData.skills.join(', ');
  }

  function generateCoverLetterTemplate() {
    const name = getFullName();
    const position = getCurrentPosition();
    
    return `Dear Hiring Manager,\n\nI am writing to express my interest in this position. ${position ? `As a ${position}, ` : ''}I believe my skills and experience make me a strong candidate for this role.\n\nI look forward to discussing my qualifications further.\n\nBest regards,\n${name}`;
  }

  function setFieldValue(field, value) {
    if (field.tagName === 'SELECT') {
      // For select elements, try to find matching option
      const options = Array.from(field.options);
      const matchingOption = options.find(option => 
        option.text.toLowerCase().includes(value.toLowerCase()) ||
        option.value.toLowerCase().includes(value.toLowerCase())
      );
      
      if (matchingOption) {
        field.value = matchingOption.value;
      }
    } else {
      // For input and textarea elements
      field.value = value;
    }

    // Trigger change events
    field.dispatchEvent(new Event('input', { bubbles: true }));
    field.dispatchEvent(new Event('change', { bubbles: true }));
    field.dispatchEvent(new Event('blur', { bubbles: true }));

    // Add visual feedback
    field.style.backgroundColor = '#e8f5e8';
    setTimeout(() => {
      field.style.backgroundColor = '';
    }, 2000);
  }

  // Add floating action button for quick access
  function createFloatingButton() {
    // Remove existing button if any
    const existingButton = document.getElementById('kriti-autofill-button');
    if (existingButton) {
      existingButton.remove();
    }

    // Check if user is logged in before showing button
    chrome.storage.local.get(['kritiUser'], (result) => {
      if (!result.kritiUser) return; // Don't show button if not logged in
      
      const button = document.createElement('button');
      button.id = 'kriti-autofill-button';
      button.innerHTML = '🎓';
      button.title = 'Kriti Auto-Fill';
      button.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        width: 56px;
        height: 56px;
        border-radius: 50%;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        border: none;
        font-size: 24px;
        cursor: pointer;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        z-index: 10000;
        transition: all 0.3s ease;
      `;

      button.addEventListener('mouseenter', () => {
        button.style.transform = 'scale(1.1)';
      });

      button.addEventListener('mouseleave', () => {
        button.style.transform = 'scale(1)';
      });

      button.addEventListener('click', () => {
        autoFillCurrentPage((result) => {
          // Show result in a small notification
          const notification = document.createElement('div');
          notification.textContent = result.success ? 'Auto-fill completed!' : (result.message || 'Auto-fill failed');
          notification.style.cssText = `
            position: fixed;
            bottom: 90px;
            right: 20px;
            background: ${result.success ? '#4CAF50' : '#f44336'};
            color: white;
            padding: 10px 15px;
            border-radius: 8px;
            z-index: 10001;
            font-size: 14px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.2);
          `;
          document.body.appendChild(notification);
          setTimeout(() => {
            notification.remove();
          }, 3000);
        });
      });

      // Only show on job sites or pages with forms
      const isJobSite = window.location.hostname.includes('linkedin') ||
                       window.location.hostname.includes('indeed') ||
                       window.location.hostname.includes('naukri') ||
                       window.location.hostname.includes('glassdoor') ||
                       window.location.hostname.includes('monster') ||
                       window.location.hostname.includes('dice') ||
                       window.location.hostname.includes('ziprecruiter') ||
                       detectJobApplicationForms().length > 0;

      if (isJobSite) {
        document.body.appendChild(button);
      }
    });
  }

  // Initialize floating button when page loads and when login status changes
  function initializeFloatingButton() {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', createFloatingButton);
    } else {
      createFloatingButton();
    }
  }

  // Listen for storage changes to show/hide button when login status changes
  chrome.storage.onChanged.addListener((changes) => {
    if (changes.kritiUserData) {
      userData = changes.kritiUserData.newValue;
    }
    if (changes.kritiResumeData) {
      resumeData = changes.kritiResumeData.newValue;
    }
    if (changes.kritiUser) {
      // Re-create floating button when login status changes
      const existingButton = document.getElementById('kriti-autofill-button');
      if (existingButton) {
        existingButton.remove();
      }
      createFloatingButton();
    }
  });

  // Initialize the extension
  initializeFloatingButton();

})();