/*
書き込み後に 416エラー
*/






ヘッダ.oncontextmenu = function (event){
    event.preventDefault()
}



全板ボタン.onclick = function(event){
    event.stopPropagation()
    
    const {left, bottom} = this.getBoundingClientRect()
    コンテキスト.表示(全板ボタン.コンテキスト(), this, left, bottom)
}



全板ボタン.コンテキスト = function (){
    let ul = ''
    for(const el of 掲示板.querySelectorAll('*')){
        if(el.tagName === 'SUMMARY'){
            ul += `</ul></li><li class="menu-sub"><span>${el.textContent}</span><ul>`
        }
        else if(el.tagName === 'A'){
            ul += `<li><span onclick="掲示板に移動('${el.href}')">${el.textContent}</span></li>`
        }
    }
    return `<ul class="menu">${ul.slice(10)}</ul>`
}



掲示板.onclick = function(event){
    event.preventDefault()
    if(event.target.tagName === 'A'){
        change_selected(掲示板, event.target)
        ajax(event.target.href)
    }
}



掲示板.oncontextmenu = function (event){
    event.preventDefault()
    if(event.target.tagName === 'A'){
        change_selected(掲示板, event.target)
        コンテキスト.表示(掲示板.コンテキスト(event.target.href, event.target.innerHTML), event.target, event.pageX, event.pageY)
    }
}


掲示板.コンテキスト = function (url, name){
    return `
    <ul class="menu">
      <li><span onclick="copy('${url}')">URLをコピー</span></li>
      <li><span onclick="copy('${name}\\n${url}\\n')">掲示板名とURLをコピー</span></li>
    </ul>
    `
}



サブジェクト.oncontextmenu = function (event){
    event.preventDefault()
}



サブジェクト一覧.onclick = function(event){
    event.preventDefault()
    const tr = event.target.closest('tr')
    if(!tr){
        return
    }
    change_selected(サブジェクト一覧, tr)

    const url      = tr.dataset.url
    const {bbsurl} = parse_thread_url(url)

    const tab = タブ.開く(url)
    タブ.描画(tab, スレッド[url] || {subject:tr.cells[1].textContent, num:tr.cells[2].textContent, bbsurl})

    ajax(url)
}


サブジェクト一覧.oncontextmenu = function (event){
    event.preventDefault()
    const tr = event.target.closest('tr')
    if(tr){
        const a = tr.querySelector('a')
        change_selected(サブジェクト一覧, tr)
        コンテキスト.表示(サブジェクト一覧.コンテキスト(a.href, a.innerHTML), a, event.pageX, event.pageY)
    }
}


サブジェクト一覧.コンテキスト = function (url, name){
    return `
    <ul class="menu context-subject">
      <li><span onclick="サブジェクト一覧.コンテキスト.新しいタブで開く('${url}')">新しいタブで開く</span></li>
      <li><span onclick="copy('${url}')">URLをコピー</span></li>
      <li><span onclick="copy('${name}\\n${url}\\n')">タイトルとURLをコピー</span></li>
    </ul>
    `
}


サブジェクト一覧.コンテキスト.新しいタブで開く = function (url){
    const tab = タブ.新しく開く(url)
    if(スレッド[url]){
        タブ.描画(tab, スレッド[url])
    }
    ajax(url)
}




サブジェクト一覧.更新 = function (thread){
    const tr = サブジェクト一覧.querySelector(`[data-url="${thread.url}"]`)
    if(tr){
        tr.cells[2].textContent = thread.num || ''
        tr.cells[3].textContent = thread.既得 || ''
        tr.cells[4].textContent = thread.新着 || ''
        tr.cells[5].textContent = thread.最終取得 || ''
        tr.cells[6].textContent = thread.最終書き込み || ''
    }
}



スレッド投稿ボタン.onclick = function (event){
    if(投稿フォーム.dataset.open){
        return
    }
    const bbs = 掲示板[サブジェクト一覧.bbsurl]
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

    投稿フォーム_sage.checked        = false
    投稿フォーム_メール欄.disabled   = false
    投稿フォーム_タイトル欄.disabled = false
    投稿フォーム_タイトル.innerHTML  = `『${bbs.name}』に新規スレッド`
    投稿フォーム.dataset.open = 'スレッド'
    centering(投稿フォーム)
    投稿フォーム_タイトル欄.focus()
}



