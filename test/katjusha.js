
const state = {}
katjusha.dataset.title = document.title

for(const el of 板一覧.querySelectorAll('a')){
    const dir = el.href.split('/')
    dir.pop()
    板一覧[el.href] = {
        url : el.href,
        name: el.textContent,
        key : dir.pop(),
        home: dir.join('/') + '/',
    }
}



板一覧.onclick = function(event){
    event.preventDefault()
    if(event.target.tagName !== 'A'){
        return
    }

    change_selected(event.target, 板一覧)

    document.title = `${katjusha.dataset.title} [ ${event.target.textContent} ]`

    ajax(`${event.target.href}subject.txt`, subject_loadend)
}


スレッド一覧_tbody.onclick = function(event){
    event.preventDefault()
    const tr = event.target.closest('tr')
    if(!tr){
        return
    }
    if(!this.dataset.bbsurl){
        return
    }

    change_selected(tr, スレッド一覧)
    ajax(`${this.dataset.bbsurl}dat/${tr.dataset.key}.dat`, dat_loadend)
}


スレッド投稿ボタン.onclick = function (event){
    if(katjusha.dataset.投稿フォーム){
        return
    }
    const bbs = 板一覧[スレッド一覧_tbody.dataset.bbsurl]
    if(!bbs){
        return
    }

    投稿フォーム_form.setAttribute('action', `${bbs.home}test/bbs.cgi`)
    set_value(投稿フォーム, {
        subject : '',
        FROM    : '',
        mail    : '',
        MESSAGE : '',
        bbs     : bbs.key,
        key     : '',
    })

    投稿フォーム_タイトル欄.disabled  = false
    投稿フォーム_タイトル.textContent = `『${bbs.name}』に新規スレッド`
    katjusha.dataset.投稿フォーム = 'スレッド'
    centering(投稿フォーム)
    投稿フォーム_タイトル欄.focus()
}



レス投稿ボタン.onclick = function (event){
    if(katjusha.dataset.投稿フォーム){
        return
    }
    const tab = タブ.querySelector('[data-selected]')
    const bbs = 板一覧[tab.dataset.bbsurl]

    if(!tab.dataset.key){
        return
    }

    投稿フォーム_form.setAttribute('action', `${bbs.home}test/bbs.cgi`)
    set_value(投稿フォーム, {
        subject : tab.innerHTML,
        FROM    : '',
        mail    : '',
        MESSAGE : '',
        bbs     : bbs.key,
        key     : tab.dataset.key
    })

    投稿フォーム_タイトル欄.disabled = true
    投稿フォーム_タイトル.innerHTML  = `「${tab.innerHTML}」にレス`
    katjusha.dataset.投稿フォーム = 'レス'
    centering(投稿フォーム)
    投稿フォーム_本文欄.focus()
}



スレッドヘッダ_板名.onclick = function (event){
    event.preventDefault()
    if(!this.textContent){
        return
    }
    const bbsurl = this.querySelector("a").href

    for(const el of document.querySelectorAll('#板一覧 a')){
        if(el.href === bbsurl){
            el.click()
            return
        }
    }
}


スレッド.onscroll = function (event){
    this.thread.scroll = this.scrollTop
}



投稿フォーム_form.onsubmit = function (event){
    event.preventDefault()
    ajax(this.getAttribute('action'), cgi_loadend, new FormData(this))
}



投稿フォーム_form.onreset = function (event){
    delete katjusha.dataset.投稿フォーム
}


投稿フォーム_閉じるボタン.onclick = function (event){
    delete katjusha.dataset.投稿フォーム
}


投稿フォーム_sage.onchange = function (event){
    if(event.target.checked){
        投稿フォーム_メール欄.disabled = true
        投稿フォーム_メール欄.value    = 'sage'
    }
    else{
        投稿フォーム_メール欄.disabled = false
        投稿フォーム_メール欄.value    = ''
    }
}


投稿フォーム_ヘッダ.onmousedown = function (event){
    const {left, top, width, height} = 投稿フォーム.getBoundingClientRect()

    投稿フォーム.startX = left - event.pageX
    投稿フォーム.startY = top  - event.pageY
    投稿フォーム.limitX = innerWidth  - width  - 1
    投稿フォーム.limitY = innerHeight - height - 1

    document.addEventListener('mousemove', 投稿フォーム.移動,     {passive:true})
    document.addEventListener('mouseup'  , 投稿フォーム.移動解除, {once:true})
}



投稿フォーム.移動 = function (event){
    投稿フォーム.style.left = Math.min(Math.max(0, 投稿フォーム.startX+event.pageX), 投稿フォーム.limitX) + 'px'
    投稿フォーム.style.top  = Math.min(Math.max(0, 投稿フォーム.startY+event.pageY), 投稿フォーム.limitY) + 'px'
}



投稿フォーム.移動解除 = function (event){
    document.removeEventListener('mousemove', 投稿フォーム.移動)
}


