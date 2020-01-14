/*
「タブ.開く」時に thread がない問題
ポップアップのスタック文脈問題
*/




katjusha.start = function (){
    base.title = document.title
    全板ボタン.textContent = `▽${document.title}`

    掲示板.ホスト一覧 = new Set

    for(const el of 掲示板.querySelectorAll('a')){
        掲示板[el.href] = new 掲示板.オブジェクト(el)
        掲示板.ホスト一覧.add(掲示板[el.href].host)
    }

    if(document.URL !== base.href){
        if(document.URL.includes('read.cgi')){
            タブ.開く(document.URL)
        }
        ajax(document.URL)
    }
}



katjusha.is_internal_url = function(url){
    url = new URL(url)
    return 掲示板.ホスト一覧.has(url.hostname)
}



katjusha.addEventListener('click', function(event){
    const url = event.target.href
    if(!url || !katjusha.is_internal_url(url)){
        return
    }
    event.preventDefault()
    if(掲示板[url]){
        change_selected(掲示板, 掲示板[url].el)
        ajax(url)
    }
    else if(url.includes('read.cgi')){
        const thread = スレッド[url] || {}
        タブ.開く(url, event.target.target, thread.subject, thread.html)
        ajax(url)
    }
})



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
            ul += `</ul></li><li class="menu-sub"><a>${el.textContent}</a><ul>`
        }
        else if(el.tagName === 'A'){
            ul += `<li><a href="${el.href}">${el.textContent}</a></li>`
        }
    }
    return `<ul class="menu">${ul.slice(10)}</ul>`
}



掲示板.onclick = function(event){
    if(event.target.tagName !== 'A'){
        event.preventDefault()
    }
}



掲示板.oncontextmenu = function (event){
    event.preventDefault()
    if(event.target.tagName === 'A'){
        change_selected(掲示板, event.target)
        コンテキスト.表示(掲示板.コンテキスト(event.target.href, event.target.innerHTML), event.target, event.pageX, event.pageY)
    }
}



掲示板.オブジェクト = function(el){
    this.el   = el
    this.url  = el.href
    this.name = el.textContent

    const dir = el.href.split('/').slice(0, -1)
    this.host = dir[2]
    if(dir.length > 3){
        this.key  = dir.pop()
        this.home = dir.join('/') + '/'
    }
    else{
        this.key  = dir[2].slice(0, dir[2].indexOf('.'))
        this.home = el.href
    }
}



掲示板.コンテキスト = function (url, name){
    return `
    <ul class="menu">
      <li><a onclick="copy('${url}')">URLをコピー</a></li>
      <li><a onclick="copy('${name}\\n${url}\\n')">掲示板名とURLをコピー</a></li>
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
    tr.querySelector('a').click()
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
      <li><a onclick="サブジェクト一覧.コンテキスト.新しいタブで開く('${url}')">新しいタブで開く</a></li>
      <li><a onclick="copy('${url}')">URLをコピー</a></li>
      <li><a onclick="copy('${name}\\n${url}\\n')">タイトルとURLをコピー</a></li>
    </ul>
    `
}


