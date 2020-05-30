let observerActive = false
const intersactionObserver = new IntersectionObserver(entries => {
    if (entries[0].intersectionRatio <= 0) return
    showElement('loader')
    fetchAndListData(true)
})

const bindRowClickHandler = () => {
    let rows = document.getElementsByClassName("row")
    for (let i = 0; i < rows.length; i++) {
        rows[i].onclick = () => {
            // this.classList.toggle("active")
            const element = rows[i]
            let content = element.nextElementSibling
            if (content.style.maxHeight) {
                content.style.maxHeight = null
                element.style.borderRadius = '6px'
                element.getElementsByTagName('img')[0].style.transform = "rotate(0deg)"
            } else {
                content.style.maxHeight = content.scrollHeight + "px"
                element.style.borderRadius = '6px 6px 0 0'
                element.getElementsByTagName('img')[0].style.transform = "rotate(180deg)"
            }
        }
    }
}

const plural = value => value > 0 ? 's' : ''
const getTotalTime = time => {
    //TODO: replace with common.js fun
    const hours = Math.floor(time / 3600) % 24
    const minutes = Math.floor(time / 60) % 60
    const seconds = Math.floor(time % 60)
    return hours == 0 ? minutes == 0 ? `${seconds} second${plural(seconds)}` : `${minutes} minute${plural(minutes)}` : `${hours} hour${plural(hours)} ${minutes} minute${plural(minutes)}`
}

const fetchAndListData = async paginated => {
    const res = await sendMessage('get-data', { paginated })
    hideElement('loader')

    if (!res.STATUS) {
        //TODO:
        return console.log('error occured')
    }
    else if (!res.data) {
        intersactionObserver.disconnect()
        return
    }

    res.data.forEach(data => {
        let div = document.createElement('div')
        let timesStr = ''
        data.times.forEach(time => timesStr += `<li>${time.start}&nbsp; - &nbsp;${time.end}</li>`)

        div.innerHTML = `
            <div class="row d-flex align-center" >
                <div class="d-flex">
                    <p class="d">${data.day}</p>
                    <p>${getTotalTime(data.totalTime)}</p>
                </div>
                <img class="row-btn" src="../../assets/imgs/down-arrow.png" >
            </div>
            <div class="collapse" >
                <div class="content" >
                    <ul>${timesStr}</ul>
                </div>
            </div>
            `;
        document.getElementById('data').append(div)
    })
    bindRowClickHandler()

    
    if(!observerActive){
        intersactionObserver.observe(getElement('obs'))
        observerActive = true
    } 
}

const initPopupScript = async () => {
    document.getElementById('back-btn').addEventListener('click', () => window.location.href = './popup.html')
    fetchAndListData()
}

document.addEventListener('DOMContentLoaded', initPopupScript);