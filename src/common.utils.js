const notificaton = (title, message, id = '', callback = null) => chrome.notifications.create(id, {
    title,
    message,
    iconUrl: '../assets/app-icon/icon128.png',
    type: 'basic'
  }, callback);

const dispRecordingIndicator = () => {
	const browserAction = chrome.browserAction;
    browserAction.setBadgeText({text: " "})
	browserAction.setBadgeBackgroundColor({ color: "#FF4E4E" })
	browserAction.setTitle({ title: "Pro Worker - Recording..." })
}

const hideRecordingIndicator = () => {
	chrome.browserAction.setBadgeText({text: ""})
	chrome.browserAction.setTitle({ title: "Pro Worker - Record work hours" })
}