//imported utils.js

const backgroundWindow = chrome.extension.getBackgroundPage();
const state = backgroundWindow.state

const ids = {
    timeText: 'time-text',
    timerBtn: 'timer-btn',
    logoutBtn: 'logout-btn',
    authInfo: 'auth-info'
}


async function _onTimerBtnClick(){
    if(state.timer){
        //stops timer
        const response = await sendMessage('stop-timer');

        stopInterval()
        setElementValue(ids.timeText, getFormattedTime(response.START_TIME))
        setElementValue(ids.timerBtn, 'Start')
    }
    else{
        //starts timer
        const response = await sendMessage('start-timer');
        startInterval(response.START_TIME)
        setElementValue(ids.timerBtn, 'Stop')
    }
}

const _logout = () => {
    sendMessage('logout')
        .then(res => {
            hideElement(ids.logoutBtn)
            showElement(ids.authInfo, 'flex')
        })
        .catch(e => {})
}

async function initPopupScript(){
    const logoutBtn = getElement(ids.logoutBtn)
    
    const authenticated = await sendMessage('auth-stats')
    if(!authenticated) {
        hideElement(ids.logoutBtn)
        showElement(ids.authInfo, 'flex')
    }
    
    document.getElementById(ids.timerBtn).addEventListener('click', _onTimerBtnClick)
    logoutBtn.addEventListener('click', _logout)
    document.getElementById('signin-btn').addEventListener('click', () => window.location.href = './auth.html')

    if(state.timer){
        startInterval(state.timer)
        setElementValue(ids.timerBtn, 'Stop')
    }
    else{
        setElementValue(ids.timeText, state.prvStoppedTime ? getFormattedTime(state.prvStartTime, state.prvStoppedTime) : '00 : 00 : 00')
    }
}


// Fire scripts after page has loaded
document.addEventListener('DOMContentLoaded', initPopupScript);