サブジェクト一覧.コンテキスト.新しいタブで開く = function (url){
    const thread = スレッド[url] || {} //new thread
    タブ.開く(url, '_blank', thread.subject, thread.html)
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
    if(katjusha.dataset.open){
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
    katjusha.dataset.open = 'スレッド'
    centering(投稿フォーム)
    投稿フォーム_タイトル欄.focus()
}



レス投稿ボタン.onclick = function (event){
    if(katjusha.dataset.open){
        return
    }
    const tab = タブ.selectedElement
    if(!tab || !tab.url){
        return
    }

    const {bbsurl, key} = スレッド.parse_url(tab.url)
    const bbs = 掲示板[bbsurl]

    投稿フォーム_form.setAttribute('action', `${bbs.home}test/bbs.cgi`)
    set_value(投稿フォーム, {
        subject : tab.innerHTML,
        FROM    : '',
        mail    : '',
        MESSAGE : '',
        bbs     : bbs.key,
        key     : key
    })

    投稿フォーム_sage.checked        = false
    投稿フォーム_メール欄.disabled   = false
    投稿フォーム_タイトル欄.disabled = true
    投稿フォーム_タイトル.innerHTML  = `「${tab.innerHTML}」にレス`
    katjusha.dataset.open = 'レス'
    centering(投稿フォーム)
    投稿フォーム_本文欄.focus()
}



レス取得ボタン.onclick = function (event){
    const tab = タブ.selectedElement
    if(!tab || !tab.url){
        return
    }
    タブ.選択(tab)
    ajax(tab.url)
}



スレッドヘッダ.oncontextmenu = function (event){
    event.preventDefault()
}



スレッドヘッダ.描画 = function (url){
    const thread = スレッド[url]
    if(thread){
        スレッドヘッダ_タイトル.innerHTML = `${thread.subject} (${thread.num})`
        スレッドヘッダ_掲示板名.innerHTML = `<a href="${thread.bbsurl}">[${掲示板[thread.bbsurl].name}]</a>`
        document.title = thread.subject
        スレッド.scrollTop = thread.scroll
    }
    else{
        スレッドヘッダ_タイトル.innerHTML = ''
        スレッドヘッダ_掲示板名.innerHTML = ''
        document.title = base.title
    }
}



タブ閉じるボタン.onclick = function (event){
    タブ.閉じる(タブ.selectedElement)
}



タブ.onclick = function (event){
    if(event.target.tagName !== 'LI' || event.target.dataset.selected){
        return
    }
    タブ.選択(event.target)
}



タブ.ondblclick = function (event){
    レス取得ボタン.click()
}



タブ.oncontextmenu = function (event){
    event.preventDefault()
    if(event.target.tagName === 'LI'){
        コンテキスト.表示(タブ.コンテキスト(event.target.url, event.target.innerHTML), event.target, event.pageX, event.pageY)
    }
}



タブ.コンテキスト = function (url, name){
    return `
    <ul class="menu context-tab">
      <li><a onclick="タブ.コンテキスト.閉じる()">閉じる</a></li>
      <li><a onclick="タブ.コンテキスト.このタブ以外全て閉じる()">このタブ以外全て閉じる</a></li>
      <li><a onclick="copy('${url}')">URLをコピー</a></li>
      <li><a onclick="copy('${name}\\n${url}\\n')">タイトルとURLをコピー</a></li>
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



タブ.開く = function (url, target, title = '', html = ''){
    let tab = タブ.検索(url) || タブ.初期化()
    if(tab.url !== url){ // urlのタブが存在しない時
        tab = (target === '_blank' && tab.url) ? タブ.初期化(null, url) : タブ.初期化(tab, url)
        tab.innerHTML    = title
        tab.el.innerHTML = html
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
    スレッドヘッダ.描画(tab.url)
    history.replaceState(null, null, tab.url || サブジェクト一覧.bbsurl || base.href)

    return tab
}



タブ.ロード開始 = function (url){
    for(const tab of タブ.children){
        if(tab.url === url){
            tab.dataset.loading = true
            return tab
        }
    }
}

タブ.ロード終了 = function (url){
    for(const tab of タブ.children){
        if(tab.url === url){
            delete tab.dataset.loading
        }
    }
}



スレッド.onclick = function (event){
    if(event.target.tagName === 'I'){
        event.stopPropagation()
        コンテキスト.表示(スレッド.コンテキスト(), event.target, event.pageX, event.pageY)
    }
    else if(event.target.target === '_self'){
        event.preventDefault()
        掲示板[event.target.href] ? 全板ボタン.コンテキスト.掲示板に移動(event.target.href) : サブジェクト一覧.コンテキスト.新しいタブで開く(event.target.href)
    }
}



スレッド.onscroll = function(event){
    スレッド[スレッド.selectedElement.url].scroll = スレッド.scrollTop
}



スレッド.追記 = function(url, title, html){
    const tab         = タブ.検索(url)
    tab.innerHTML     = title
    tab.el.innerHTML += html

    スレッドヘッダ.描画(url)
}



スレッド.クリア = function (url){
    for(const el of スレッド.children){
        if(el.url === url){
            el.innerHTML = ''
        }
    }
}



スレッド.アンカー移動 = function(n){
    const el = event.target.closest('.スレッド').querySelector(`[data-no="${n}"]`)
    if(el){
        el.scrollIntoView()
    }
}



スレッド.ポップアップ表示 = function(n){
    const el = event.target.closest('.スレッド').querySelector(`[data-no="${n}"]`)
    if(el){
        event.target.insertAdjacentHTML('beforeend', `<div class="popup">${el.innerHTML}</div>`)
    }
}



スレッド.ポップアップ閉じる = function(){
    while(event.target.firstElementChild){
        event.target.firstElementChild.remove()
    }
}



スレッド.URL作成 = function(bbsurl, key){
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



スレッド.URL分解 = function(url){
    const dir = url.split('/').slice(0, -1)
    const key = dir.pop()
    const bbs = dir.pop()
    dir.pop()
    dir.pop()
    url = dir.join('/') + '/'
    const bbsurl = (url in 掲示板) ? url : `${url}${bbs}/`
    return {bbsurl, key}
}



スレッド.コンテキスト = function (){
    return `
    <ul class="menu">
      <li><a onclick="スレッド.コンテキスト.これにレス()">これにレス</a></li>
    </ul>
    `
}



スレッド.コンテキスト.これにレス = function (){
    const n = コンテキスト.target.textContent
    レス投稿ボタン.click()
    insert_text(投稿フォーム_本文欄, `>>${n}\n`)
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
    delete katjusha.dataset.open
}



投稿フォーム_閉じるボタン.onclick = function (event){
    delete katjusha.dataset.open
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
    if(event.target.onclick || event.target.href){
        delete コンテキスト.dataset.open
        delete コンテキスト.target
    }
    else{
        event.stopPropagation()
    }
}



コンテキスト.oncontextmenu = function (event){
    event.preventDefault()
    event.target.click()
}



katjusha.addEventListener('click', function(event){
    if(コンテキスト.dataset.open){
        delete コンテキスト.dataset.open
        delete コンテキスト.target
    }
})



function ajax(url, body){
    const xhr = new XMLHttpRequest()
    let callback

    if(url.includes('bbs.cgi')){
        xhr.open('POST', url)
        let bbsurl = url.replace('test/bbs.cgi', '')
        bbsurl  = (bbsurl in 掲示板) ? bbsurl : `${bbsurl}${body.get('bbs')}/`
        xhr.url = body.get('key') ? スレッド.URL作成(bbsurl, body.get('key')) : bbsurl
        callback = 'cgi'
    }
    else if(url.includes('read.cgi')){
        const {bbsurl, key} = スレッド.URL分解(url)
        xhr.open('GET', `${bbsurl}dat/${key}.dat?${Date.now()}`)
        xhr.url = url
        if(url in スレッド){
            xhr.setRequestHeader('Range', `bytes=${スレッド[url].byte || 0}-`)
            xhr.setRequestHeader('If-None-Match', スレッド[url].etag)
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
        ステータス.textContent = ``
        アニメ.dataset.ajax    = Number(アニメ.dataset.ajax) - 1
        タブ.ロード終了(url)
        ajax[callback](xhr)
    }
    xhr.send(body)
    ステータス.textContent = `${(new URL(url)).hostname}に接続しています`
    アニメ.dataset.ajax    = Number(アニメ.dataset.ajax) + 1
    タブ.ロード開始(url)
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
    delete katjusha.dataset.open
}



ajax.dat = function (xhr){
    const thread        = スレッド[xhr.url]
    const {bbsurl, key} = スレッド.URL分解(xhr.url)

    if(xhr.status === 200){
        const dat = ajax.dat.parse(xhr.responseText, 1)

        thread.key     = key
        thread.bbsurl  = bbsurl
        thread.url     = xhr.url
        thread.scroll  = 0
        thread.subject = dat.subject
        thread.html    = dat.html
        thread.num     = dat.num
        thread.byte    = Number(xhr.getResponseHeader('Content-Length'))
        thread.etag    = String(xhr.getResponseHeader('ETag')).replace('W/', '')

        thread.既得    = dat.num
        thread.新着    = dat.num
        thread.最終取得= date()

        スレッド.追記(thread.url, thread.subject, thread.html)
        サブジェクト一覧.更新(thread)
        ステータス.textContent = `${dat.num}のレスを受信 (${date()}) ${format_KB(thread.byte)}`
    }
    else if(xhr.status === 206){
        const dat = ajax.dat.parse(xhr.responseText, thread.num+1)

        thread.html   += dat.html
        thread.num    += dat.num
        thread.byte   += Number(xhr.getResponseHeader('Content-Length') || 0)
        thread.etag    = String(xhr.getResponseHeader('ETag')).replace('W/', '')

        thread.既得    = thread.num
        thread.新着    = dat.num
        thread.最終取得= date()

        スレッド.追記(thread.url, thread.subject, dat.html)
        サブジェクト一覧.更新(thread)
        ステータス.textContent = `${dat.num}のレスを受信 (${date()}) ${format_KB(thread.byte)}`
   }
    else if(xhr.status === 304){
        thread.新着 = 0
        サブジェクト一覧.更新(thread)
        ステータス.textContent = `新着なし (${date()}) ${format_KB(thread.byte)}`
    }
    else if(xhr.status === 404){
        ステータス.textContent = `スレッドが見つかりません (${date()})`
        // /kako/ を含まなければリトライ？
    }
    else if(xhr.status === 416){
        スレッド.クリア(xhr.url)
        delete スレッド[xhr.url]
        ajax(xhr.url)
    }
}



ajax.dat.parse = function(responseText, num){
    const list = responseText.split("\n")
    list.pop()

    const dat = {
        html   : '',
        num    : list.length,
        subject: list[0].split('<>').pop(),
    }

    for(const v of list){
        let [from, mail, date, message, subject] = v.split('<>')
        message = message.replace(/&gt;&gt;(\d{1,4})/g, '<span class="anker" onclick="スレッド.アンカー移動($1)" onmouseenter="スレッド.ポップアップ表示($1)" onmouseleave="スレッド.ポップアップ閉じる()">&gt;&gt;$1</span>')
        message = message.replace(/(https?:\/\/[^\s<]+)/g, '<a href="$1" target="_blank">$1</a>')
        dat.html += `<section class="レス" data-no="${num}"><header><i>${num}</i> 名前：<b>${from}</b> 投稿日：<date>${date}</date></header><p>${message}</p></section>`
        num++
    }
    return dat
}



ajax.subject = function (xhr){
    if(xhr.status !== 200){
        サブジェクト一覧.innerHTML = ''
        return
    }

    const {html, num} = ajax.subject.parse(xhr.responseText, xhr.url)
    サブジェクト一覧.innerHTML = html
    サブジェクト一覧.bbsurl    = xhr.url

    const bbs      = 掲示板[xhr.url]
    document.title = `${base.title} [ ${bbs.name} ]`
    change_selected(掲示板, bbs.el)

    サブジェクト.scrollTop = 0
    ステータス.textContent = `${num}件のスレッドを受信 (${date()})`
}



ajax.subject.parse = function(responseText, bbsurl){
    const list = responseText.split("\n")
    list.pop()

    let tr = ''
    let no = 1
    for(const v of list){
        const [file, subject, num] = v.replace(/\s?\((\d+)\)$/, '<>$1').split('<>')
        const key    = file.replace('.dat', '')
        const url    = スレッド.URL作成(bbsurl, key)
        const thread = スレッド[url] || {}

        if(num == thread.既得){
            thread.新着 = 0
        }

        tr += `<tr data-url="${url}"><td>${no}</td><td><a href="${url}">${subject}</a></td><td>${num}</td><td>${thread.既得 || ''}</td><td>${thread.新着 || ''}</td><td>${thread.最終取得 || ''}</td><td>${thread.最終書き込み || ''}</td><td></td></tr>`
        no++
    }
    return {html:tr, num:list.length}
}



function change_selected(parent, el){
    const before = parent.querySelector('[data-selected]')
    if(before){
        delete before.dataset.selected
    }
    parent.selectedElement = el
    el.dataset.selected    = 'selected'
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



function insert_text(textarea, text){
    const cursor = textarea.selectionStart;
    const before = textarea.value.substr(0, cursor);
    const after  = textarea.value.substr(cursor, textarea.value.length);

    textarea.value = before + text + after;
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



function format_KB(byte = 0){
    return Math.ceil(byte/1024) + 'KB'
}



document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', katjusha.start) : katjusha.start()