レス投稿ボタン.onclick = function (event){
    if(投稿フォーム.dataset.open){
        return
    }
    const tab = タブ.querySelector('[data-selected]')
    if(!tab.thread){
        return
    }

    const bbs = 掲示板[tab.thread.bbsurl]

    投稿フォーム_form.setAttribute('action', `${bbs.home}test/bbs.cgi`)
    set_value(投稿フォーム, {
        subject : tab.innerHTML,
        FROM    : '',
        mail    : '',
        MESSAGE : '',
        bbs     : bbs.key,
        key     : tab.thread.key
    })

    投稿フォーム_sage.checked        = false
    投稿フォーム_メール欄.disabled   = false
    投稿フォーム_タイトル欄.disabled = true
    投稿フォーム_タイトル.innerHTML  = `「${tab.innerHTML}」にレス`
    投稿フォーム.dataset.open = 'レス'
    centering(投稿フォーム)
    投稿フォーム_本文欄.focus()
}



スレッドヘッダ.oncontextmenu = function (event){
    event.preventDefault()
}


スレッドヘッダ_掲示板名.onclick = function (event){
    event.preventDefault()
    const bbsurl = this.querySelector('a').href
    if(bbsurl in 掲示板){
        ajax(bbsurl)
    }
}



スレッドヘッダ.描画 = function (bbsurl, subject, num){
    if(num){
        スレッドヘッダ_タイトル.innerHTML = `${subject} (${num})`
        スレッドヘッダ_掲示板名.innerHTML = `<a href="${bbsurl}">[${掲示板[bbsurl].name}]</a>`
        document.title = subject
    }
    else{
        スレッドヘッダ_タイトル.innerHTML = ''
        スレッドヘッダ_掲示板名.innerHTML = ''
        document.title = base.title
    }
}


タブ.oncontextmenu = function (event){
    event.preventDefault()
    if(event.target.tagName === 'LI'){
        コンテキスト.表示(タブ.コンテキスト(event.target.url, event.target.innerHTML), event.target, event.pageX, event.pageY)
    }
}



タブ.コンテキスト = function (url, name){
    return `
    <ul class="menu">
      <li><span onclick="タブ.コンテキスト.閉じる()">閉じる</span></li>
      <li><span onclick="タブ.コンテキスト.このタブ以外全て閉じる()">このタブ以外全て閉じる</span></li>
      <li><span onclick="copy('${url}')">URLをコピー</span></li>
      <li><span onclick="copy('${name}\\n${url}\\n')">タイトルとURLをコピー</span></li>
    </ul>
    `
}


タブ.コンテキスト.閉じる = function(){
    タブ.閉じる(コンテキスト.target)
}

タブ.コンテキスト.このタブ以外全て閉じる = function (){
    for(const tab of タブ.querySelectorAll('li')){
        if(tab !== コンテキスト.target){
            タブ.閉じる(tab)
        }
    }
}



タブ.初期化 = function (tab, url){
    if(!tab){
        tab = document.createElement('li')
        タブ.appendChild(tab)
    }
    if(tab.el){
        tab.el.remove()
    }
    tab.url          = url
    tab.el           = document.createElement('div')
    tab.el.url       = url
    tab.el.className = 'スレッド'
    スレッド.appendChild(tab.el)

    return tab
}



タブ.描画 = function (tab, thread){
    tab.thread         = thread
    tab.innerHTML      = thread.subject || ''
    tab.el.innerHTML   = thread.html || ''

    スレッド.scrollTop = thread.scroll || 0

    スレッドヘッダ.描画(thread.bbsurl, thread.subject, thread.num)

    return tab
}


タブ.開く = function (url){
    const tab = タブ.検索(url)
    if(tab.url !== url){
        タブ.初期化(tab, url)
    }
    タブ.選択(tab)
    return tab
}



タブ.新しく開く = function (url){
    let tab = タブ.検索(url)
    if(tab.url !== url){
        tab = タブ.初期化(null, url)
    }
    タブ.選択(tab)
    return tab
}




タブ.閉じる = function (tab){
    タブ.選択(tab.previousElementSibling || tab.nextElementSibling || タブ.初期化())
    tab.el.remove()
    tab.remove()
}



タブ.検索 = function (url){
    for(const tab of タブ.children){
        if(tab.url === url){
            return tab
        }
    }
    return タブ.querySelector('[data-selected]')
}



タブ.選択 = function (tab){
    change_selected(タブ, tab)
    change_selected(スレッド, tab.el)
    return tab
}



スレッド.addEventListener('scroll', function(event){
    スレッド[スレッド.selectedElement.url].scroll = スレッド.scrollTop
}, {passive:true});



スレッド.追記 = function(thread, appendHTML = ''){
    const tab = タブ.検索(thread.url)
    tab.thread    = thread
    tab.innerHTML = thread.subject

    tab.el.innerHTML  += appendHTML
    スレッド.scrollTop = thread.scroll

    スレッドヘッダ.描画(thread.bbsurl, thread.subject, thread.num)
}



