const notificaton = (title, message, id = '', callback = null) => chrome.notifications.create(id, {
    title,
    message,
    iconUrl: '../assets/app-icon/icon35.png',
    type: 'basic'
  }, callback);