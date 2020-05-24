const notificaton = (title, message, id = '', callback = null) => chrome.notifications.create(id, {
  title,
  message,
  iconUrl: '../assets/app-icon/icon128.png',
  type: 'basic'
}, callback);

const sendMessage = (type, body) => {
  return new Promise((resolve, reject) => {
      chrome.runtime.sendMessage({ type, payload: body }, response => resolve(response))
  })
}

const dispRecordingIndicator = () => {
  const browserAction = chrome.browserAction;
  browserAction.setBadgeText({ text: " " })
  browserAction.setBadgeBackgroundColor({ color: "#FF4E4E" })
  browserAction.setTitle({ title: "Pro Worker - Recording..." })
}

const hideRecordingIndicator = () => {
  chrome.browserAction.setBadgeText({ text: "" })
  chrome.browserAction.setTitle({ title: "Pro Worker - Record work hours" })
}

const getTimeDiff = (start, end) => (new Date(end).getTime() - new Date(start).getTime()) / 1000
const getFormattedTimeObj = (start, end) => ({
  start: moment(start).format('LT'),
  end: moment(end).format('LT')
})