投稿フォーム.oncontextmenu = function (event){
    if(event.target.tagName !== 'TEXTAREA'){
        event.preventDefault()
    }
}



投稿フォーム_form.onsubmit = function (event){
    event.preventDefault()
    ajax(this.getAttribute('action'), new FormData(this))
}



投稿フォーム_form.onreset = function (event){
    delete 投稿フォーム.dataset.open
}


投稿フォーム_閉じるボタン.onclick = function (event){
    delete 投稿フォーム.dataset.open
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
    投稿フォーム_本文欄.focus()
}



コンテキスト.表示 = function (html, target, x, y){
    コンテキスト.innerHTML    = html
    コンテキスト.target       = target
    コンテキスト.style.left   = `${x}px`
    コンテキスト.style.top    = `${y}px`
    コンテキスト.dataset.open = true
}



コンテキスト.onclick = function (event){
    event.stopPropagation()
    if(event.target.onclick){
        delete コンテキスト.dataset.open
        delete コンテキスト.target
    }
}



コンテキスト.oncontextmenu = function (event){
    event.preventDefault()
    event.target.click()
}



document.body.addEventListener('click', function(event){
    if(コンテキスト.dataset.open){
        delete コンテキスト.dataset.open
        delete コンテキスト.target
    }
})



function ajax(url, body){
    const xhr = new XMLHttpRequest()
    let callback

    if(url.endsWith('bbs.cgi')){
        xhr.open('POST', url)
        let bbsurl = url.replace('test/bbs.cgi', '')
        bbsurl  = (bbsurl in 掲示板) ? bbsurl : `${bbsurl}${body.get('bbs')}/`
        xhr.url = body.get('key') ? build_thread_url(bbsurl, body.get('key')) : bbsurl
        callback = 'cgi'
    }
    else if(url.includes('read.cgi')){
        const {bbsurl, key} = parse_thread_url(url)
        xhr.open('GET', `${bbsurl}dat/${key}.dat?${Date.now()}`)
        xhr.url = url
        if(url in スレッド){
            xhr.setRequestHeader('Range', `bytes=${スレッド[url].byte || 0}-`)
            xhr.setRequestHeader('If-Modified-Since', スレッド[url].mtime)
        }
        else{
            スレッド[url] = {}
        }
        callback = 'dat'
        history.replaceState(null, null, url)
    }
    else{
        xhr.open('GET', `${url}subject.txt?${Date.now()}`)
        xhr.url  = url
        callback = 'subject'
        history.replaceState(null, null, url)
    }
    xhr.overrideMimeType('text/plain; charset=shift_jis')
    xhr.timeout = 30 * 1000
    xhr.onloadend = function(){
        アニメ.dataset.ajax = Number(アニメ.dataset.ajax) - 1
        ajax[callback](xhr)
    }
    アニメ.dataset.ajax = Number(アニメ.dataset.ajax) + 1
    xhr.send(body)
}



ajax.cgi = function (xhr){
    if(xhr.status !== 200){
        alert('投稿できませんでした')
        return
    }
    if(xhr.responseText.includes('<title>ＥＲＲＯＲ！')){
        alert(xhr.responseText.match(/<b>(.+?)</i)[1])
        return
    }

    if(xhr.url.includes('read.cgi')){
        スレッド[xhr.url].最終書き込み = date()
    }

    ajax(xhr.url)
    delete 投稿フォーム.dataset.open
}



ajax.dat = function (xhr){
    const thread        = スレッド[xhr.url]
    const {bbsurl, key} = parse_thread_url(xhr.url)

    if(xhr.status === 200){
        const dat = parse_dat(xhr.responseText, 1)

        thread.key     = key
        thread.bbsurl  = bbsurl
        thread.url     = xhr.url
        thread.scroll  = 0
        thread.subject = dat.subject
        thread.html    = dat.html
        thread.num     = dat.num
        thread.byte    = Number(xhr.getResponseHeader('Content-Length'))
        thread.mtime   = xhr.getResponseHeader('Last-Modified')

        thread.既得    = dat.num
        thread.新着    = dat.num
        thread.最終取得= date()

        スレッド.追記(thread, dat.html)
        サブジェクト一覧.更新(thread)
    }
    else if(xhr.status === 206){
        const dat = parse_dat(xhr.responseText, thread.num+1)

        thread.html   += dat.html
        thread.num    += dat.num
        thread.byte   += Number(xhr.getResponseHeader('Content-Length') || 0)
        thread.mtime   = xhr.getResponseHeader('Last-Modified')

        thread.既得    = thread.num
        thread.新着    = dat.num
        thread.最終取得= date()

        スレッド.追記(thread, dat.html)
        サブジェクト一覧.更新(thread)
   }
    else if(xhr.status === 304){
        thread.新着 = 0
        サブジェクト一覧.更新(thread)
    }
    else if(xhr.status === 404){
        // URLに/kako/が含まれていなければリトライ
    }
}