function subject_loadend(xhr){
    if(xhr.status !== 200){
        スレッド一覧_tbody.innerHTML = ''
        return
    }

    const list = xhr.responseText.split("\n")
    const bbs  = 板一覧[xhr.bbsurl]

    let html = ''
    for(let i = 0; i < list.length-1; i++){
        const [dat, subject, num] = list[i].replace(/\s?\((\d+)\)$/, '<>$1').split('<>')
        const key = dat.replace('.dat', '')
        html += `<tr data-key="${key}"><td>${i+1}</td><td><a href="${bbs.home}test/read.cgi/${bbs.key}/${key}/">${subject}</a></td><td>${num}</td><td></td><td></td><td></td><td></td><td></td></tr>`
    }
    スレッド一覧_tbody.innerHTML = html
    スレッド一覧_tbody.dataset.bbsurl = xhr.bbsurl

    grid3.scrollTop = 0
}

function parse_dat(responseText, num){
    const dat  = {html: ''}
    const list = responseText.split("\n")
    list.pop()

    dat.num     = list.length
    dat.subject = list[0].split('<>').pop()

    for(const v of list){
        const [from, mail, date, message, subject] = v.split('<>')
        dat.html += `<section><header><i>${num}</i> 名前：<b>${from}</b> 投稿日：<date>${date}</date></header><p>${message}</p></section>`
        num++
    }
    return dat
}



function render_thread(thread){
    const tab = タブ.querySelector(`[data-url="${thread.url}"]`) || タブ.querySelector('[data-selected]')
    tab.innerHTML      = thread.subject
    tab.dataset.bbsurl = thread.bbsurl
    tab.dataset.key    = thread.key
    tab.dataset.url    = thread.url

    スレッドヘッダ_タイトル.innerHTML = `${thread.subject} (${thread.num})`
    スレッドヘッダ_板名.innerHTML     = `<a href="${thread.bbsurl}">[${板一覧[thread.bbsurl].name}]</a>`

    スレッド.innerHTML = thread.html
    スレッド.thread    = thread
    スレッド.scrollTop = thread.scroll || 0
}



function dat_loadend(xhr){
    const thread  = state[xhr.bbsurl][xhr.key]

    if(xhr.status === 200){
        const dat = parse_dat(xhr.responseText, 1)

        thread.key     = xhr.key
        thread.bbsurl  = xhr.bbsurl
        thread.url     = `${xhr.bbsurl}${xhr.key}/`
        thread.scroll  = 0
        thread.subject = dat.subject
        thread.html    = dat.html
        thread.num     = dat.num
        thread.byte    = Number(xhr.getResponseHeader('Content-Length'))
    }
    else if(xhr.status === 206){
        const dat = parse_dat(xhr.responseText, thread.num+1)

        thread.html   += dat.html
        thread.num    += dat.num
        thread.byte   += Number(xhr.getResponseHeader('Content-Length') || 0)
    }

    render_thread(thread)
}



function cgi_loadend(xhr){
    if(xhr.status !== 200){
        alert('投稿できませんでした')
        return
    }
    if(xhr.responseText.includes('<title>ＥＲＲＯＲ！')){
        alert(xhr.responseText.match(/<b>(.+?)</i)[1])
        return
    }

    xhr.key ? ajax(`${xhr.bbsurl}dat/${xhr.key}.dat`, dat_loadend) : ajax(`${xhr.bbsurl}subject.txt`, subject_loadend)

    delete katjusha.dataset.投稿フォーム
}



function ajax(url, fn, body){
    const xhr = new XMLHttpRequest()
    if(url.endsWith('cgi')){
        xhr.open('POST', url)
        xhr.bbsurl = url.replace('test/bbs.cgi', body.get('bbs') + '/')
        xhr.key    = body.get('key')
    }
    else{
        xhr.open('GET', `${url}?${Date.now()}`)
        xhr.bbsurl = url.endsWith('txt') ? url.replace('subject.txt', '') : url.replace(/\/(dat|kako)\/\d.*/, '/')
        xhr.key    = url.split('/').pop().replace(/\..*/, '')
        if(state[xhr.bbsurl] && state[xhr.bbsurl][xhr.key] && state[xhr.bbsurl][xhr.key].byte){
            xhr.setRequestHeader('Range', `bytes=${state[xhr.bbsurl][xhr.key].byte}-`)
        }
    }
    xhr.overrideMimeType('text/plain; charset=shift_jis')
    xhr.timeout = 30 * 1000
    xhr.onloadend = function(){
        ナビ_アニメ.dataset.ajax = Number(ナビ_アニメ.dataset.ajax) - 1
        if(!state[xhr.bbsurl]){
            state[xhr.bbsurl] = {};
        }
        if(!state[xhr.bbsurl][xhr.key] && xhr.key){
            state[xhr.bbsurl][xhr.key] = {};
        }
        fn(xhr)
    }
    ナビ_アニメ.dataset.ajax = Number(ナビ_アニメ.dataset.ajax) + 1
    xhr.send(body)
}



function change_selected(el, parent){
    const before = parent.querySelector('[data-selected]')
    if(before){
        delete before.dataset.selected
    }
    el.dataset.selected = 'selected'
}


function centering(el){
    const {width, height} = el.getBoundingClientRect()
    el.style.left = (innerWidth/2  - width/2)  + 'px'
    el.style.top  = (innerHeight/2 - height/2) + 'px'
}



function set_value(form, value){
    for(const el of form.querySelectorAll('[name]')){
        if(el.name in value){
            el.value = value[el.name]
        }
    }
}
