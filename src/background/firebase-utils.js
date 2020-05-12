const firebaseConfig = {
    apiKey: "AIzaSyAharixP7viQM-177X3tN8_8NtB8nv1Ags",
    authDomain: "pro-worker.firebaseapp.com",
    databaseURL: "https://pro-worker.firebaseio.com",
    projectId: "pro-worker",
    storageBucket: "pro-worker.appspot.com",
    messagingSenderId: "1010240089470",
    appId: "1:1010240089470:web:28180c141306f10464172f",
    measurementId: "G-6Y06ESQ4PR"
};
const app = firebase.initializeApp(firebaseConfig)
// firebase.analytics();
// const appDb = app.database().ref()


function startAuth(interactive) {
    return new Promise((resolve, reject) => {
        // Request an OAuth token from the Chrome Identity API.
        chrome.identity.getAuthToken({ interactive: !!interactive }, function (token) {
            if (chrome.runtime.lastError && !interactive) {
                console.log('It was not possible to get a token programmatically.')
                reject()
            }
            else if (chrome.runtime.lastError) {
                console.error(chrome.runtime.lastError)
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
            window.fetch('https://accounts.google.com/o/oauth2/revoke?token=' + token)
                .then(() => {
                    firebase.auth().signOut()
                        .then(res => {
                            console.log('logout from firebse', res)
                            chrome.identity.removeCachedAuthToken({ token: token }, function () {
                                alert('removed')
                                resolve(res)
                            })
                        })
                })
                .catch(e => {
                    console.log(e)
                    reject(e)
                })
        })
    })
}