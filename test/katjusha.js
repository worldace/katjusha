
katjusha.site = document.title
katjusha.home = document.querySelector('base').href
katjusha.bbs  = {}
for(const el of 板一覧.querySelectorAll('a')){
    const dir = el.href.split('/')
    dir.pop()
    katjusha.bbs[el.href] = {
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

    document.title = `${katjusha.site} [ ${event.target.textContent} ]`

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
    const bbs = katjusha.bbs[スレッド一覧_tbody.dataset.bbsurl]
    if(!bbs){
        return
    }

    投稿フォーム_form.setAttribute('action', `${bbs.home}test/bbs.cgi`);
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
    const bbs = katjusha.bbs[tab.dataset.bbsurl]

    if(!tab.dataset.key){
        return
    }

    投稿フォーム_form.setAttribute('action', `${bbs.home}test/bbs.cgi`);
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



投稿フォーム_ヘッダ.onmousedown = function (event){
    const form = 投稿フォーム.getBoundingClientRect()

    投稿フォーム.startX = form.left   - event.pageX
    投稿フォーム.startY = form.top    - event.pageY
    投稿フォーム.limitX = innerWidth  - form.width  - 1
    投稿フォーム.limitY = innerHeight - form.height - 1

    document.addEventListener('mousemove', 投稿フォーム_ヘッダ.mousemove, {passive:true})
    document.addEventListener('mouseup'  , 投稿フォーム_ヘッダ.mouseup,   {once:true})
}



投稿フォーム_ヘッダ.mousemove = function (event){
    投稿フォーム.style.left = Math.min(Math.max(0, 投稿フォーム.startX+event.pageX), 投稿フォーム.limitX) + 'px'
    投稿フォーム.style.top  = Math.min(Math.max(0, 投稿フォーム.startY+event.pageY), 投稿フォーム.limitY) + 'px'
}



投稿フォーム_ヘッダ.mouseup = function (event){
    document.removeEventListener('mousemove', 投稿フォーム_ヘッダ.mousemove)
}


function subject_loadend(xhr){
    if(xhr.status !== 200){
        スレッド一覧_tbody.innerHTML = ''
        return
    }

    const list = xhr.responseText.split("\n")
    const bbs  = katjusha.bbs[xhr.bbsurl]

    let   html = '';
    for(let i = 0; i < list.length-1; i++){
        const [dat, subject, num] = list[i].replace(/\s?\((\d+)\)$/, '<>$1').split('<>')
        const key = dat.replace('.dat', '')
        html += `<tr data-key="${key}"><td>${i+1}</td><td><a href="${bbs.home}test/read.cgi/${bbs.key}/${key}/">${subject}</a></td><td>${num}</td><td></td><td></td><td></td><td></td><td></td></tr>`
    }
    スレッド一覧_tbody.innerHTML = html
    スレッド一覧_tbody.dataset.bbsurl = xhr.bbsurl

    grid3.scrollTop = 0
}



function dat_loadend(xhr){
    if(xhr.status !== 200){
        return
    }

    const list = xhr.responseText.split("\n")
    let   html = '';
    for(let i = 0; i < list.length-1; i++){
        const [from, mail, date, message, subject] = list[i].split('<>');
        html += `<section><header><i>${i+1}</i> 名前：<b>${from}</b> 投稿日：<date>${date}</date></header>`
        html += `<p>${message}</p></section>`
    }
    スレッド.innerHTML = html

    const bbaname = katjusha.bbs[xhr.bbsurl].name
    const subject = list[0].split('<>').pop()
    スレッドヘッダ_板名.innerHTML     = `<a href="${xhr.bbsurl}">[${bbaname}]</a>`
    スレッドヘッダ_タイトル.innerHTML = `${subject} (${list.length-1})`
    スレッドヘッダ.dataset.key = xhr.key

    const tab = タブ.querySelector('[data-selected]')
    tab.innerHTML      = subject
    tab.dataset.key    = xhr.key
    tab.dataset.bbsurl = xhr.bbsurl
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

    if(katjusha.dataset.投稿フォーム === 'スレッド'){
        ajax(`${xhr.bbsurl}subject.txt`, subject_loadend)
    }
    else{
        
    }
    delete katjusha.dataset.投稿フォーム
}



function ajax(url, fn, body){
    ナビ_アニメ.dataset.ajax = Number(ナビ_アニメ.dataset.ajax) + 1
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
    }
    xhr.overrideMimeType('text/plain; charset=shift_jis')
    xhr.timeout = 30 * 1000
    xhr.onloadend = function(event){
        ナビ_アニメ.dataset.ajax = Number(ナビ_アニメ.dataset.ajax) - 1
        fn(event.target)
    }
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
