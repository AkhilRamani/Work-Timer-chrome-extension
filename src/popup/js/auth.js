const loader = getElement('google-loader')
const gLoginBtn = getElement('google-login')

const _googleLogin = async () => {
    loader.style.display = 'block'
    gLoginBtn.style.display = 'none'

    sendMessage('login')
        .then(res => window.location.href = './popup.html')
        .catch(e => {
            console.log(e)
            gLoginBtn.style.display = 'block'
            loader.style.display = 'none'
        })
}

document.getElementById('back-btn').addEventListener('click', () => window.location.href = './popup.html')
document.getElementById('google-login').addEventListener('click', _googleLogin)