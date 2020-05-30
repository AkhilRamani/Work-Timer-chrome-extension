const storage = chrome.storage.local;
let state = {
    storage,
    timer: null,
    prvStartTime: null,
    prvStoppedTime: null,
    auth: false,
    workData: [],
    graphData: {},
    // noDataOnServer: false
};


chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    switch (request.type) {
        case 'auth-stats':
            sendResponse(state.auth)
            break

        case 'graph-data':
            sendResponse(state.graphData)
            break

        case 'start-timer':
            const START_TIME = Date.now()
            storage.set({ START_TIME }, () => {
                state.timer = START_TIME
                sendResponse({ START_TIME })
                dispRecordingIndicator()
            })
            break

        case 'stop-timer':
            storage.get(['START_TIME'], ({ START_TIME }) => {
                storage.remove(['START_TIME'])
                state.prvStartTime = START_TIME
                state.prvStoppedTime = Date.now()
                state.timer = null
                // sendResponse({ START_TIME })

                state.auth && saveAndCacheWorkHour(state.prvStartTime, state.prvStoppedTime)
                hideRecordingIndicator()
                sendResponse({ START_TIME, graphData: state.graphData })
            })


            break

        case 'get-data':
            //send in memory data in first page
            if (!request.payload.paginated) {
                sendResponse({ STATUS: true, data: state.workData })
                cursor.lastDoc = cursor.firstPage    //defined in firebase-utils.js
            }
            else {
                getDataFromServer(request.payload.paginated)
                    .then(res => {
                        // if (!res) state.noDataOnServer = true
                        sendResponse({
                            STATUS: true,
                            data: res
                        })
                    })
                    .catch(e => {
                        console.log('data from server error', e)
                        sendResponse({ STATUS: false })
                    })
            }

            break

        case 'login':
            startAuth(true)
                .then(res => {
                    state.auth = true
                    //awaits for initial data being loaded for Graph generation
                    fetchInitialData()
                        .then(() => sendResponse({ STATUS: true }))
                    // sendResponse({ STATUS: true })
                })
                .catch(e => sendResponse({ STATUS: false }))
            break

        case 'logout':
            logout()
                .then(res => {
                    state.auth = false
                    sendResponse({ STATUS: true })
                    state.workData = []
                })
                .catch(e => sendResponse({ STATUS: false }))
            break

    }

    return true
})


firebase.auth().onAuthStateChanged(user => {
    if (user) {
        console.log('user logged in', user)
        state.auth = true
        state.uid = user.uid

        fetchInitialData()
    }
    else {
        console.log('user is not logged in')
    }
})

const fetchInitialData = () => {
    return getDataFromServer()
        .then(data => {
            if (!data) {
                // state.noDataOnServer = true
                return state.graphData = genGraphData([])
            }
            state.workData = data
            const graphData = genGraphData(data.slice(0, 10))
            state.graphData = graphData
            // console.log(state.graphData)
            // state.graphData = graphTestData()
        })
        .catch(e => console.log('--auth | getData', e))
}

//---under development -----------
const genGraphData = timesArr => {
    let max = 0
    let rawArr = []
    let date = new Date()

    for (let i = 0; i < 10; i++) {
        let formattedDate = moment(date).format('DD MMM')
        const index = timesArr.findIndex(data => data.day == formattedDate)
        if (index == -1) rawArr.unshift({ day: formattedDate, time: 0 })
        else {
            const tmp = timesArr[index]
            rawArr.unshift({
                day: tmp.day,
                time: tmp.totalTime
            })
            if (tmp.totalTime > max) max = tmp.totalTime
        }
        date.setDate(date.getDate() - 1)
    }
    return {
        max,
        data: rawArr
    }
}
//-----------------------------------------


const saveAndCacheWorkHour = (startTime, endTime) => {
    firebase.auth().currentUser && saveWorkedHours(startTime, endTime, firebase.auth().currentUser.uid)
        // .then(res => console.log('save-workedHoures', res))
        .catch(e => console.log('save-error', e))

    const day = moment(startTime).format('DD MMM')
    let totalTime = getTimeDiff(startTime, endTime);

    const index = state.workData.findIndex(data => data.day == day)
    if (index > -1) {
        state.workData[index]['times'].push(getFormattedTimeObj(startTime, endTime))
        state.workData[index]['totalTime'] += totalTime
        totalTime = state.workData[index].totalTime
    }
    else {
        state.workData.unshift({
            day,
            totalTime,
            times: [
                getFormattedTimeObj(startTime, startTime)
            ]
        })
    }

    cacheGraphData(day, totalTime)
}

const cacheGraphData = (day, totalTime) => {
    if (state.graphData.max < totalTime) state.graphData.max = totalTime
    if (state.graphData.data[9].day == day) state.graphData.data[9].time = totalTime
    else state.graphData = genGraphData([{ day, time: totalTime }, ...state.graphData.data.slice(1, 10)])
}

window.state = state



const graphTestData = () => {
    return {
        max: 100,
        data: [
            {
                day: '23 May',
                time: 45
            },
            {
                day: '22 May',
                time: 60
            },
            {
                day: '21 May',
                time: 30
            },
            {
                day: '20 May',
                time: 80
            },
            {
                day: '19 May',
                time: 20
            },
            {
                day: '18 May',
                time: 100
            },
            {
                day: '17 May',
                time: 90
            },
            {
                day: '16 May',
                time: 50
            },
            {
                day: '15 May',
                time: 60
            },
            {
                day: '14 May',
                time: 70
            },
        ]
    }
}