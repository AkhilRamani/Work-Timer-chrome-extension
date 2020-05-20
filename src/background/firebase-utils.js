firebase.initializeApp(firebaseConfig)
// firebase.analytics();

const db = firebase.firestore()
const hoursCollection = db.collection('hours')


function startAuth(interactive) {
    const failedNotification = () => notificaton('Sign in failed!', 'Authentication with Google failed. Please try again')

    return new Promise((resolve, reject) => {
        // Request an OAuth token from the Chrome Identity API.
        chrome.identity.getAuthToken({ interactive: !!interactive }, function (token) {
            if (chrome.runtime.lastError && !interactive) {
                console.log('It was not possible to get a token programmatically.')
                failedNotification()
                reject()
            }
            else if (chrome.runtime.lastError) {
                console.log('runtime error', chrome.runtime.lastError)
                failedNotification()
                reject()
            }
            else if (token) {
                // Authorize Firebase with the OAuth Access Token.
                var credential = firebase.auth.GoogleAuthProvider.credential(null, token)
                firebase.auth().signInWithCredential(credential)
                    .then(res => {
                        console.log(res)
                        chrome.storage.local.set({ TOKEN: token }, () => resolve(res))
                        // resolve(res)
                    })
                    .catch(error => {
                        // The OAuth token might have been invalidated. Lets' remove it from cache.
                        if (error.code === 'auth/invalid-credential') {
                            chrome.identity.removeCachedAuthToken({ token: token }, function () {
                                startAuth(interactive)
                            });
                        }
                    });
            }
            else {
                console.error('The OAuth Token was null')
                failedNotification()
                reject()
            }
        });
    })
}


function startSignIn() {
    if (firebase.auth().currentUser) firebase.auth().signOut()
    else startAuth(true)
}

function logout() {
    console.log('logout called')
    return new Promise((resolve, reject) => {

        chrome.storage.local.get(['TOKEN'], ({TOKEN: token}) => {
            //TODO: 400 ERROR CODE- probably not working
            window.fetch('https://accounts.google.com/o/oauth2/revoke?token=' + token)
                .then(() => {
                    firebase.auth().signOut()
                        .then(() => {
                            console.log('logout from firebse')
                            chrome.identity.removeCachedAuthToken({ token: token }, function () {
                                // alert('removed')
                                notificaton('Pro Worker - Logout success', 'You have successfully logout from Pro Worker. Sign in back to continue recording your work-time.')
                                resolve()
                            })
                        })
                })
                .catch(e => {
                    console.log(e)
                    notificaton('Logout failed!', 'The logout request failed, please try again.')
                    reject(e)
                })
        })
    })
}


const saveWorkedHours = (startTime, endTime, uid) => {
    const date = new Date(endTime)
    return db.collection('hours').doc(uid).collection(`${date.getFullYear()}`).add({
        start: startTime,
        end: endTime
    })
    // `${date.getMonth() + 1}-${date.getFullYear()}`
}

const fetchStartYear = async () => {
    try{
        const doc = await hoursCollection.doc(firebase.auth().currentUser.uid).get()
        if(doc.exists && doc.data().startYear){
            return doc.data().startYear
        }
        else{
            const year = new Date().getFullYear()
            await hoursCollection.doc(firebase.auth().currentUser.uid).set({startYear: year})
            return year
        }
    }
    catch(e){
        console.error('error from setStartYear', e)
    }
}

const getDataFromServer = year => {
    return new Promise((resolve, reject) => {
        db.collection('hours').doc(firebase.auth().currentUser.uid).collection(`${year}`).get()
            .then(res => resolve(formatResponse(res)))
            .catch(e => reject(e))
    })
}

const formatResponse = docs => {
    const formattedData = []
    docs.forEach(doc => {
        const data = doc.data()
        const day = moment(data.start).format('DD MMM')
        const timeDiff = (new Date(data.end).getTime() - new Date(data.start).getTime())/1000
        const workTime = {
            start: moment(data.start).format('LT'),
            end: moment(data.end).format('LT')
        }
        const index = formattedData.findIndex(data => data.day == day)
        if(index > -1){
            formattedData[index].totalTime += timeDiff
            formattedData[index].times.push(workTime)
        }
        else{
            formattedData.push({
                day,
                totalTime: timeDiff,
                times: [workTime]
            })
        }
    })
    return formattedData
}