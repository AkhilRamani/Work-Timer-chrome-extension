const auth = new URL(window.location.href).searchParams.get('auth')
getElement('back-btn').addEventListener('click', () => window.location.href = auth ? './profile.html' : './popup.html')
getElement('dev-name').addEventListener('click', () => chrome.tabs.create({url: 'https://linkedin.com/in/akhilramani'}))