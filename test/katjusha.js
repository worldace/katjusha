/*
「タブ.新しく開く」時に thread がない問題。スレッド.オブジェクト
全板ボタン 増えたとき
*/




かちゅぼーど.スタート = function (){
    かちゅぼーど.href = document.URL
    base.title        = document.title
    全板ボタン.textContent = `▽${base.title}`

    掲示板.ホスト一覧 = new Set

    for(const a of 掲示板.querySelectorAll('a')){
        掲示板[a.href] = new 掲示板.オブジェクト(a)
        掲示板.ホスト一覧.add(掲示板[a.href].host)
    }

    タブ.新しく開く()
    if(かちゅぼーど.href !== base.href){
        かちゅぼーど.click()
    }
}



かちゅぼーど.onclick = function(event){
    const url = event.target.href
    if(!url || !掲示板.ホスト一覧.has(new URL(url).hostname)){
        return
    }
    event.preventDefault()
    if(掲示板[url]){
        change_selected(掲示板, 掲示板[url].el)
        ajax(url)
    }
    else if(url.includes('read.cgi')){
        event.target.target ? タブ.新しく開く(url, スレッド[url]) : タブ.開く(url, スレッド[url])
        ajax(url)
    }
    else if(url === base.href){
        history.replaceState(null, null, url)
    }
}



ヘッダ.oncontextmenu = function (event){
    event.preventDefault()
}



全板ボタン.onclick = function(event){
    if(コンテキスト.firstChild){
        return
    }
    event.stopPropagation()
    const {left, bottom} = this.getBoundingClientRect()
    コンテキスト.表示(全板ボタン.コンテキスト(), left, bottom)
}