ajax.subject = function (xhr){
    if(xhr.status !== 200){
        サブジェクト一覧.innerHTML = ''
        return
    }

    サブジェクト一覧.innerHTML = parse_subject(xhr.responseText, xhr.url)
    サブジェクト一覧.bbsurl    = xhr.url

    const bbs      = 掲示板[xhr.url]
    document.title = `${base.title} [ ${bbs.name} ]`
    change_selected(掲示板, bbs.el)

    サブジェクト.scrollTop = 0
}



function parse_dat(responseText, num){
    const list = responseText.split("\n")
    list.pop()

    const dat = {
        html   : '',
        num    : list.length,
        subject: list[0].split('<>').pop(),
    }

    for(const v of list){
        const [from, mail, date, message, subject] = v.split('<>')
        dat.html += `<section><header><i>${num}</i> 名前：<b>${from}</b> 投稿日：<date>${date}</date></header><p>${message}</p></section>`
        num++
    }
    return dat
}



function parse_subject(responseText, bbsurl){
    const list = responseText.split("\n")
    list.pop()

    let tr = ''
    let no = 1
    for(const v of list){
        const [file, subject, num] = v.replace(/\s?\((\d+)\)$/, '<>$1').split('<>')
        const key    = file.replace('.dat', '')
        const url    = build_thread_url(bbsurl, key)
        const thread = スレッド[url] || {}

        if(num == thread.既得){
            thread.新着 = 0
        }

        tr += `<tr data-url="${url}"><td>${no}</td><td><a href="${url}">${subject}</a></td><td>${num}</td><td>${thread.既得 || ''}</td><td>${thread.新着 || ''}</td><td>${thread.最終取得 || ''}</td><td>${thread.最終書き込み || ''}</td><td></td></tr>`
        no++
    }
    return tr
}



function build_thread_url(bbsurl, key){
    const dir = bbsurl.split('/').slice(0, -1)
    if(dir.length > 3){
        const bbs = dir.pop()
        return `${dir.join('/')}/test/read.cgi/${bbs}/${key}/`
    }
    else{
        const bbs = dir[2].slice(0, dir[2].indexOf('.'))
        return `${bbsurl}test/read.cgi/${bbs}/${key}/`
    }
}



function parse_thread_url(url){
    const dir = url.split('/').slice(0, -1)
    const key = dir.pop()
    const bbs = dir.pop()
    dir.pop()
    dir.pop()
    url = dir.join('/') + '/'
    const bbsurl = (url in 掲示板) ? url : `${url}${bbs}/`
    return {bbsurl, key}
}


function change_selected(parent, el){
    const before = parent.querySelector('[data-selected]')
    if(before){
        delete before.dataset.selected
    }
    el.dataset.selected    = 'selected'
    parent.selectedElement = el
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


function copy(str){
    navigator.clipboard.writeText(str)
}


function 掲示板に移動(bbsurl){
    掲示板[bbsurl].el.click()
}



function date(){
    const d  = new Date()

    const 年 = d.getFullYear()
    const 月 = String(d.getMonth()+1).padStart(2, 0)
    const 日 = String(d.getDate()).padStart(2, 0)
    const 時 = String(d.getHours()).padStart(2, 0)
    const 分 = String(d.getMinutes()).padStart(2, 0)
    const 秒 = String(d.getSeconds()).padStart(2, 0)

    return `${年}/${月}/${日} ${時}:${分}:${秒}`
}


function bbs(el){
    this.el   = el
    this.url  = el.href
    this.name = el.textContent

    const dir = el.href.split('/').slice(0, -1)
    if(dir.length > 3){
        this.key  = dir.pop()
        this.home = dir.join('/') + '/'
    }
    else{
        this.key  = dir[2].slice(0, dir[2].indexOf('.'))
        this.home = el.href
    }
}



//start up

base.title = document.title
全板ボタン.textContent = `▽${document.title}`

for(const el of 掲示板.querySelectorAll('a')){
    if(!el.target){
        掲示板[el.href] = new bbs(el)
    }
}

タブ.選択(タブ.初期化())

if(document.URL !== base.href){
    if(!掲示板[document.URL]){
        タブ.開く(document.URL)
    }
    ajax(document.URL)
}

