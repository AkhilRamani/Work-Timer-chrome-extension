const storage = chrome.storage.local;
let state = {
    storage,
    timer: null,
    prvStartTime: null,
    prvStoppedTime: null,
    auth: false
};

// TODO: check auth onload


chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    switch (request.type) {
        case 'auth-stats':
            sendResponse(state.auth)
            break

        case 'start-timer':
            const START_TIME = Date.now()
            storage.set({ START_TIME }, () => {
                console.log('value is set')
                state.timer = START_TIME
                sendResponse({ START_TIME })
            })
            break

        case 'stop-timer':
            storage.get(['START_TIME'], ({ START_TIME }) => {
                storage.remove(['START_TIME'])
                state.prvStartTime = START_TIME
                state.prvStoppedTime = Date.now()
                state.timer = null
                sendResponse({ START_TIME })
            })
            break

        case 'login':
            startAuth(true)
                .then(res => {
                    state.auth = true
                    sendResponse({ STATUS: true })
                })
                .catch(e => sendResponse({ STATUS: false }))
            break

        case 'logout':
            logout()
                .then(res => {
                    state.auth = false
                    sendResponse({ STATUS: true })
                })
                .catch(e => sendResponse({STATUS: false}))
            break

    }

    return true
})


window.state = state