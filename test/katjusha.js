
katjusha.dataset.サイト名 = document.title

katjusha.bbslist = {}
for(const el of document.querySelectorAll('#板一覧 a')){
    const dir = el.href.split('/')

    katjusha.bbslist[el.href] = {}
    katjusha.bbslist[el.href].url  = el.href
    katjusha.bbslist[el.href].name = el.textContent
    katjusha.bbslist[el.href].key  = dir[dir.length-2]
    dir.splice(-2)
    katjusha.bbslist[el.href].home = dir.join('/') + '/'
}



板一覧.onclick = function(event){
    event.preventDefault()
    if(event.target.tagName !== 'A'){
        return
    }

    const before = 板一覧.querySelector('[data-selected]')
    if(before){
        delete before.dataset.selected
    }
    event.target.dataset.selected = 'selected'

    document.title = `${katjusha.dataset.サイト名} [ ${event.target.textContent} ]`

    katjusha.dataset.bbsurl = event.target.href
    ajax(`${event.target.href}subject.txt`, event.target.href, subject_loadend)
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

    const before = スレッド一覧.querySelector('[data-selected]')
    if(before){
        delete before.dataset.selected
    }
    tr.dataset.selected = 'selected'

    ajax(`${this.dataset.bbsurl}/dat/${tr.dataset.key}.dat?${Date.now()}`, this.dataset.bbsurl, dat_loadend)
}


スレッド投稿ボタン.onclick = function (event){
    if(katjusha.dataset.投稿フォーム){
        return
    }
    const bbs = katjusha.bbslist[katjusha.dataset.bbsurl]
    if(!bbs){
        return
    }

    投稿フォーム_form.dataset.bbsurl = bbs.url;
    投稿フォーム_form.setAttribute('action', `${bbs.home}test/bbs.cgi`);

    投稿フォーム_タイトル.textContent = `『${bbs.name}』に新規スレッド`

    投稿フォーム_タイトル欄.value    = ''
    投稿フォーム_タイトル欄.disabled = false
    投稿フォーム_名前欄.value        = ''
    投稿フォーム_メール欄.value      = ''
    投稿フォーム_本文欄.value        = ''
    投稿フォーム_bbs.value           = bbs.key

    katjusha.dataset.投稿フォーム = 'スレッド'

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
    event.preventDefault()
    ajax(this.getAttribute('action'), this.dataset.bbsurl, new FormData(this), cgi_loadend)
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


function subject_loadend(xhr){
    if(xhr.status !== 200){
        スレッド一覧_tbody.innerHTML = ''
        return
    }

    const list = xhr.responseText.split("\n")
    const bbs  = katjusha.bbslist[xhr.bbsurl]

    let   html = '';
    for(let i = 0; i < list.length-1; i++){
        const [dat, subject, num] = list[i].replace(/\s?\((\d+)\)$/, '<>$1').split('<>')
        const key = dat.replace('.dat', '')
        html += `<tr data-key="${key}"><td>${i+1}</td><td><a href="${bbs.home}test/read.cgi/${bbs.key}/${key}/">${subject}</a></td><td>${num}</td><td></td><td></td><td></td><td></td><td></td></tr>`
    }
    スレッド一覧_tbody.innerHTML = html
    スレッド一覧_tbody.dataset.bbsurl = xhr.bbsurl
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

    const bbaname = katjusha.bbslist[xhr.bbsurl].name
    スレッドヘッダ_板名.innerHTML     = `<a href="${xhr.bbsurl}">[${bbaname}]</a>`
    スレッドヘッダ_タイトル.innerHTML = `${list[0].split('<>').pop()} (${list.length-1})`
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
        ajax(`${xhr.bbsurl}subject.txt`, xhr.bbsurl, subject_loadend)
    }
    else{
        
    }
    delete katjusha.dataset.投稿フォーム
}



function ajax(url, bbsurl, body, fn){
    ナビ_アニメ.dataset.ajax = Number(ナビ_アニメ.dataset.ajax) + 1
    const xhr = new XMLHttpRequest()
    if(url.endsWith('cgi')){
        xhr.open('POST', url)
    }
    else{
        [fn, body] = [body, fn]
        xhr.open('GET', `${url}?${Date.now()}`)
    }
    xhr.overrideMimeType('text/plain; charset=shift_jis')
    xhr.timeout = 30 * 1000
    xhr.onloadend = function(event){
        ナビ_アニメ.dataset.ajax = Number(ナビ_アニメ.dataset.ajax) - 1
        fn(event.target)
    }
    xhr.bbsurl = bbsurl
    xhr.send(body)
}