const storage = chrome.storage.local;
let state = {
    storage,
    timer: null,
    prvStartTime: null,
    prvStoppedTime: null,
    auth: false,
    startYear: null
};

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

                firebase.auth().currentUser && saveWorkedHours(state.prvStartTime, state.prvStoppedTime, firebase.auth().currentUser.uid)
                    .then(res => console.log('save-workedHoures', res))
                    .catch(e => console.log('save-error', e))
            })


            break

        case 'get-data':
            getDataFromServer(state.startYear)
                .then(res => sendResponse({
                    STATUS: true,
                    data: res
                }))
                .catch(e => {
                    console.log('data from server error', e)
                    sendResponse({STATUS: false})
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

firebase.auth().onAuthStateChanged(user => {
    if(user){
        console.log('user logged in', user)
        state.auth = true
        state.uid = user.uid

        storage.get(['START_YEAR'], async res => {
            if(res.START_YEAR){
                state.startYear = res.START_YEAR
            }
            else{
                const year = await fetchStartYear()
                state.startYear = year
            }
        })
    }
    else{
        console.log('user is not logged in')
    }
});


window.state = state