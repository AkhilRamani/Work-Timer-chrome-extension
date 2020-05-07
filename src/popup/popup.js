//imported utils.js

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


async function _onTimerBtnClick(){
    if(state.timer){
        //stops timer
        const response = await sendMessage('stop-timer');

        stopInterval()
        setElementValue(ids.timeText, getFormattedTime(response.START_TIME))
    }
    else{
        //starts timer
        const response = await sendMessage('start-timer');
        startInterval(response.START_TIME)
    }
}


function initPopupScript(){
    document.getElementById(ids.timerBtn).addEventListener('click', _onTimerBtnClick)
    setElementValue(ids.timeText, '00 : 00 : 00')

    if(state.timer){
        startInterval(state.timer)
    }
    else{
        // if(state.prvStoppedTime) setElementValue(ids.timeText, getFormattedTime(state.prvStartTime, state.prvStoppedTime))
        // else setElementValue(ids.timeText, '00 : 00 : 00')
        setElementValue(ids.timeText, state.prvStoppedTime ? getFormattedTime(state.prvStartTime, state.prvStoppedTime) : '00 : 00 : 00')
    }

    chrome.runtime.onMessage.addListener(function(message, sender, response){
        // if(message.type == 'logged-out'){

        // }
    })
}


// Fire scripts after page has loaded
document.addEventListener('DOMContentLoaded', initPopupScript);