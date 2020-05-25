//imported utils.js

const backgroundWindow = chrome.extension.getBackgroundPage();
const state = backgroundWindow.state

const ids = {
    timeText: 'time-text',
    timerBtn: 'timer-btn',
    logoutBtn: 'logout-btn',
    authInfo: 'auth-info',
    listBtn: 'list-btn',
    graph: 'graph'
}


async function _onTimerBtnClick() {
    if (state.timer) {
        //stops timer
        const response = await sendMessage('stop-timer');

        stopInterval()
        setElementValue(ids.timeText, getFormattedTime(response.START_TIME))
        setElementValue(ids.timerBtn, 'Start')

        genGraph(response.graphData)
    }
    else {
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
            hideElement(ids.listBtn)
            hideElement(ids.graph)
        })
        .catch(e => {
            //TODO
        })
}

const genGraph = graphData => {
    console.log('from graph fun', state.auth)
    if(!state.auth) return null

    const bars = document.getElementsByClassName('bar')
    for (let i = 0; i < bars.length; i++) {
        const dayObj = graphData.data[i]
        const time = dayObj.time
        bars[i].style.height = graphData.max == 0 ? '10%' : (time * 100) / graphData.max + 10 + '%'

        if(time){
            const {hour, minute, second} = getTimeValue(time)
            const str = hour == 0 ? minute == 0 ? `${second}s` : `${minute}m ${second}s` : `${hour}h ${minute}m`
            bars[i].innerHTML = `<div>
                    <p>${dayObj.day}</p>
                    <p>${str}</p>
                </div>`
            bars[i].style.pointerEvents = 'auto'
        }
        else{
            bars[i].style.pointerEvents = 'none'
        }
    }
}

async function initPopupScript() {
    const logoutBtn = getElement(ids.logoutBtn)
    const listBtn = getElement(ids.listBtn)

    sendMessage('graph-data')
        .then(data => {
            // console.log(data)
            genGraph(data)
        })
        .catch(e => console.log(e))

    const authenticated = await sendMessage('auth-stats')
    if (!authenticated) {
        hideElement(ids.logoutBtn)
        showElement(ids.authInfo, 'flex')
        hideElement(ids.listBtn)
        hideElement(ids.graph)
    }

    document.getElementById(ids.timerBtn).addEventListener('click', _onTimerBtnClick)
    logoutBtn.addEventListener('click', _logout)
    document.getElementById('signin-btn').addEventListener('click', () => window.location.href = './auth.html')
    listBtn.addEventListener('click', () => window.location.href = './listData.html')

    if (state.timer) {
        startInterval(state.timer)
        setElementValue(ids.timerBtn, 'Stop')
    }
    else {
        setElementValue(ids.timeText, state.prvStoppedTime ? getFormattedTime(state.prvStartTime, state.prvStoppedTime) : '00 : 00 : 00')
    }

}


// Fire scripts after page has loaded
document.addEventListener('DOMContentLoaded', initPopupScript);