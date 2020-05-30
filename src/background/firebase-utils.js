firebase.initializeApp(firebaseConfig)
// firebase.analytics();

const db = firebase.firestore()
const usersCollection = db.collection('users')


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
                        // console.log(res)
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
    return new Promise((resolve, reject) => {

        chrome.storage.local.get(['TOKEN'], ({TOKEN: token}) => {
            //TODO: 400 ERROR CODE- probably not working
            window.fetch('https://accounts.google.com/o/oauth2/revoke?token=' + token)
                .then((res) => {
                    res.headers["Set-Cookie"] = "HttpOnly;Secure;SameSite=Strict"   //TODO: needs to test working or not
                    // console.log('logout reponse', res)
                    firebase.auth().signOut()
                        .then(() => {
                            // console.log('logout from firebse')
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
    const day = moment(startTime).format('DD MMM')
    // const day = '10 May'

    return db.collection('users').doc(uid).collection('time-records').doc(day).set({
        times: firebase.firestore.FieldValue.arrayUnion({
            start: startTime,
            end: endTime
        }),
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
    }, {merge: true})
}

let cursor = {
    firstPage: null,
    lastDoc: null
}
const getDataFromServer = (paginated) => {
    return new Promise((resolve, reject) => {
        let query = usersCollection.doc(firebase.auth().currentUser.uid).collection(`time-records`).orderBy('createdAt', 'desc').limit(10)
        if(paginated) query = query.startAfter(cursor.lastDoc)

        query.get()
            .then(res => {
                if(res.empty) return resolve(null)
                cursor.lastDoc = res.docs[res.docs.length - 1]
                if(!cursor.firstPage) cursor.firstPage = res.docs[res.docs.length - 1]
                resolve(formatResponse(res))
            })
            .catch(e => reject(e))
    })
}

const formatResponse = docs => {
    const formattedData = []
    docs.forEach(doc => {
        const date = doc.id
        let totalTime = 0
        
        const times = doc.data().times.map(time => {
            const timeDiff = (new Date(time.end).getTime() - new Date(time.start).getTime())/1000
            totalTime += timeDiff
            return {
                start: moment(time.start).format('LT'),
                end: moment(time.end).format('LT')
            }
        })
        formattedData.push({
            day: date,
            totalTime,
            times
        })
    })
    
    return formattedData
}

/**
 * 
 * used for old DB schema
 */
const formatResponse_Old = docs => {
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