全板ボタン.コンテキスト = function (){
    let ul = ''
    for(const el of 掲示板.querySelectorAll('a, summary')){
        ul += el.tagName === 'A' ? `<li><a href="${el.href}">${el.textContent}</a></li>` : `</ul></li><li class="menu-sub"><a>${el.textContent}</a><ul>`
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
    if(event.target.tagName === 'TH'){
        sort_table(event.target)
    }
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



サブジェクト一覧.受信後 = function (response, url, text){
    history.replaceState(null, null, url)
    if(response.status !== 200){
        サブジェクト一覧.innerHTML = ''
        return
    }

    サブジェクト一覧.innerHTML = サブジェクト一覧.parse(text, url)
    サブジェクト一覧.bbsurl    = url

    document.title = `${base.title} [ ${掲示板[url].name} ]`
    change_selected(掲示板, 掲示板[url].el)

    サブジェクト.scrollTop = 0
    ステータス.textContent = `${サブジェクト一覧.childElementCount}件のスレッドを受信 (${date()})`
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



サブジェクト一覧.parse = function(text, bbsurl){
    const subjects = text.split('\n')
    subjects.pop()

    let html = ''
    let num  = 1
    for(const v of subjects){
        const [datfile, subject, resnum] = v.replace(/\s?\((\d+)\)$/, '<>$1').split('<>')
        const key    = datfile.replace('.dat', '')
        const url    = スレッド.URL作成(bbsurl, key)
        const thread = スレッド[url] || {}

        html += `<tr data-url="${url}"><td>${num++}</td><td><a href="${url}">${subject}</a></td><td>${resnum}</td><td>${thread.既得 || ''}</td><td>${thread.新着 || ''}</td><td>${thread.最終取得 || ''}</td><td>${thread.最終書き込み || ''}</td><td></td></tr>`

        if(resnum == thread.既得){
            thread.新着 = 0
        }
    }
    return html
}



ヘルプアイコン.onclick = function(event){
    if(コンテキスト.firstChild){
        return
    }
    event.stopPropagation()
    const {left, bottom} = this.getBoundingClientRect()
    コンテキスト.表示(ヘルプアイコン.コンテキスト(), left, bottom)
}



ヘルプアイコン.コンテキスト = function (){
    return `
    <ul class="menu">
      <li><a href="https://spelunker2.wordpress.com/2020/02/21/katjusha/" target="_blank">かちゅぼ～どサイト</a></li>
      <li></li>
      <li><a href="${base.href}">${base.title}</a></li>
    </ul>
    `
}



スレッド投稿アイコン.onclick = function (event){
    if(かちゅぼーど.dataset.open){
        return
    }
    const bbs = 掲示板[サブジェクト一覧.bbsurl]
    if(!bbs){
        return
    }

    投稿フォーム_form.setAttribute('action', `${bbs.home}test/bbs.cgi`)
    set_form(投稿フォーム, {
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
    投稿フォーム_投稿ボタン.disabled = false
    投稿フォーム_タイトル.innerHTML  = `『${bbs.name}』に新規スレッド`
    かちゅぼーど.dataset.open = 'スレッド'
    centering(投稿フォーム)
    投稿フォーム_タイトル欄.focus()
}



レス投稿アイコン.onclick = function (event){
    if(かちゅぼーど.dataset.open){
        return
    }
    if(!現在のタブ.url){
        return
    }

    const thread = スレッド[現在のタブ.url]

    投稿フォーム_form.setAttribute('action', `${thread.bbs.home}test/bbs.cgi`)
    set_form(投稿フォーム, {
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
    投稿フォーム_投稿ボタン.disabled = false
    投稿フォーム_タイトル.innerHTML  = `「${thread.subject}」にレス`
    かちゅぼーど.dataset.open = 'レス'
    centering(投稿フォーム)
    投稿フォーム_本文欄.focus()
}



レス更新アイコン.onclick = function (event){
    if(現在のタブ.url){
        タブ.選択(現在のタブ)
        ajax(現在のタブ.url)
    }
}



中止アイコン.onclick = function (event){
}



ごみ箱アイコン.onclick = function (event){
    const url = 現在のタブ.url
    if(スレッド[url]){
        ステータス.textContent = `「${スレッド[url].subject}」のログを削除しました`
        delete スレッド[url]
    }
}



タブ閉じるアイコン.onclick = function (event){
    タブ.閉じる(現在のタブ)
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
    if(event.target.tagName !== 'LI' || event.target.id){
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
    for(const tab of Array.from(タブ.children)){
        if(tab.url !== url){
            タブ.閉じる(tab)
        }
    }
}



タブ.開く = function (url, thread = {}){
    if(!タブ.childElementCount){
        return タブ.新しく開く(url, thread)
    }
    const result = タブ.検索(url)
    if(result){
        return タブ.選択(result)
    }
    const tab = 現在のタブ
    tab.url          = url
    tab.innerHTML    = thread.subject || ''
    tab.el.url       = url
    tab.el.innerHTML = thread.html || ''
    return タブ.選択(tab)
}



タブ.新しく開く = function (url, thread = {}){
    if(タブ.childElementCount === 1 && !タブ.firstChild.url){
        return タブ.開く(url, thread)
    }
    const result = タブ.検索(url)
    if(result){
        return タブ.選択(result)
    }
    const tab        = document.createElement('li')
    tab.url          = url
    tab.innerHTML    = thread.subject || ''

    tab.el           = document.createElement('div')
    tab.el.url       = url
    tab.el.className = 'スレッド'
    tab.el.innerHTML = thread.html || ''

    タブ.append(tab)
    スレッド.append(tab.el)
    return タブ.選択(tab)
}



タブ.閉じる = function (tab){
    if(!tab || !tab.url){
        return
    }
    const next = tab.previousElementSibling || tab.nextElementSibling || タブ.新しく開く()
    tab.el.remove()
    tab.remove()
    タブ.選択(next)
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
    スレッドヘッダ.描画(tab.url)
    history.replaceState(null, null, tab.url || サブジェクト一覧.bbsurl || base.href)
    return tab
}



タブ.ロード開始 = function (url){
    const tab = タブ.検索(url)
    if(tab){
        tab.dataset.loading = true
    }
}

タブ.ロード終了 = function (url){
    const tab = タブ.検索(url)
    if(tab){
        delete tab.dataset.loading
    }
}



スレッド.onclick = function (event){
    if(event.target.tagName === 'I'){
        event.stopPropagation()
        コンテキスト.表示(スレッド.コンテキスト(event.target.textContent), event.pageX, event.pageY)
    }
}



スレッド.onscroll = function(event){
    const url = 現在のスレッド.url
    if(スレッド[url]){
        スレッド[url].scroll = スレッド.scrollTop
    }
}



スレッド.追記 = function(url, title, html){
    const tab         = タブ.検索(url) || 現在のタブ
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
    const el = 現在のスレッド.children[n-1]
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



スレッド.受信後 = function (response, url, text, size){
    history.replaceState(null, null, url)
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
        thread.byte    = size
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
        const dat    = スレッド.parse(text, thread.num)

        if(dat.isBroken){
            ajax.retry(url)
            return
        }

        thread.html   += dat.html
        thread.num    += dat.num
        thread.byte   += size || 0
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
        ajax.retry(url)
    }
}



スレッド.parse = function(text, no = 0){
    const dat = text.split('\n')
    dat.pop()

    let isBroken = false
    let html     = ''
    for(const v of dat){
        no++
        let [from, mail, date, message, subject] = v.split('<>')
        if(subject === undefined){
            from = mail = date = message = subject = 'ここ壊れてます'
            isBroken = true
        }
        //datファイルにaタグが含まれる場合は下記コメントを外す
        //message = message.replace(/<a (.+?)>(.+?)<\/a>/g, '$2')
        message = message.replace(/&gt;&gt;(\d{1,4})/g, '<span class="anker" onclick="スレッド.アンカー移動($1)" onmouseenter="レスポップアップ.表示($1)" onmouseleave="レスポップアップ.閉じる()">&gt;&gt;$1</span>')
        message = message.replace(/(https?:\/\/[^\s<]+)/g, '<a href="$1" target="_blank">$1</a>')
        message = message.replace(/^ /, '')
        html += `<article class="レス" data-no="${no}"><header><i>${no}</i> 名前：<span class="from"><b>${from}</b></span> <time>投稿日：${date}</time><address>${mail}</address></header><p>${message}</p></article>`
    }
    return {html, num:dat.length, subject:dat[0].split('<>').pop(), isBroken}
}



レスポップアップ.表示 = function(n){
    const res = 現在のスレッド.children[n-1]
    if(!res){
        return
    }
    const {top, left, width}      = event.target.getBoundingClientRect()
    レスポップアップ.style.left   = `${left + width / 2}px`
    レスポップアップ.style.bottom = `${innerHeight - top + 6}px`
    レスポップアップ.innerHTML    = res.outerHTML
}



レスポップアップ.閉じる = function(){
    レスポップアップ.innerHTML = ''
}



レスポップアップ.onclick = function(event){
    レスポップアップ.閉じる()
}



投稿フォーム.oncontextmenu = function (event){
    if(event.target.tagName === 'TEXTAREA' || event.target.type === 'text'){
        return
    }
    event.preventDefault()
}



投稿フォーム_form.onreset = function (event){
    投稿フォーム.閉じる()
}



投稿フォーム_閉じるボタン.onclick = function (event){
    投稿フォーム.閉じる()
}



投稿フォーム_sage.onchange = function (event){
    投稿フォーム_メール欄.readOnly = this.checked
    投稿フォーム_メール欄.value    = this.checked ? 'sage' : ''
}



投稿フォーム_ヘッダ.onmousedown = function (event){
    dnd_window(投稿フォーム, event, () => 投稿フォーム_本文欄.focus())
}



投稿フォーム_form.onsubmit = function (event){
    event.preventDefault()
    投稿フォーム_投稿ボタン.disabled = true
    ajax(this.getAttribute('action'), new FormData(this))
}



投稿フォーム.受信後 = function (response, url, text){
    if(response.status !== 200){
        alert('エラーが発生して投稿できませんでした')
        投稿フォーム_投稿ボタン.disabled = false
        return
    }
    if(text.includes('<title>ＥＲＲＯＲ！')){
        alert(text.match(/<b>(.+?)</i)[1])
        投稿フォーム_投稿ボタン.disabled = false
        return
    }

    if(url.includes('read.cgi')){
        スレッド[url].最終書き込み = date()
    }

    ajax(url)
    投稿フォーム.閉じる()
}



投稿フォーム.閉じる = function (){
    delete かちゅぼーど.dataset.open
}



コンテキスト.表示 = function (html, x, y){
    コンテキスト.style.left = `${x}px`
    コンテキスト.style.top  = `${y}px`
    コンテキスト.innerHTML  = html
    document.addEventListener('click', コンテキスト.閉じる, {once:true})
}



コンテキスト.閉じる = function (){
    コンテキスト.innerHTML = ''
}



コンテキスト.onclick = function (event){
    if(event.target.onclick || event.target.href){
        return
    }
    event.stopPropagation()
}



コンテキスト.oncontextmenu = function (event){
    event.preventDefault()
}



async function ajax(url, body){
    const request  = {cache:'no-store', mode:'cors', body}
    let   response
    let   callback

    if(url.includes('bbs.cgi')){
        request.url    = url
        request.method = 'POST'

        const home   = url.replace('test/bbs.cgi', '')
        const bbsurl = (home in 掲示板) ? home : `${home}${body.get('bbs')}/`
        url          = body.get('key') ? スレッド.URL作成(bbsurl, body.get('key')) : bbsurl
        callback     = 投稿フォーム.受信後
    }
    else if(url.includes('read.cgi')){
        const {bbsurl, key} = スレッド.URL分解(url)
        request.url = `${bbsurl}dat/${key}.dat`
        if(スレッド[url]){
            request.headers = {'Range': `bytes=${スレッド[url].byte || 0}-`, 'If-None-Match': スレッド[url].etag}
        }
        callback = スレッド.受信後
    }
    else{
        request.url = `${url}subject.txt`
        callback    = サブジェクト一覧.受信後
    }


    try{
        ステータス.textContent = `${new URL(url).hostname}に接続しています`
        アニメ.dataset.ajax    = Number(アニメ.dataset.ajax) + 1
        タブ.ロード開始(url)
        response = await fetch(request.url, request)
    }
    catch(error){
        if(error.name !== 'AbortError'){
            request.error = `${new URL(url).hostname}に接続できませんでした`
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

    callback(response, url, text, buffer.byteLength)
}



ajax.retry = function (url){
    delete スレッド[url]
    ajax(url)
}



function change_selected(parent, el){
    const id = `現在の${parent.id}`
    if(window[id]){
        window[id].id = ''
    }
    el.id = id
}



function centering(el){
    const {width, height} = el.getBoundingClientRect()
    el.style.left = `${innerWidth/2 - width/2}px`
    el.style.top  = `${innerHeight/2 - height/2}px`
}



function dnd_window(el, event, fn){
    const {left, top, width, height} = el.getBoundingClientRect()

    const startX = left - event.pageX
    const startY = top  - event.pageY
    const limitX = innerWidth  - width  - 1
    const limitY = innerHeight - height - 1

    document.addEventListener('mousemove', mousemove, {passive:true})
    document.addEventListener('mouseup',   mouseup,   {once:true})

    function mousemove(event){
        el.style.left = Math.min(Math.max(0, startX+event.pageX), limitX) + 'px'
        el.style.top  = Math.min(Math.max(0, startY+event.pageY), limitY) + 'px'
    }

    function mouseup(event){
        document.removeEventListener('mousemove', mousemove)
        if(fn){
            fn(event)
        }
    }
}



function set_form(form, map){
    for(const el of form.querySelectorAll('[name]')){
        if(el.name in map){
            el.value = map[el.name]
        }
    }
}



function insert_text(textarea, text){
    const cursor = textarea.selectionStart
    const before = textarea.value.substr(0, cursor)
    const after  = textarea.value.substr(cursor, textarea.value.length)

    textarea.value = before + text + after
}



function sort_table(th){
    const index = th.cellIndex
    const order = Number(th.dataset.order || -1)
    const tbody = th.closest('table').tBodies[0]
    const rows  = Array.from(tbody.rows)
    const compare = new Intl.Collator(undefined, {numeric: true}).compare

    rows.sort((a, b) => compare(a.cells[index].textContent, b.cells[index].textContent) * order)
    rows.forEach(tr  => tbody.append(tr))

    th.dataset.order = -order
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



function copy(str){
    navigator.clipboard.writeText(str)
}



function format_KB(byte = 0){
    return Math.ceil(byte/1024) + 'KB'
}



かちゅぼーど.スタート()
