const sendMessage = (type, body) => {
    return new Promise((resolve, reject) => {
        chrome.runtime.sendMessage({ type, payload: body }, response => resolve(response))
    })
}
const getElement = id => document.getElementById(id)

const setElementValue = (id, value) => document.getElementById(id).innerHTML = value

const getFormattedTime = (startTime, endTime = null) => {
    const date1 = new Date(startTime)
    const date2 = endTime ? new Date(endTime) : new Date()
    const time = (date2.getTime() - date1.getTime()) / 1000

    const hours = Math.floor(time / 3600) % 24
    const minutes = Math.floor(time / 60 ) % 60
    const seconds = Math.floor(time % 60)
    return `${hours} : ${minutes} : ${seconds}`
}

let timerInterval = null
const startInterval = from => {
    setElementValue(ids.timeText, getFormattedTime(from))
    timerInterval = setInterval(() => {
        setElementValue(ids.timeText, getFormattedTime(from))
    }, 1000)
}

const stopInterval = () => clearInterval(timerInterval)

const hideElement = id => getElement(id).style.display = 'none'
const showElement = (id, customeDisplay = 'block') => getElement(id).style.display = customeDisplay

const getTimeValue = timeStamp => {
    const hour = Math.floor(timeStamp / 3600) % 24
    const minute = Math.floor(timeStamp / 60) % 60
    const second = Math.floor(timeStamp % 60)
    return { hour, minute, second }
}