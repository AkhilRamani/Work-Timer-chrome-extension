const avatar = getElement('avatar')
const name = getElement('name')
const email = getElement('email')

sendMessage('get-user-data')
    .then(res => {
        console.log(res)
        name.innerHTML = res.name
        email.innerHTML = res.email
        avatar.src = res.avatar
    })


getElement('about-btn').addEventListener('click', () => window.location.href = './about.html?auth=true')
getElement('logout-btn').addEventListener('click', () => {
    hideElement('logout-btn')
    showElement('btn-loader')
    sendMessage('logout')
        .then(res => window.location.href = './popup.html')
        .catch(e => {
            showElement('logout-btn')
            hideElement('btn-loader')
        })
})