const bindRowClickHandler = () => {
    let rows = document.getElementsByClassName("row")

    for (let i = 0; i < rows.length; i++) {
        rows[i].addEventListener("click", function () {
            this.classList.toggle("active")
            let content = this.nextElementSibling
            if (content.style.maxHeight) {
                content.style.maxHeight = null
                this.style.borderRadius = '6px'
                this.getElementsByTagName('img')[0].style.transform = "rotate(0deg)"
            } else {
                content.style.maxHeight = content.scrollHeight + "px"
                this.style.borderRadius = '6px 6px 0 0'
                this.getElementsByTagName('img')[0].style.transform = "rotate(180deg)"
            }
        })
    }
}

const plural = value => value > 0 ? 's' : ''
const getTotalTime = time => {
    const hours = Math.floor(time / 3600) % 24
    const minutes = Math.floor(time / 60 ) % 60
    const seconds = Math.floor(time % 60)
    return hours == 0 ? minutes == 0 ? `${seconds} second${plural(seconds)}` : `${minutes} minute${plural(minutes)}` : `${hours} hour${plural(hours)} ${minutes} minute${plural(minutes)}`
}

const initPopupScript = async () => {
    const res = await sendMessage('get-data')
    if (!res.STATUS) {
        return console.log('error occured')
    }
    hideElement('loader')
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
    document.getElementById('back-btn').addEventListener('click', () => window.location.href = './popup.html')
}

document.addEventListener('DOMContentLoaded', initPopupScript);