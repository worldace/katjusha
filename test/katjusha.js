/*
書き込み後に 416エラー
*/

const Thread = {}

base.title = document.title
ナビ_全板ボタン.textContent = `▽${document.title}`

for(const el of 板.querySelectorAll('a')){
    const dir = el.href.split('/').slice(0, -1)
    板[el.href] = {}

    板[el.href].url  = el.href
    板[el.href].name = el.textContent
    板[el.href].el   = el
    if(dir.length > 3){
        板[el.href].key  = dir.pop()
        板[el.href].home = dir.join('/') + '/'
    }
    else{
        板[el.href].key  = dir[2].slice(0, dir[2].indexOf('.'))
        板[el.href].home = el.href
    }
}

if(document.URL !== base.href){
    if(document.URL in 板){
        ajax(`${document.URL}subject.txt`, subject_loadend)
    }
    else{
        const {bbsurl, key} = parse_thread_url(document.URL)
        ajax(`${bbsurl}dat/${key}.dat`, dat_loadend)
    }
}




ナビ.oncontextmenu = function (event){
    event.preventDefault()
}



ナビ_全板ボタン.onclick = function(event){
    event.stopPropagation()
    
    if(!コンテキスト_全板ボタン_template.textContent){
        ナビ_全板ボタン.タグ作成()
    }
    const {left, bottom} = this.getBoundingClientRect()
    コンテキスト.表示('コンテキスト_全板ボタン', this, left, bottom)
}



ナビ_全板ボタン.タグ作成 = function (){
    let ul = ''
    for(const el of 板.querySelectorAll('*')){
        if(el.tagName === 'SUMMARY'){
            ul += `</ul></li><li class="menu-sub"><span>${el.textContent}</span><ul>`
        }
        else if(el.tagName === 'A'){
            ul += `<li><span onclick="go_bbs('${el.href}')">${el.textContent}</span></li>`
        }
    }
    コンテキスト_全板ボタン_template.innerHTML = `<ul id="コンテキスト_全板ボタン" class="menu">${ul.slice(10)}</ul>`
}



板.onclick = function(event){
    event.preventDefault()
    if(event.target.tagName === 'A'){
        change_selected(板, event.target)
        ajax(`${event.target.href}subject.txt`, subject_loadend)
    }
}



板.oncontextmenu = function (event){
    event.preventDefault()
    if(event.target.tagName === 'A'){
        change_selected(板, event.target)
        コンテキスト.表示('コンテキスト_板', event.target, event.pageX, event.pageY)
    }
}


grid3.oncontextmenu = function (event){
    event.preventDefault()
}



サブジェクト一覧.onclick = function(event){
    event.preventDefault()
    const tr = event.target.closest('tr')
    if(!tr){
        return
    }
    change_selected(サブジェクト一覧, tr)
    const {bbsurl, key} = parse_thread_url(tr.dataset.url)
    タブ.開く(tr.dataset.url, tr.cells[1].textContent, tr.cells[2].textContent)
    ajax(`${bbsurl}dat/${key}.dat`, dat_loadend)
}


サブジェクト一覧.oncontextmenu = function (event){
    event.preventDefault()
    const tr = event.target.closest('tr')
    if(tr){
        change_selected(サブジェクト一覧, tr)
        コンテキスト.表示('コンテキスト_サブジェクト一覧', tr.querySelector('a'), event.pageX, event.pageY)
    }
}



サブジェクト一覧.更新 = function (thread){
    const td = サブジェクト一覧.querySelectorAll(`[data-url="${thread.url}"] > td`)
    if(td.length){
        td[2].textContent = thread.num || ''
        td[3].textContent = thread.既得 || ''
        td[4].textContent = thread.新着 || ''
        td[5].textContent = thread.最終取得 || ''
        td[6].textContent = thread.最終書き込み || ''
    }
}



スレッド投稿ボタン.onclick = function (event){
    if(katjusha.dataset.dialog){
        return
    }
    const bbs = 板[サブジェクト一覧.dataset.bbsurl]
    if(!bbs){
        return
    }

    投稿フォーム_form.setAttribute('action', `${bbs.home}test/bbs.cgi`)
    投稿フォーム_form.setAttribute('data-bbsurl', bbs.url)
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
    katjusha.dataset.dialog = 'スレッド'
    centering(投稿フォーム)
    投稿フォーム_タイトル欄.focus()
}



