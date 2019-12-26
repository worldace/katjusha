/*
ajaxにタブも送る

bbs.php thread($bbs, $subject, $from, $mail, $body) res()
*/



ナビ.oncontextmenu = function (event){
    event.preventDefault()
}

ナビ_全板ボタン.onclick = function(){
    event.stopPropagation()
    コンテキスト.表示('コンテキスト_全板ボタン', this, event.pageX, event.pageY)
}

ナビ_全板ボタン.タグ作成 = function (){
    let html = ''
    for(const el of 板一覧.querySelectorAll('*')){
        if(el.tagName === 'SUMMARY'){
            html += `</ul></li><li class="menu-sub"><span>${el.textContent}</span><ul>`
        }
        else if(el.tagName === 'A'){
            html += `<li><span onclick="go_bbs('${el.href}')">${el.textContent}</span></li>`
        }
    }
    html = `<ul id="コンテキスト_全板ボタン" class="menu">${html.slice(10)}</ul>`
    document.querySelector('[data-id="コンテキスト_全板ボタン"]').innerHTML = html
}


板一覧.onclick = function(event){
    event.preventDefault()
    if(event.target.tagName === 'A'){
        change_selected(event.target, 板一覧)
        ajax(`${event.target.href}subject.txt`, subject_loadend)
    }
}



板一覧.oncontextmenu = function (event){
    event.preventDefault()
    if(event.target.tagName === 'A'){
        change_selected(event.target, 板一覧)
        コンテキスト.表示('コンテキスト_板一覧', event.target, event.pageX, event.pageY)
    }
}


grid3.oncontextmenu = function (event){
    event.preventDefault()
}



サブジェクト一覧_tbody.onclick = function(event){
    event.preventDefault()
    const tr = event.target.closest('tr')
    if(tr && this.dataset.bbsurl){
        change_selected(tr, サブジェクト一覧)
        ajax(`${this.dataset.bbsurl}dat/${tr.dataset.key}.dat`, dat_loadend)
    }
}


サブジェクト一覧_tbody.oncontextmenu = function (event){
    event.preventDefault()
    const tr = event.target.closest('tr')
    if(tr){
        change_selected(tr, サブジェクト一覧)
        コンテキスト.表示('コンテキスト_サブジェクト一覧', tr.querySelector('a'), event.pageX, event.pageY)
    }
}





