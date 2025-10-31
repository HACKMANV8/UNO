// Popup script for Chrome Extension
document.addEventListener('DOMContentLoaded', async () => {
  console.log('Kriti popup loaded');
  
  const loadingDiv = document.getElementById('loading');
  const loginForm = document.getElementById('loginForm');
  const userDashboard = document.getElementById('userDashboard');
  const emailInput = document.getElementById('email');
  const passwordInput = document.getElementById('password');
  const loginBtn = document.getElementById('loginBtn');
  const loginError = document.getElementById('loginError');
  const userName = document.getElementById('userName');
  const userEmail = document.getElementById('userEmail');
  const actionResult = document.getElementById('actionResult');

  // Check if user is already logged in
  const userData = await chrome.storage.local.get(['kritiUser', 'kritiUserData']);
  console.log('Stored user data:', userData);
  
  if (userData.kritiUser && userData.kritiUserData) {
    showUserDashboard(userData.kritiUser, userData.kritiUserData);
  } else {
    showLoginForm();
  }

  // Login functionality
  loginBtn.addEventListener('click', async () => {
    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();

    console.log('Login attempt for:', email);

    if (!email || !password) {
      showError('Please enter both email and password');
      return;
    }

    loginBtn.textContent = 'Logging in...';
    loginBtn.disabled = true;
    hideError();

    try {
      // Send login request to background script
      const response = await chrome.runtime.sendMessage({
        action: 'login',
        email: email,
        password: password
      });

      console.log('Login response:', response);

      if (response.success) {
        showUserDashboard(response.user, response.userData);
      } else {
        showError(response.error || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      showError('Login failed. Please try again.');
    } finally {
      loginBtn.textContent = 'Login';
      loginBtn.disabled = false;
    }
  });

  // Auto-fill current page
  document.getElementById('fillCurrentPage').addEventListener('click', async () => {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      
      const response = await chrome.tabs.sendMessage(tab.id, {
        action: 'autoFillPage'
      });

      if (response && response.success) {
        showSuccess('Page auto-filled successfully!');
      } else {
        showError(response?.message || 'Auto-fill failed. No compatible forms found.');
      }
    } catch (error) {
      console.error('Auto-fill error:', error);
      showError('Auto-fill failed. Please try again.');
    }
  });

  // Detect forms
  document.getElementById('detectForms').addEventListener('click', async () => {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      
      const response = await chrome.tabs.sendMessage(tab.id, {
        action: 'detectForms'
      });

      if (response && response.forms && response.forms.length > 0) {
        showSuccess(`Found ${response.forms.length} compatible form(s) on this page.`);
      } else {
        showError('No compatible forms found on this page.');
      }
    } catch (error) {
      console.error('Form detection error:', error);
      showError('Form detection failed.');
    }
  });

  // Refresh user data
  document.getElementById('refreshData').addEventListener('click', async () => {
    try {
      const response = await chrome.runtime.sendMessage({
        action: 'refreshUserData'
      });

      if (response.success) {
        showSuccess('User data refreshed successfully!');
      } else {
        showError('Failed to refresh user data.');
      }
    } catch (error) {
      console.error('Refresh error:', error);
      showError('Failed to refresh user data.');
    }
  });

  // Logout
  document.getElementById('logoutBtn').addEventListener('click', async () => {
    await chrome.storage.local.clear();
    showLoginForm();
    showSuccess('Logged out successfully!');
  });

  function showLoginForm() {
    loadingDiv.classList.add('hidden');
    loginForm.classList.remove('hidden');
    userDashboard.classList.add('hidden');
  }

  function showUserDashboard(user, userData) {
    loadingDiv.classList.add('hidden');
    loginForm.classList.add('hidden');
    userDashboard.classList.remove('hidden');
    
    userName.textContent = userData.name || user.email.split('@')[0];
    userEmail.textContent = user.email;
  }

  function showError(message) {
    loginError.textContent = message;
    loginError.classList.remove('hidden');
  }

  function hideError() {
    loginError.classList.add('hidden');
  }

  function showSuccess(message) {
    actionResult.textContent = message;
    actionResult.className = 'success';
    actionResult.classList.remove('hidden');
    setTimeout(() => {
      actionResult.classList.add('hidden');
    }, 3000);
  }

  function showActionError(message) {
    actionResult.textContent = message;
    actionResult.className = 'error';
    actionResult.classList.remove('hidden');
    setTimeout(() => {
      actionResult.classList.add('hidden');
    }, 3000);
  }

  // Update showError to use showActionError when in dashboard
  const originalShowError = showError;
  showError = (message) => {
    if (!userDashboard.classList.contains('hidden')) {
      showActionError(message);
    } else {
      originalShowError(message);
    }
  };
});