レス投稿ボタン.onclick = function (event){
    if(katjusha.dataset.dialog){
        return
    }
    const tab = タブ.querySelector('[data-selected]')
    const bbs = 板[tab.dataset.bbsurl]

    if(!tab.dataset.key){
        return
    }

    投稿フォーム_form.setAttribute('action', `${bbs.home}test/bbs.cgi`)
    投稿フォーム_form.setAttribute('data-bbsurl', bbs.url)
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
    katjusha.dataset.dialog = 'レス'
    centering(投稿フォーム)
    投稿フォーム_本文欄.focus()
}



スレッドヘッダ.oncontextmenu = function (event){
    event.preventDefault()
}


スレッドヘッダ_板名.onclick = function (event){
    event.preventDefault()
    const bbsurl = this.querySelector('a').href
    if(板[bbsurl]){
        ajax(`${bbsurl}subject.txt`, subject_loadend)
    }
}



スレッドヘッダ.描画 = function (bbsurl, subject, num){
    if(num){
        スレッドヘッダ_タイトル.innerHTML = `${subject} (${num})`
        スレッドヘッダ_板名.innerHTML     = `<a href="${bbsurl}">[${板[bbsurl].name}]</a>`
        document.title = subject
    }
    else{
        スレッドヘッダ_タイトル.innerHTML = ''
        スレッドヘッダ_板名.innerHTML     = ''
        document.title = base.title
    }
}




タブ.検索 = function (url){
    for(const li of タブ.querySelectorAll('li')){
        if(li.url === url){
            return li
        }
    }
    return タブ.querySelector('[data-selected]')
}



タブ.閉じる = function (tab){
    if(タブ.childElementCount === 1){
        if(tab.el){
            tab.el.remove()
        }
        tab.innerHTML = ''
        delete tab.url
        delete tab.el
        delete tab.thread

        スレッドヘッダ.描画()
    }
    else{
        タブ.選択(tab.previousElementSibling || tab.nextElementSibling)
        tab.el.remove()
        tab.remove()
    }
}


タブ.選択 = function (tab){
    change_selected(タブ, tab)
    change_selected(スレッド, tab.el)
    スレッドヘッダ.描画(tab.thread.bbsurl, tab.thread.subject, tab.thread.num)
}




タブ.開く = function (url, subject, num){
    for(const li of タブ.querySelectorAll('li')){
        if(li.url === url){
            タブ.選択(li)
            return li
        }
    }

    const {bbsurl, key} = parse_thread_url(url)

    const div = スレッド.作成(url)
    const tab = タブ.querySelector('[data-selected]')
    if(tab.el){
        tab.el.remove()
    }

    tab.innerHTML = subject || ''
    tab.url       = url
    tab.el        = div

    スレッド.appendChild(div)
    change_selected(スレッド, div)

    if(Thread[bbsurl] && Thread[bbsurl][key]){
        div.innerHTML = Thread[bbsurl][key].html
        スレッド.scrollTop = Thread[bbsurl][key].scroll
    }

    スレッドヘッダ.描画(bbsurl, subject, num) // subject, numがない場合

    return tab
}




タブ.新しく開く = function (url, subject, num){
    for(const li of タブ.querySelectorAll('li')){
        if(li.url === url){
            タブ.選択(li)
            return li
        }
    }

    const {bbsurl, key} = parse_thread_url(url)

    const div     = スレッド.作成(url)
    const tab     = document.createElement('li')
    tab.innerHTML = subject || ''
    tab.url       = url
    tab.el        = div


    スレッド.appendChild(div)
    タブ.appendChild(tab)
    change_selected(タブ, tab)
    change_selected(スレッド, div)

    if(Thread[bbsurl] && Thread[bbsurl][key]){
        div.innerHTML = Thread[bbsurl][key].html
        スレッド.scrollTop = Thread[bbsurl][key].scroll
    }

    スレッドヘッダ.描画(bbsurl, subject, num)

    return tab
}


スレッド.作成 = function (url){
    const div     = document.createElement('div')
    div.className = 'スレッド'
    div.url       = url

    return div
}


スレッド.addEventListener('scroll', function(event){
    const {bbsurl, key} = parse_thread_url(document.URL)
    Thread[bbsurl][key].scroll = スレッド.scrollTop
}, {passive:true});



投稿フォーム.oncontextmenu = function (event){
    if(event.target.tagName !== 'TEXTAREA'){
        event.preventDefault()
    }
}



投稿フォーム_form.onsubmit = function (event){
    event.preventDefault()
    ajax(this.getAttribute('action'), cgi_loadend, new FormData(this), this.dataset.bbsurl)
}



投稿フォーム_form.onreset = function (event){
    delete katjusha.dataset.dialog
}


