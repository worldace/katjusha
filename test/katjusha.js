/*
「タブ.新しく開く」時に thread がない問題。スレッド.オブジェクト
全板ボタン 増えたとき
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
            タブ.新しく開く(document.URL)
        }
        ajax(document.URL)
    }
}



katjusha.is_internal_url = function(url){
    url = new URL(url)
    return 掲示板.ホスト一覧.has(url.hostname)
}



katjusha.onclick = function(event){
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
        (event.target.target) ? タブ.新しく開く(url, スレッド[url]) : タブ.開く(url, スレッド[url])
        ajax(url)
    }
}



ヘッダ.oncontextmenu = function (event){
    event.preventDefault()
}



全板ボタン.onclick = function(event){
    event.stopPropagation()
    
    if(!コンテキスト.dataset.open){
        const {left, bottom} = this.getBoundingClientRect()
        コンテキスト.表示(全板ボタン.コンテキスト(), left, bottom)
    }
    else{
        コンテキスト.閉じる()
    }
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



掲示板.onmousedown = function(event){
    if(event.target.tagName !== 'A'){
        event.preventDefault()
    }
}



掲示板.oncontextmenu = function (event){
    event.preventDefault()
    event.stopPropagation()
    if(event.target.tagName === 'A'){
        change_selected(掲示板, event.target)
        コンテキスト.表示(掲示板.コンテキスト(event.target.href, event.target.innerHTML), event.pageX, event.pageY)
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



サブジェクト.oncontextmenu = function (event){
    event.preventDefault()
}



サブジェクトヘッダ.ondblclick = function (event){
    if(event.target.tagName !== 'TH'){
        return
    }
    const index = event.target.cellIndex
    const order = Number(event.target.dataset.order || -1)
    const tbody = this.parentElement.tBodies[0]
    const rows  = Array.from(tbody.rows)
    const compare = new Intl.Collator(undefined, {numeric: true}).compare

    rows.sort((a, b) => compare(a.cells[index].textContent, b.cells[index].textContent) * order)
    rows.forEach(tr  => tbody.append(tr))

    event.target.dataset.order = -order
}



サブジェクト一覧.onmousedown = function(event){
    event.preventDefault()
    const tr = event.target.closest('tr')
    if(!tr || event.target.cellIndex === 7){
        return
    }
    change_selected(サブジェクト一覧, tr)
    tr.querySelector('a').click()
}



サブジェクト一覧.oncontextmenu = function (event){
    event.preventDefault()
    event.stopPropagation()
    const tr = event.target.closest('tr')
    if(tr){
        const a = tr.querySelector('a')
        change_selected(サブジェクト一覧, tr)
        コンテキスト.表示(サブジェクト一覧.コンテキスト(a.href, a.innerHTML), event.pageX, event.pageY)
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
    タブ.新しく開く(url, スレッド[url])
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



サブジェクト一覧.parse = function(str, bbsurl){
    const list = str.split("\n")
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



ヘルプアイコン.onclick = function(event){
    event.stopPropagation()
    
    if(!コンテキスト.dataset.open){
        const {left, bottom} = this.getBoundingClientRect()
        コンテキスト.表示(ヘルプアイコン.コンテキスト(), left, bottom)
    }
    else{
        コンテキスト.閉じる()
    }
}



ヘルプアイコン.コンテキスト = function (){
    return `
    <ul class="menu">
      <li><a href="https://spelunker2.wordpress.com//" target="_blank">かちゅぼ～どサイト</a></li>
    </ul>
    `
}



スレッド投稿アイコン.onclick = function (event){
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
    投稿フォーム_メール欄.readOnly   = false
    投稿フォーム_タイトル欄.disabled = false
    投稿フォーム_タイトル.innerHTML  = `『${bbs.name}』に新規スレッド`
    katjusha.dataset.open = 'スレッド'
    centering(投稿フォーム)
    投稿フォーム_タイトル欄.focus()
}



レス投稿アイコン.onclick = function (event){
    if(katjusha.dataset.open){
        return
    }
    if(!タブ.selectedElement || !タブ.selectedElement.url){
        return
    }

    const thread = スレッド[タブ.selectedElement.url]

    投稿フォーム_form.setAttribute('action', `${thread.bbs.home}test/bbs.cgi`)
    set_value(投稿フォーム, {
        subject : thread.subject,
        FROM    : '',
        mail    : '',
        MESSAGE : '',
        bbs     : thread.bbs.key,
        key     : thread.key
    })

    投稿フォーム_sage.checked        = false
    投稿フォーム_メール欄.readOnly   = false
    投稿フォーム_タイトル欄.disabled = true
    投稿フォーム_タイトル.innerHTML  = `「${thread.subject}」にレス`
    katjusha.dataset.open = 'レス'
    centering(投稿フォーム)
    投稿フォーム_本文欄.focus()
}



レス更新アイコン.onclick = function (event){
    const tab = タブ.selectedElement
    if(tab && tab.url){
        タブ.選択(tab)
        ajax(tab.url)
    }
}



中止アイコン.onclick = function (event){
}



ごみ箱アイコン.onclick = function (event){
    if(!タブ.selectedElement){
        return
    }
    const url = タブ.selectedElement.url
    if(スレッド[url]){
        ステータス.textContent = `「${スレッド[url].subject}」のログを削除しました`
        delete スレッド[url]
    }
}



タブ閉じるアイコン.onclick = function (event){
    タブ.閉じる(タブ.selectedElement)
}



スレッドヘッダ.oncontextmenu = function (event){
    event.preventDefault()
}



スレッドヘッダ.描画 = function (url){
    if(スレッド[url]){
        const thread = スレッド[url]

        スレッドヘッダ_タイトル.innerHTML = `${thread.subject} (${thread.num})`
        スレッドヘッダ_掲示板名.innerHTML = `<a href="${thread.bbs.url}">[${掲示板[thread.bbs.url].name}]</a>`
        document.title = thread.subject
        スレッド.scrollTop = thread.scroll
    }
    else{
        スレッドヘッダ_タイトル.innerHTML = ''
        スレッドヘッダ_掲示板名.innerHTML = ''
        document.title = base.title
    }
}



タブ.onclick = function (event){
    if(event.target.tagName !== 'LI' || event.target.dataset.selected){
        return
    }
    タブ.選択(event.target)
}



タブ.ondblclick = function (event){
    レス更新アイコン.click()
}



タブ.oncontextmenu = function (event){
    event.preventDefault()
    event.stopPropagation()
    if(event.target.tagName === 'LI'){
        コンテキスト.表示(タブ.コンテキスト(event.target.url, event.target.innerHTML), event.pageX, event.pageY)
    }
}



タブ.コンテキスト = function (url, name){
    return `
    <ul class="menu context-tab">
      <li><a onclick="タブ.コンテキスト.閉じる('${url}')">閉じる</a></li>
      <li><a onclick="タブ.コンテキスト.このタブ以外全て閉じる('${url}')">このタブ以外全て閉じる</a></li>
      <li><a onclick="copy('${url}')">URLをコピー</a></li>
      <li><a onclick="copy('${name}\\n${url}\\n')">タイトルとURLをコピー</a></li>
    </ul>
    `
}



タブ.コンテキスト.閉じる = function(url){
    タブ.閉じる(タブ.検索(url))
}



タブ.コンテキスト.このタブ以外全て閉じる = function (url){
    for(const tab of タブ.querySelectorAll('li')){
        if(tab.url !== url){
            タブ.閉じる(tab)
        }
    }
}



タブ.開く = function (url, thread = {}){
    const tab = タブ.検索(url)
    if(tab){
        return タブ.選択(tab)
    }
    else if(!タブ.childElementCount){
        return タブ.新しく開く(url, thread)
    }
    タブ.selectedElement.url          = url
    タブ.selectedElement.innerHTML    = thread.subject || ''
    タブ.selectedElement.el.url       = url
    タブ.selectedElement.el.innerHTML = thread.html || ''
    タブ.選択(タブ.selectedElement)
}



タブ.新しく開く = function (url, thread = {}){
    const tab = タブ.検索(url)
    if(tab){
        return タブ.選択(tab)
    }
    else if(タブ.childElementCount === 1 && !タブ.firstChild.url){
        return タブ.開く(url, thread)
    }
    const newtab        = document.createElement('li')
    newtab.url          = url
    newtab.innerHTML    = thread.subject || ''

    newtab.el           = document.createElement('div')
    newtab.el.url       = url
    newtab.el.className = 'スレッド'
    newtab.el.innerHTML = thread.html || ''

    タブ.append(newtab)
    スレッド.append(newtab.el)
    タブ.選択(newtab)
}



タブ.閉じる = function (tab){
    if(!tab || !tab.url){
        return
    }
    (タブ.childElementCount > 1) ? タブ.選択(tab.previousElementSibling || tab.nextElementSibling) : タブ.新しく開く()
    tab.el.remove()
    tab.remove()
}



タブ.検索 = function (url){
    for(const tab of タブ.children){
        if(tab.url === url){
            return tab
        }
    }
}



タブ.選択 = function (tab){
    change_selected(タブ, tab)
    change_selected(スレッド, tab.el)
    スレッドヘッダ.描画(tab.url) //密結合
    history.replaceState(null, null, tab.url || サブジェクト一覧.bbsurl || base.href)
}



タブ.ロード開始 = function (url){
    for(const tab of タブ.children){
        if(tab.url === url){
            tab.dataset.loading = true
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
        コンテキスト.表示(スレッド.コンテキスト(event.target.textContent), event.pageX, event.pageY)
    }
}



スレッド.onscroll = function(event){
    const url = スレッド.selectedElement.url
    if(スレッド[url]){
        スレッド[url].scroll = スレッド.scrollTop
    }
}



スレッド.追記 = function(url, title, html){
    const tab         = タブ.検索(url) || タブ.selectedElement
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
    const el = スレッド.selectedElement.children[n-1]
    if(el){
        el.scrollIntoView()
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
    return {bbsurl, key, bbs}
}



スレッド.コンテキスト = function (n){
    return `
    <ul class="menu">
      <li><a onclick="スレッド.コンテキスト.これにレス(${n})">これにレス</a></li>
    </ul>
    `
}



スレッド.コンテキスト.これにレス = function (n){
    レス投稿アイコン.click()
    insert_text(投稿フォーム_本文欄, `>>${n}\n`)
}



スレッド.parse = function(str, num = 1){
    const list = str.split("\n")
    list.pop()

    const dat = {
        html    : '',
        num     : list.length,
        subject : list[0].split('<>').pop(),
        isBroken: false
    }

    for(const v of list){
        let [from, mail, date, message, subject] = v.split('<>')
        if(subject === undefined){
            from = mail = date = message = subject = 'ここ壊れてます'
            dat.isBroken = true
        }
        message = message.replace(/&gt;&gt;(\d{1,4})/g, '<span class="anker" onclick="スレッド.アンカー移動($1)" onmouseenter="レスポップアップ.表示($1)" onmouseleave="レスポップアップ.閉じる()">&gt;&gt;$1</span>')
        message = message.replace(/(https?:\/\/[^\s<]+)/g, '<a href="$1" target="_blank">$1</a>')
        message = message.replace(/^ /, '')
        dat.html += `<article class="レス" data-no="${num}"><header><i>${num}</i> 名前：<b>${from}</b> 投稿日：<time>${date}</time><address>${mail}</address></header><p>${message}</p></article>`
        num++
    }
    return dat
}



レスポップアップ.表示 = function(n){
    const res = スレッド.selectedElement.children[n-1]
    if(!res){
        return
    }
    const {top, left, width}      = event.target.getBoundingClientRect()
    レスポップアップ.style.left   = `${left + width / 2}px`
    レスポップアップ.style.bottom = `${innerHeight - top + 6}px`
    レスポップアップ.innerHTML    = res.outerHTML
    レスポップアップ.dataset.open = true
}



レスポップアップ.閉じる = function(){
    delete レスポップアップ.dataset.open
}



レスポップアップ.onclick = function(){
    delete レスポップアップ.dataset.open
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
    投稿フォーム_メール欄.readOnly = this.checked
    投稿フォーム_メール欄.value    = this.checked ? 'sage' : ''
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



コンテキスト.表示 = function (html, x, y){
    コンテキスト.innerHTML    = html
    コンテキスト.style.left   = `${x}px`
    コンテキスト.style.top    = `${y}px`
    コンテキスト.dataset.open = true
}



コンテキスト.閉じる = function (){
    delete コンテキスト.dataset.open
}



コンテキスト.onclick = function (event){
    if(event.target.onclick || event.target.href){
        コンテキスト.閉じる()
    }
    else{
        event.stopPropagation()
    }
}



コンテキスト.oncontextmenu = function (event){
    event.preventDefault()
}



katjusha.addEventListener('click', function(event){
    delete コンテキスト.dataset.open
})



async function ajax(url, body){
    const request = {cache:'no-store', host:new URL(url).hostname}
    let   response
    let   callback

    if(url.includes('bbs.cgi')){
        request.url    = url
        request.method = 'POST'
        request.body   = body

        const home   = url.replace('test/bbs.cgi', '')
        const bbsurl = (home in 掲示板) ? home : `${home}${body.get('bbs')}/`
        url          = body.has('key') ? スレッド.URL作成(bbsurl, body.get('key')) : bbsurl
        callback     = ajax.cgi
    }
    else if(url.includes('read.cgi')){
        const {bbsurl, key} = スレッド.URL分解(url)
        request.url = `${bbsurl}dat/${key}.dat`
        if(スレッド[url]){
            request.headers = {'Range': `bytes=${スレッド[url].byte || 0}-`, 'If-None-Match': スレッド[url].etag}
        }
        history.replaceState(null, null, url)
        callback = ajax.dat
    }
    else{
        request.url = `${url}subject.txt`
        history.replaceState(null, null, url)
        callback = ajax.subject
    }


    try{
        ステータス.textContent = `${request.host}に接続しています`
        アニメ.dataset.ajax    = Number(アニメ.dataset.ajax) + 1
        タブ.ロード開始(url)
        response = await fetch(request.url, request)
    }
    catch(error){
        if(error.name !== 'AbortError'){
            request.error = `${request.host}に接続できませんでした`
        }
        return
    }
    finally{
        ステータス.textContent = request.error || ''
        アニメ.dataset.ajax = Number(アニメ.dataset.ajax) - 1
        タブ.ロード終了(url)
    }

    const buffer = await response.arrayBuffer()
    const text   = new TextDecoder('shift-jis').decode(buffer)

    callback(response, url, text)
}



ajax.cgi = function (response, url, text){
    if(response.status !== 200){
        alert('エラーが発生して投稿できませんでした')
        return
    }
    if(text.includes('<title>ＥＲＲＯＲ！')){
        alert(text.match(/<b>(.+?)</i)[1])
        return
    }

    if(url.includes('read.cgi')){
        スレッド[url].最終書き込み = date()
    }

    ajax(url)
    delete katjusha.dataset.open
}



ajax.dat = function (response, url, text){
    if(response.status === 200){
        const thread        = スレッド[url] = {}
        const dat           = スレッド.parse(text)
        const {bbsurl, key} = スレッド.URL分解(url)

        thread.bbs     = 掲示板[bbsurl]
        thread.key     = key
        thread.url     = url
        thread.scroll  = 0
        thread.subject = dat.subject
        thread.html    = dat.html
        thread.num     = dat.num
        thread.byte    = Number(response.headers.get('Content-Length'))
        thread.etag    = String(response.headers.get('ETag')).replace('W/', '')

        thread.既得    = dat.num
        thread.新着    = dat.num
        thread.最終取得= date()

        スレッド.クリア(thread.url)
        スレッド.追記(thread.url, thread.subject, thread.html)
        サブジェクト一覧.更新(thread)
        ステータス.textContent = `${dat.num}のレスを受信 (${date()}) ${format_KB(thread.byte)}`
    }
    else if(response.status === 206){
        const thread = スレッド[url]
        const dat    = スレッド.parse(text, thread.num+1)

        if(dat.isBroken){
            ajax.dat.retry(url)
            return
        }

        thread.html   += dat.html
        thread.num    += dat.num
        thread.byte   += Number(response.headers.get('Content-Length') || 0)
        thread.etag    = String(response.headers.get('ETag')).replace('W/', '')

        thread.既得    = thread.num
        thread.新着    = dat.num
        thread.最終取得= date()

        スレッド.追記(thread.url, thread.subject, dat.html)
        サブジェクト一覧.更新(thread)
        ステータス.textContent = `${dat.num}のレスを受信 (${date()}) ${format_KB(thread.byte)}`
   }
    else if(response.status === 304){
        const thread = スレッド[url]
        thread.新着 = 0
        サブジェクト一覧.更新(thread)
        ステータス.textContent = `新着なし (${date()}) ${format_KB(thread.byte)}`
    }
    else if(response.status === 404){
        ステータス.textContent = `スレッドが見つかりません (${date()})`
    }
    else if(response.status === 416){
        ajax.dat.retry(url)
    }
}



ajax.dat.retry = function (url){
    delete スレッド[url]
    ajax(url)
}



ajax.subject = function (response, url, text){
    if(response.status !== 200){
        サブジェクト一覧.innerHTML = ''
        return
    }

    const {html, num} = サブジェクト一覧.parse(text, url)
    サブジェクト一覧.innerHTML = html
    サブジェクト一覧.bbsurl    = url

    const bbs      = 掲示板[url]
    change_selected(掲示板, bbs.el)
    document.title = `${base.title} [ ${bbs.name} ]`

    サブジェクト.scrollTop = 0
    ステータス.textContent = `${num}件のスレッドを受信 (${date()})`
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
    const cursor = textarea.selectionStart
    const before = textarea.value.substr(0, cursor)
    const after  = textarea.value.substr(cursor, textarea.value.length)

    textarea.value = before + text + after
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