スレッド投稿ボタン.onclick = function (event){
    if(katjusha.dataset.投稿フォーム){
        return
    }
    const bbs = 板一覧[サブジェクト一覧_tbody.dataset.bbsurl]
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



スレッドヘッダ.oncontextmenu = function (event){
    event.preventDefault()
}


スレッドヘッダ_板名.onclick = function (event){
    event.preventDefault()
    const bbsurl = this.querySelector('a').href
    if(板一覧[bbsurl]){
        ajax(`${bbsurl}subject.txt`, subject_loadend)
    }
}



スレッド.addEventListener('scroll', function(event){ スレッド.thread.scroll = スレッド.scrollTop}, {passive:true});



投稿フォーム.oncontextmenu = function (event){
    if(event.target.tagName !== 'TEXTAREA'){
        event.preventDefault()
    }
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


コンテキスト.表示 = function (id, el, x, y){
    const menu = コンテキスト.querySelector(`[data-id="${id}"]`).content.cloneNode(true)
    コンテキスト.replaceChild(menu, コンテキスト.firstElementChild)

    コンテキスト.target        = el
    コンテキスト.style.left    = `${x}px`
    コンテキスト.style.top     = `${y}px`

    katjusha.dataset.コンテキスト = id
    /* 右と下にオーバーフローする場合の対処 */
}



コンテキスト.onclick = function (event){
    event.stopPropagation()
    if(event.target.onclick){
        delete katjusha.dataset.コンテキスト
        delete コンテキスト.target
    }
}



コンテキスト.oncontextmenu = function (event){
    event.preventDefault()
    event.target.click()
}



document.body.addEventListener('click', function(event){
    if(katjusha.dataset.コンテキスト){
        delete katjusha.dataset.コンテキスト
        delete コンテキスト.target
    }
})




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


function render_subject(bbsurl){
    
}



function render_thread(thread){
    const tab = タブ.querySelector(`[data-url="${thread.url}"]`) || タブ.querySelector('[data-selected]')
    tab.innerHTML      = thread.subject
    tab.dataset.bbsurl = thread.bbsurl
    tab.dataset.key    = thread.key
    tab.dataset.url    = thread.url

    スレッドヘッダ_タイトル.innerHTML = `${thread.subject} (${thread.num})`
    スレッドヘッダ_板名.innerHTML     = `<a href="${thread.bbsurl}">[${板一覧[thread.bbsurl].name}]</a>`

    document.title = thread.subject

    スレッド.innerHTML = thread.html
    スレッド.thread    = thread
    スレッド.scrollTop = thread.scroll || 0
}



function dat_loadend(xhr){
    const thread  = Thread[xhr.bbsurl][xhr.key]

    if(xhr.status === 200){
        const dat = parse_dat(xhr.responseText, 1)

        thread.key     = xhr.key
        thread.bbsurl  = xhr.bbsurl
        thread.url     = thread_url(xhr.bbsurl, xhr.key)
        thread.scroll  = 0
        thread.subject = dat.subject
        thread.html    = dat.html
        thread.num     = dat.num
        thread.byte    = Number(xhr.getResponseHeader('Content-Length'))
        thread.etag    = xhr.getResponseHeader('ETag')
    }
    else if(xhr.status === 206){
        const dat = parse_dat(xhr.responseText, thread.num+1)

        thread.html   += dat.html
        thread.num    += dat.num
        thread.byte   += Number(xhr.getResponseHeader('Content-Length') || 0)
        thread.etag    = xhr.getResponseHeader('ETag')
    }
    else if(xhr.status === 404){
        // URLに/kako/が含まれていなければリトライ
    }

    render_thread(thread)
}

function thread_url(bbsurl, key){
    if(key){
        const dir = bbsurl.split('/').slice(0, -1)
        const bbs = dir.pop()
        return `${dir.join('/')}/test/read.cgi/${bbs}/${key}/`
    }
    else{
        const threadurl = bbsurl
        const dir = bbsurl.split('/').slice(0, -1)
        const key = dir.pop()
        const bbs = dir.pop()
        dir.pop()
        dir.pop()
        return {bbsurl:`${dir.join('/')}/${bbs}/`, key}
    }
}

function subject_loadend(xhr){
    if(xhr.status !== 200){
        サブジェクト一覧_tbody.innerHTML = ''
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

    サブジェクト一覧_tbody.innerHTML = html
    サブジェクト一覧_tbody.dataset.bbsurl = xhr.bbsurl

    document.title = `${base.title} [ ${bbs.name} ]`
    change_selected(bbs.el, 板一覧)

    grid3.scrollTop = 0
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
    else if(url.endsWith('txt')){
        xhr.open('GET', `${url}?${Date.now()}`)
        xhr.bbsurl = url.replace('subject.txt', '')
        history.replaceState(null, null, xhr.bbsurl);
    }
    else{
        xhr.open('GET', `${url}?${Date.now()}`)
        xhr.bbsurl = url.replace(/\/(dat|kako)\/\d.*/, '/')
        xhr.key    = url.split('/').pop().replace(/\..*/, '')
        history.replaceState(null, null, thread_url(xhr.bbsurl, xhr.key))
        if(Thread[xhr.bbsurl] && Thread[xhr.bbsurl][xhr.key]){
            xhr.setRequestHeader('Range', `bytes=${Thread[xhr.bbsurl][xhr.key].byte || 0}-`)
            xhr.setRequestHeader('If-None-Match', Thread[xhr.bbsurl][xhr.key].etag)
        }
    }
    xhr.overrideMimeType('text/plain; charset=shift_jis')
    xhr.timeout = 30 * 1000
    xhr.onloadend = function(){
        ナビ_アニメ.dataset.ajax = Number(ナビ_アニメ.dataset.ajax) - 1
        if(!Thread[xhr.bbsurl]){
            Thread[xhr.bbsurl] = {};
        }
        if(!Thread[xhr.bbsurl][xhr.key] && xhr.key){
            Thread[xhr.bbsurl][xhr.key] = {};
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
    el.style.left = `${innerWidth/2 - width/2}px`
    el.style.top  = `${innerHeight/2 - height/2}px`
}



function set_value(form, value){
    for(const el of form.querySelectorAll('[name]')){
        if(el.name in value){
            el.value = value[el.name]
        }
    }
}


function copy_url_title(){
    navigator.clipboard.writeText(`${コンテキスト.target.innerHTML}\n${コンテキスト.target.href}\n`)
}


function go_bbs(bbsurl){
    板一覧[bbsurl].el.click()
}





const Thread = {}

base.title = document.title
ナビ_全板ボタン.textContent = `▽${document.title}`
ナビ_全板ボタン.タグ作成()

for(const el of 板一覧.querySelectorAll('a')){
    const dir = el.href.split('/')
    dir.pop()
    板一覧[el.href] = {
        url  : el.href,
        name : el.textContent,
        key  : dir.pop(),
        home : dir.join('/') + '/',
        el   : el,
    }
}

if(document.URL !== base.href){
    if(板一覧[document.URL]){
        ajax(`${document.URL}subject.txt`, subject_loadend)
    }
    else{
        const {bbsurl, key} = thread_url(document.URL)
        ajax(`${bbsurl}dat/${key}.dat`, dat_loadend)
    }
}