投稿フォーム_閉じるボタン.onclick = function (event){
    delete katjusha.dataset.dialog
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


コンテキスト.表示 = function (id, target, x, y){
    const menu = document.getElementById(`${id}_template`).content.cloneNode(true)
    コンテキスト.replaceChild(menu, コンテキスト.firstElementChild)

    コンテキスト.target       = target
    コンテキスト.style.left   = `${x}px`
    コンテキスト.style.top    = `${y}px`
    コンテキスト.dataset.open = id
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


function render_thread(thread){
    const tab = タブ.検索(thread.url)
    tab.thread    = thread
    tab.url       = thread.url
    tab.innerHTML = thread.subject

    if(!tab.el){
        tab.el = スレッド.作成(thread.url)
    }

    tab.el.innerHTML = thread.html
    スレッド.scrollTop = thread.scroll

    スレッドヘッダ.描画(thread.bbsurl, thread.subject, thread.num)
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



function dat_loadend(xhr){
    const thread  = Thread[xhr.bbsurl][xhr.key]

    if(xhr.status === 200){
        const dat = parse_dat(xhr.responseText, 1)

        thread.key     = xhr.key
        thread.bbsurl  = xhr.bbsurl
        thread.url     = build_thread_url(xhr.bbsurl, xhr.key)
        thread.scroll  = 0
        thread.subject = dat.subject
        thread.html    = dat.html
        thread.num     = dat.num
        thread.byte    = Number(xhr.getResponseHeader('Content-Length'))
        thread.mtime   = xhr.getResponseHeader('Last-Modified')

        thread.既得    = dat.num
        thread.新着    = dat.num
        thread.最終取得= date()
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
   }
    else if(xhr.status === 304){
        thread.新着    = 0
    }
    else if(xhr.status === 404){
        // URLに/kako/が含まれていなければリトライ
    }

    サブジェクト一覧.更新(thread)
    render_thread(thread)
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
        const thread = Thread[bbsurl][key] || {}

        if(num == thread.既得){
            thread.新着 = 0
        }

        tr += `<tr data-url="${url}"><td>${no}</td><td><a href="${url}">${subject}</a></td><td>${num}</td><td>${thread.既得 || ''}</td><td>${thread.新着 || ''}</td><td>${thread.最終取得 || ''}</td><td>${thread.最終書き込み || ''}</td><td></td></tr>`
        no++
    }
    return tr
}



function subject_loadend(xhr){
    if(xhr.status !== 200){
        サブジェクト一覧.innerHTML = ''
        return
    }

    サブジェクト一覧.innerHTML      = parse_subject(xhr.responseText, xhr.bbsurl)
    サブジェクト一覧.dataset.bbsurl = xhr.bbsurl

    const bbs      = 板[xhr.bbsurl]
    document.title = `${base.title} [ ${bbs.name} ]`
    change_selected(板, bbs.el)

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

    if(xhr.key){
        Thread[xhr.bbsurl][xhr.key].最終書き込み = date()
        ajax(`${xhr.bbsurl}dat/${xhr.key}.dat`, dat_loadend)
    }
    else{
        ajax(`${xhr.bbsurl}subject.txt`, subject_loadend)
    }

    delete katjusha.dataset.dialog
}



function ajax(url, fn, body, bbsurl){
    const xhr = new XMLHttpRequest()
    if(url.endsWith('cgi')){
        xhr.open('POST', url)
        xhr.bbsurl = bbsurl
        xhr.key    = body.get('key')
    }
    else if(url.endsWith('txt')){
        xhr.open('GET', `${url}?${Date.now()}`)
        xhr.bbsurl = url.replace('subject.txt', '')
        history.replaceState(null, null, xhr.bbsurl)
    }
    else{
        xhr.open('GET', `${url}?${Date.now()}`)
        xhr.bbsurl = url.replace(/\/(dat|kako)\/\d.*/, '/')
        xhr.key    = url.split('/').pop().replace(/\..*/, '')
        history.replaceState(null, null, build_thread_url(xhr.bbsurl, xhr.key))
        if(Thread[xhr.bbsurl] && Thread[xhr.bbsurl][xhr.key]){
            xhr.setRequestHeader('Range', `bytes=${Thread[xhr.bbsurl][xhr.key].byte || 0}-`)
            xhr.setRequestHeader('If-Modified-Since', Thread[xhr.bbsurl][xhr.key].mtime)
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
    const bbsurl = (url in 板) ? url : `${url}${bbs}/`
    return {bbsurl, key}
}


function change_selected(parent, el){
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



function copy_url(){
    navigator.clipboard.writeText(コンテキスト.target.href)
}



function go_bbs(bbsurl){
    板[bbsurl].el.click()
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

