
katjusha.dataset.サイト名 = document.title


板一覧.onclick = function(event){
    event.preventDefault()
    if(event.target.tagName !== 'A'){
        return
    }

    const before = document.querySelector("#板一覧 [data-selected]")
    if(before){
        delete before.dataset.selected
    }
    event.target.dataset.selected = 'selected'

    const dir = event.target.href.split('/')

    katjusha.dataset.板url = event.target.href
    katjusha.dataset.板名  = event.target.textContent
    katjusha.dataset.板bbs = dir[dir.length-2]

    document.title = `${katjusha.dataset.サイト名} [${event.target.textContent}]`

    go_bbs(event.target.href)
}


function go_bbs(url){
    const xhr = new XMLHttpRequest()
    xhr.open('GET', `${url}subject.txt?${Date.now()}`)
    xhr.timeout    = 30 * 1000
    xhr.onloadend  = loadend
    xhr.overrideMimeType('text/plain; charset=shift_jis')
    xhr.send()

    function loadend(){
        if(xhr.status !== 200){
            スレッド一覧_tbody.innerHTML = ''
            return
        }

        let html = '';
        let no   = 1;
        for(let v of xhr.responseText.split("\n")){
            if(!v){
                continue
            }
            const [key, subject, num] = v.replace(/\s?\((\d+)\)$/, '<>$1').split('<>')
            html += `<tr><td>${no}</td><td>${subject}</td><td>${num}</td><td></td><td></td><td></td><td></td><td></td></tr>`
            no++
        }

        スレッド一覧_tbody.innerHTML = html
    }
}





スレ投稿ボタン.onclick = function (event){
    if(katjusha.dataset.投稿フォーム){
        return
    }
    if(!katjusha.dataset.板bbs){
        return
    }

    投稿フォーム_タイトル.textContent = `『${katjusha.dataset.板名}』に新規スレッド`

    投稿フォーム_タイトル欄.value    = ''
    投稿フォーム_タイトル欄.disabled = false
    投稿フォーム_名前欄.value        = ''
    投稿フォーム_メール欄.value      = ''
    投稿フォーム_本文欄.value        = ''
    投稿フォーム_bbs.value           = katjusha.dataset.板bbs

    katjusha.dataset.投稿フォーム = 'スレ'

    const form = 投稿フォーム.getBoundingClientRect()
    投稿フォーム.style.left = (innerWidth/2  - form.width/2)  + 'px'
    投稿フォーム.style.top  = (innerHeight/2 - form.height/2) + 'px'

    投稿フォーム_タイトル欄.focus()
}



レス投稿ボタン.onclick = function (event){
    if(katjusha.dataset.投稿フォーム){
        return
    }

    投稿フォーム_タイトル欄.value = ''
    投稿フォーム_名前欄.value     = ''
    投稿フォーム_メール欄.value   = ''
    投稿フォーム_本文欄.value     = ''

    投稿フォーム_タイトル欄.disabled = true

    katjusha.dataset.投稿フォーム = 'レス'

    const form = 投稿フォーム.getBoundingClientRect()
    投稿フォーム.style.left = (innerWidth/2  - form.width/2)  + 'px'
    投稿フォーム.style.top  = (innerHeight/2 - form.height/2) + 'px'

    投稿フォーム_本文欄.focus()
}



投稿フォーム_form.onsubmit = function (event){
    event.preventDefault();

    const xhr = new XMLHttpRequest()
    xhr.open('POST', event.target.getAttribute('action'))
    xhr.timeout    = 30 * 1000
    xhr.onloadend  = postend
    xhr.overrideMimeType('text/html; charset=shift_jis')
    xhr.send(new FormData(event.target))

    function postend(){
        if(xhr.status !== 200){
            alert('投稿できませんでした')
            return
        }
        if(xhr.responseText.includes('<title>ＥＲＲＯＲ！')){
            alert(xhr.responseText.match(/<b>(.+?)</i)[1])
            return
        }
        delete katjusha.dataset.投稿フォーム
        go_bbs(katjusha.dataset.板url)
    }
}



投稿フォーム_キャンセルボタン.onclick = function (event){
    delete katjusha.dataset.投稿フォーム
}


投稿フォーム_閉じるボタン.onclick = function (event){
    delete katjusha.dataset.投稿フォーム
}



投稿フォーム_ヘッダ.onmousedown = function (event){
    const form = 投稿フォーム.getBoundingClientRect()

    投稿フォーム.startX = form.left   - event.pageX
    投稿フォーム.startY = form.top    - event.pageY
    投稿フォーム.limitX = innerWidth  - form.width  - 1
    投稿フォーム.limitY = innerHeight - form.height - 1

    document.addEventListener('mousemove', 投稿フォーム_ヘッダ.mousemove, {passive:true})
    document.addEventListener('mouseup'  , 投稿フォーム_ヘッダ.mouseup, {once:true})
}



投稿フォーム_ヘッダ.mousemove = function (event){
    投稿フォーム.style.left = Math.min(Math.max(0, 投稿フォーム.startX+event.pageX), 投稿フォーム.limitX) + 'px'
    投稿フォーム.style.top  = Math.min(Math.max(0, 投稿フォーム.startY+event.pageY), 投稿フォーム.limitY) + 'px'
}



投稿フォーム_ヘッダ.mouseup = function (event){
    document.removeEventListener('mousemove', 投稿フォーム_ヘッダ.mousemove)
}

