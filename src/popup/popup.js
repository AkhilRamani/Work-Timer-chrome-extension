const backgroundWindow = chrome.extension.getBackgroundPage();
const state = backgroundWindow.state

const ids = {
    timeText: 'time-text',
    timerBtn: 'timer-btn'
}

const sendMessage = (type, body) => {
    return new Promise((resolve, reject) => {
        chrome.runtime.sendMessage({ type, payload: body }, response => resolve(response))
    })
}
// const getElement = id => document.getElementById(id)

const setElementValue = (id, value) => document.getElementById(id).innerHTML = value

async function _onTimerBtnClick(){
    if(state.timer){
        const response = await sendMessage('stop-timer');
        console.log(response)
        setElementValue(ids.timeText, 'Start timer')
    }
    else{
        const response = await sendMessage('start-timer');
        console.log('message sent');
        console.log(state)
        setElementValue(ids.timeText, response.START_TIME)
    }
}


function initPopupScript(){
    document.getElementById(ids.timerBtn).addEventListener('click', _onTimerBtnClick)
    // const timeTxt = getElement(ids.timeText)

    if(state.timer){
        const date1 = new Date(state.timer)
        const date2 = new Date()
        const time = (date2.getTime() - date1.getTime())/ 1000
        setElementValue(ids.timeText, time)
    }
    else{
        setElementValue(ids.timeText, 'Start timer')
    }

    chrome.runtime.onMessage.addListener(function(message, sender, response){
        if(message.type == 'logged-out'){

        }
    })
}


// Fire scripts after page has loaded
document.addEventListener('DOMContentLoaded', initPopupScript);