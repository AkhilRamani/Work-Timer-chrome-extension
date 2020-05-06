const storage = chrome.storage.local;
let state = {
    storage,
    timer: null,
};

chrome.runtime.onMessage.addListener( (request, sender, sendResponse) => {
    switch(request.type){
        case 'start-timer':
            const START_TIME = Date.now()
            storage.set({ START_TIME }, () => {
                console.log('value is set')
                state.timer = START_TIME
                sendResponse({START_TIME})
            })
            break

        case 'stop-timer':
            storage.get(['START_TIME'], ({START_TIME}) => {
                storage.remove(['START_TIME'])
                state.timer = false
                sendResponse({START_TIME})
            })
            break
    }

    return true
})


window.state = state