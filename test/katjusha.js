

$katjusha.start = function(){
    $base.title = document.title
    $toolbar.$.全板ボタン.textContent = `▽${document.title}`
    $katjusha.aborts = new Set

    if($base.href !== document.URL){
        $katjusha.link(document.URL)
    }
}


$katjusha.link = function(url, target){
    $katjusha.href   = url
    $katjusha.target = target
    $katjusha.click()
}


$katjusha.fetch = async function(url, option = {}){
    const host  = new URL(url).hostname
    const abort = new AbortController()

    try{
        $toolbar.$.anime.dataset.ajax++
        $katjusha.aborts.add(abort)
        $status.textContent = `${host}に接続しています`
        const response      = await fetch(url, {cache:'no-store', signal:abort.signal, ...option})
        $status.textContent = `${host}に接続しました`

        const buffer     = await response.arrayBuffer()
        response.content = new TextDecoder('shift-jis').decode(buffer)
        response.byte    = buffer.byteLength
        response.etag    = response.headers.get('ETag')?.replace('W/', '').replace('-gzip', '')

        return response
    }
    catch(error){ // DNSエラー・CORSエラー・Abortの時のみ来る。404の時は来ない。
        $status.textContent = (error.name === 'AbortError') ? `` : `${host}に接続できませんでした`
        return error
    }
    finally{
        $toolbar.$.anime.dataset.ajax--
        $katjusha.aborts.delete(abort)
    }
}


$katjusha.onclick = function(event){
    const {href, target} = event.composedPath()[0]

    if(href === $base.href){
        event.preventDefault()
        history.replaceState(null, null, href)
    }
    else if(href in $bbs.list){
        event.preventDefault()
        $katjusha.fetch(`${href}subject.txt`).then(response => $subject.recieve(response, href))
    }
    else if(href?.includes('read.cgi') && $thread.URLParse(href).bbsurl in $bbs.list){
        event.preventDefault()
        const thread  = スレッド[href]
        const headers = thread.etag ? {'If-None-Match':thread.etag, 'Range':`bytes=${thread.byte}-`} : {}

        target ? $tab.openNew(href, thread) : $tab.open(href, thread)
        $tab.loading(href, true)

        $katjusha.fetch(thread.daturl, {headers}).then(response => $thread.recieve(response, href))
    }
}


class KatjushaToolbar extends HTMLElement{
    static{
        customElements.define('katjusha-toolbar', this)
    }

    constructor(){
        super()
        kit(this)
    }

    $スレッド投稿アイコン_click(event){
        new KatjushaForm($subject.bbsurl).open()
    }
}



class KatjushaBorder extends HTMLElement{
    static{
        customElements.define('katjusha-border', this)
    }

    constructor(){
        super()
        kit(this)
    }
}



class KatjushaBBS extends HTMLElement{
    static observedAttributes = ['bbslist']

    static{
        customElements.define('katjusha-bbs', this)
    }

    constructor(){
        super()
        kit(this)
    }

    attributeChangedCallback(name, _, value){
        if(name === 'bbslist'){
            this.$.bbs.innerHTML = this.parse(value)
        }
    }

    $_click(event){
        if(event.target.tagName === 'A'){
            this.active(event.target)
        }
    }

    $_contextmenu(event){
        event.preventDefault()
        event.stopPropagation()

        if(event.target.tagName === 'A'){
            this.active(event.target)

            new KatjushaContext(`
                <li><a onclick="toClipboard('${event.target.href}')">URLをコピー</a></li>
                <li><a onclick="toClipboard('${event.target.innerHTML}\\n${event.target.href}\\n')">掲示板名とURLをコピー</a></li>
            `).show(event.pageX, event.pageY)
        }
    }

    parse(text){
        this.list = {}
        let html  = ''
        let category

        for(const v of text.trim().split('\n')){
            if(v.startsWith('#')){
                category = v.slice(1)
                html += html && `</details>`
                html += `<details open><summary>${category}</summary>`
            }
            else{
                const [name, url]    = v.split(' ')
                const [,baseurl,bbs] = url.match(/(.+\/)([^\/]+)\/$/)
                html += `<a href="${url}">${name}</a>`
                this.list[url] = {category, name, url, baseurl, bbs}
            }
        }

        return html + `</details>`
    }

    name(url){
        return this.list[url]?.name
    }

    active(el){
        if(typeof el === 'string'){
            el = this.$(`[href="${el}"]`)
        }

        if(el){
            this.selected?.removeAttribute('selected')
            this.selected = el
            el.setAttribute('selected', true)
        }
    }
}


class KatjushaSubject extends HTMLElement{
    static{
        customElements.define('katjusha-subject', this)
    }

    constructor(){
        super()
        kit(this)
    }


    $_contextmenu(event){
        event.preventDefault()
    }

    $thead_dblclick(event){
        if(event.target.tagName === 'TH'){
            this.sort(event.target)
        }
    }

    $tbody_mousedown(event){
        event.preventDefault()
        const tr = event.target.closest('tr')

        if(tr && event.target.cellIndex < 7){
            this.active(tr)
            $katjusha.link(tr.dataset.url)
        }
    }

    $tbody_contextmenu(event){
        event.preventDefault()
        event.stopPropagation()
        const tr = event.target.closest('tr')

        if(tr){
            const url = tr.dataset.url
            this.active(tr)

            new KatjushaContext(`
                <li><a onclick="$katjusha.link('${url}', '_blank')">新しいタブで開く</a></li>
                <li><a onclick="toClipboard('${url}')">URLをコピー</a></li>
                <li><a onclick="toClipboard('${スレッド[url].subject}\\n${url}\\n')">タイトルとURLをコピー</a></li>
            `).show(event.pageX, event.pageY)
        }
    }

    active(el){
        this.selected?.removeAttribute('selected')
        this.selected = el
        el.setAttribute('selected', true)
    }

    sort(th){
        const index = th.cellIndex
        const order = Number(th.dataset.order || -1)
        const tbody = th.closest('table').tBodies[0]
        const rows  = Array.from(tbody.rows)
        const compare = new Intl.Collator('ja-JP', {numeric: true}).compare

        rows.sort((a, b) => compare(a.cells[index].textContent, b.cells[index].textContent) * order)
        rows.forEach(tr  => tbody.append(tr))

        th.dataset.order = -order
    }

    recieve(response, url){
        if(response.status === 200){
            this.bbsurl = url
            this.scrollTop = 0
            this.$.tbody.innerHTML = this.toHTML(this.parse(response.content), url)

            $title.textContent = `${$base.title} [ ${$bbs.name(url)} ]`
            $bbs.active(url)

            $status.textContent = `${this.$.tbody.rows.length}件のスレッドを受信 (${date()})`
            history.replaceState(null, null, url)
        }
        else{
            this.$.tbody.textContent = ''
        }
    }

    parse(text){
        return text.trim().split('\n').map( (v, i) => {
            const [, key, subject, num] = v.match(/(\d+)\.dat<>(.+?) \((\d+)\)$/)
            return {i:i+1, key, subject, num:Number(num)}
        })
    }

    toHTML(list, bbsurl){
        let html = ''

        for(const {i, key, subject, num} of list){
            const url    = bbsurl.replace(/([^\/]+)\/$/, `test/read.cgi/$1/${key}/`)
            const thread = スレッド[url]
            thread.subject = subject

            if(thread.num == thread.既得){
                thread.新着 = 0
            }

            html += `<tr data-url="${url}"><td>${i}</td><td><a href="${url}">${subject}</a></td><td>${num}</td>
                     <td>${thread.既得 || ''}</td><td>${thread.新着 || ''}</td><td>${thread.最終取得}</td><td>${thread.最終書き込み}</td><td></td></tr>`
        }
    
        return html
    }

    update(thread){
        const tr = Array.from(this.$.tbody.rows).find(v => v.dataset.url === thread.url)

        if(tr){
            this.active(tr)
            tr.cells[2].textContent = thread.num || ''
            tr.cells[3].textContent = thread.既得 || ''
            tr.cells[4].textContent = thread.新着 || ''
            tr.cells[5].textContent = thread.最終取得 || ''
            tr.cells[6].textContent = thread.最終書き込み || ''
        }
    }
}


class KatjushaHeadline extends HTMLElement{
    static{
        customElements.define('katjusha-headline', this)
    }

    constructor(){
        super()
        kit(this)
    }

    render(thread){
        this.$.thread.innerHTML = `${thread.subject} (${thread.num})`
        this.$.bbs.innerHTML    = `<a href="${thread.bbsurl}">[${thread.bbsname}]</a>`
    }

    $_contextmenu(event){
        event.preventDefault()
    }

    $レス更新アイコン_click(event){
        $katjusha.link($tab.selected.url)
    }

    $中止アイコン_click(event){
        for(const v of $katjusha.aborts){
            v.abort()
        }
    }

    $レス投稿アイコン_click(event){
        new KatjushaForm($tab.selected.url).open()
    }

    $ごみ箱アイコン_click(event){
        const url = $tab.selected.url

        if(url in スレッド){
            $status.textContent = `「${スレッド[url].subject}」のログを削除しました`
            delete スレッド[url]
        }
    }

    $タブ閉じるアイコン_click (event){
        $tab.close($tab.selected)
    }
}


class KatjushaThread extends HTMLElement{
    static{
        customElements.define('katjusha-thread', this)
    }

    constructor(){
        super()
        kit(this)
        this.onscroll = event => {
            if(this.selected.url){
                スレッド[this.selected.url].scroll = this.scrollTop
            }
        }
    }

    $_click(event){
        if(event.target.tagName === 'I'){
            event.stopPropagation()

            new KatjushaContext(`
                <li><a onclick="$thread.responseTo(${event.target.textContent})">これにレス</a></li>
            `).show(event.pageX, event.pageY)
        }
        else if(event.target.className === 'anker'){
            event.stopPropagation()
            this.goto(event.target.dataset.n)
        }
    }

    active(el){
        this.selected?.removeAttribute('selected')
        this.selected = el
        el.setAttribute('selected', true)
    }

    goto(n){
        this.selected.children[n-1]?.scrollIntoView()
    }

    responseTo(n){
        $headline.$.レス投稿アイコン.click()
        $form.insert(`>>${n}\n`)
    }

    popup(event, n){
        const el = this.selected.children[n-1]

        if(el){
            const {left, width, top} = event.target.getBoundingClientRect()
            const x = left + width / 2
            const y = innerHeight - top + 6

            new KatjushaPopup(el.outerHTML).show(x, y)
        }
    }

    recieve(response, url){
        $tab.loading(url, false)

        if(response.status === 200){
            const thread   = スレッド[url]
            const dat      = this.parse(response.content)

            thread.subject = dat.subject
            thread.html    = dat.html
            thread.num     = dat.num
            thread.byte    = response.byte
            thread.etag    = response.etag
            thread.既得    = dat.num
            thread.新着    = dat.num
            thread.最終取得= date()

            this.render(thread)
            $headline.render(thread)
            $subject.update(thread)
            $title.textContent  = thread.subject
            $status.textContent = `${dat.num}のレスを受信 (${date()}) ${KB(thread.byte)}`
        }
        else if(response.status === 206){
            const thread   = スレッド[url]
            const dat      = this.parse(response.content, thread.num)

            thread.html   += dat.html
            thread.num    += dat.num
            thread.byte   += response.byte
            thread.etag    = response.etag
            thread.既得    = thread.num
            thread.新着    = dat.num
            thread.最終取得= date()

            this.render(thread, dat.html)
            $headline.render(thread)
            $subject.update(thread)
            $title.textContent  = thread.subject
            $status.textContent = `${dat.num}のレスを受信 (${date()}) ${KB(thread.byte)}`
        }
        else if(response.status === 304){
            const thread = スレッド[url]
            thread.新着  = 0

            $subject.update(thread)
            $status.textContent = `新着なし (${date()}) ${KB(thread.byte)}`
        }
        else if(response.status === 404){
            $status.textContent = `スレッドが見つかりません (${date()})`
        }
        else if(response.status === 416){
            delete スレッド[url]
            $katjusha.link(url)
            return
        }
        else{
            return
        }

        history.replaceState(null, null, url)
    }

    parse(text, n = 0){
        const dat  = text.trim().split('\n')
        let  html  = ''

        for(const v of dat){
            const [from, mail, date, message, subject] = v.split('<>')

            const messageHTML = message
            .replace(/&gt;&gt;([1-9]\d{0,3})/g, '<span class="anker" data-n="$1" onmouseenter="$thread.popup(event, $1)" onmouseleave="$popup.remove()">&gt;&gt;$1</span>')
            .replace(/(https?:\/\/[^\s<]+)/g, '<a href="$1" target="_blank">$1</a>')
            .replace(/^ /, '')
            //datファイルにaタグが含まれる場合: replace(/<a (.+?)>(.+?)<\/a>/g, '$2')

            html += `
              <article class="レス" data-n="${n}">
                <header><i>${++n}</i><span class="from"><b>${from}</b></span><time>${date}</time><address>${mail}</address></header>
                <p>${messageHTML}</p>
              </article>
            `
        }

        return {html, num:dat.length, subject:dat[0].split('<>').pop()}
    }

    render(thread, append){
        const tab     = $tab.find(thread.url) || $tab.selected
        tab.innerHTML = thread.subject
        if(append){
            tab.panel.insertAdjacentHTML('beforeend', append)
        }
        else{
            tab.panel.innerHTML = thread.html
        }
    }

    URLParse(url){
        const [,bbs,key] = url.match(/([^\/]+)\/([^\/]+)\/$/)
        const baseurl    = url.replace(/\/test\/.+/, `/`)
        const bbsurl     = `${baseurl}${bbs}/`

        return {bbs, key, bbsurl, baseurl}
    }
}



class KatjushaTab extends HTMLElement{
    static{
        customElements.define('katjusha-tab', this)
    }

    constructor(){
        super()
        kit(this)
        this.openNew()
    }

    $_click(event){
        if(event.target.tagName === 'LI' && event.target !== this.selected){
            this.select(event.target)
        }
    }

    $_dblclick(event){
        if(event.target.tagName === 'LI' && event.target.url){
            $headline.$.レス更新アイコン.click()
        }
    }

    $_contextmenu(event){
        event.preventDefault()
        event.stopPropagation()

        if(event.target.tagName === 'LI'){
            new KatjushaContext(`
                <li><a onclick="$tab.close('${event.target.url}')">閉じる</a></li>
                <li><a onclick="$tab.closeAll('${event.target.url}')">このタブ以外全て閉じる</a></li>
                <li><a onclick="toClipboard('${event.target.url}')">URLをコピー</a></li>
                <li><a onclick="toClipboard('${event.target.innerHTML}\\n${event.target.url}\\n')">タイトルとURLをコピー</a></li>
            `).show(event.pageX, event.pageY)
        }
    }

    open(url, thread = {}){
        if(!this.$.tab.childElementCount){
            return this.openNew(url, thread)
        }

        let tab = this.find(url)

        if(tab){
            return this.select(tab)
        }
        else{
            tab = this.selected
        }

        tab.url             = url
        tab.innerHTML       = thread.subject || ''
        tab.panel.url       = url
        tab.panel.innerHTML = thread.html || ''

        return this.select(tab)
    }

    openNew(url, thread = {}){
        const tab = this.find(url)

        if(this.$.tab.childElementCount === 1 && !this.$.tab.firstElementChild.url){
            return this.open(url, thread)
        }
        else if(tab){
            return this.select(tab)
        }
        else{
            return this.select( this.create(url, thread.subject, thread.html) )
        }
    }

    close(tab){
        if(typeof tab === 'string'){
            tab = this.find(tab)
        }

        if(tab?.url){
            this.select(tab.previousElementSibling || tab.nextElementSibling || this.openNew())
            tab.panel.remove()
            tab.remove()
        }
    }

    closeAll(url){
        for (const tab of Array.from(this.$.tab.children).filter(v => v.url !== url)){
            this.close(tab)
        }
    }

    create(url, subject='', html=''){
        const thread     = document.createElement('div')
        thread.className = 'スレッド'
        thread.url       = url
        thread.innerHTML = html

        const tab        = document.createElement('li')
        tab.url          = url
        tab.innerHTML    = subject
        tab.panel        = thread

        this.$.tab.append(tab)
        $thread.shadowRoot.append(thread)

        return tab
    }

    select(tab){
        this.selected?.removeAttribute('selected')
        this.selected = tab
        tab.setAttribute('selected', true)

        $thread.active(tab.panel)

        if(tab.url){
            const thread = スレッド[tab.url]
            $headline.render(thread)
            $thread.scrollTop  = thread.scroll
            $title.textContent = thread.subject
            history.replaceState(null, null, tab.url || $subject.bbsurl || $base.href)
        }

        return tab
    }

    find(url){
        return Array.from(this.$.tab.children).find(v => v.url === url)
    }

    loading(url, bool){
        this.find(url)?.toggleAttribute('loading', bool)
    }
}



class KatjushaStatus extends HTMLElement{
    static{
        customElements.define('katjusha-status', this)
    }

    constructor(){
        super()
        kit(this)
    }
}



class KatjushaForm extends HTMLElement{
    static{
        customElements.define('katjusha-form', this)
    }

    constructor(url){
        super()
        this.url  = url
        this.id   = '$form'
        kit(this)
    }

    $_contextmenu(event){
        if(!['text','textarea'].includes(event.target.type)){
            event.preventDefault()
        }
    }

    $form_reset(event){
        this.remove()
    }

    $close_click(event){
        this.remove()
    }

    $sage_change(event){
        this.$.mail.readOnly = this.checked
        this.$.mail.value    = this.checked ? 'sage' : ''
    }

    $header_pointermove(event){
        if(event.buttons){
            event.target.setPointerCapture(event.pointerId)
            const {x, y, width, height} = this.getBoundingClientRect()

            this.style.left = clamp(0, x+event.movementX, innerWidth-width)   + 'px'
            this.style.top  = clamp(0, y+event.movementY, innerHeight-height) + 'px'
        }
    }

    async $form_submit(event){
        event.preventDefault()
        this.disable(true)
        const response = await $katjusha.fetch(this.$.form.action, {method:'POST', body:new FormData(this.$.form)})
        KatjushaForm.recieve(response, this.url)
    }

    open(){
        if(!this.url || window.$form){
            return
        }

        $body.append(this)
        this.centering()

        if( this.url.includes('read.cgi') ){
            const thread = スレッド[this.url]

            this.$.title.textContent = `「${thread.subject}」にレス`
            this.$.form.action       = `${thread.baseurl}test/bbs.cgi`
            this.$.bbs.value         = thread.bbs
            this.$.key.value         = thread.key
            this.$.subject.value     = thread.subject
            this.$.subject.disabled  = true
            this.$.message.focus()
        }
        else{
            const bbs = $bbs.list[this.url]

            this.$.title.textContent = `『${bbs.name}』に新規スレッド`
            this.$.form.action       = `${bbs.baseurl}test/bbs.cgi`
            this.$.bbs.value         = bbs.bbs
            this.$.subject.focus()
        }
    }

    centering(){
        const {width, height} = this.getBoundingClientRect()
        this.style.left = `${innerWidth/2 - width/2}px`
        this.style.top  = `${innerHeight/2 - height/2}px`
    }

    insert(text){
        const before = this.$.message.value.substr(0, this.$.message.selectionStart)
        const after  = this.$.message.value.substr(this.$.message.selectionStart)

        this.$.message.value = before + text + after
    }

    disable(bool){
        this.$.submit.toggleAttribute('disabled', bool)
    }

    static recieve(response, url){
        window.$form?.disable(false)
        $status.textContent = ``

        if(response.status !== 200){
            alert('エラーが発生して投稿できませんでした')
        }
        else if(response.content.includes('ＥＲＲＯＲ！')){
            alert( response.content.match(/<b>(.+?)</i)[1] )
        }
        else{
            if(url.includes('read.cgi')){
                スレッド[url].最終書き込み = date()
            }
            window.$form?.remove()
            $katjusha.link(url)
        }
    }

    html(){
        return `
<div>
  <div id="header">
    <div id="title"></div>
    <div id="close"></div>
  </div>
  <ul id="tab">
    <li class="selected">書き込み</li>
    <li>ローカルルール</li>
  </ul>
  <form id="form" action="test/bbs.cgi" method="POST" spellcheck="false">
    <div id="area1">
      <label id="subjectlabel">タイトル</label>
      <input id="subject" name="subject" type="text">
    </div>
    <div id="area2">
      <label id="fromlabel">名前</label>
      <input id="from" name="FROM" type="text">
      <label id="maillabel">メール</label>
      <input id="mail" name="mail" type="text">
      <input id="sage" type="checkbox">
      <label id="sagelabel" for="sage">sage</label>
    </div>
    <textarea id="message" name="MESSAGE"></textarea>
    <div id="area3">
      <input id="submit" type="submit" value="書き込む">
      <input id="reset" type="reset" value="キャンセル">
    </div>
    <input id="bbs" name="bbs" type="hidden">
    <input id="key" name="key" type="hidden">
    <input name="submit" value="書き込む" type="hidden">
  </form>
</div>
    `}

    css(){
        return `
:host{
    position: absolute;
    z-index: 5;
    border: solid 1px #2982cc;
    background-color: #f0f0f0;
    font-family: 'MS PGothic', sans-serif;
    font-size: 13px;
}
#header{
    box-sizing: border-box;
    background-color: #2982cc;
    padding: 5px 0 5px 8px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    background-repeat: no-repeat;
    background-image: url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQBAMAAADt3eJSAAAAKlBMVEUAAAAAAAD//9T/4rH/1I7/xmvckgD/uEj/8NT/qgC5egCWYgD/qiWAAABV6iNkAAAAAXRSTlMAQObYZgAAAHlJREFUCNdjYGBgBCEQkBRgEBMAMUQFQAgIhANBCCgfZC4YbAhiGJWENPkA5aSURCyUJBcyMIgoCTtbiBcC1RoppaWYJALVWChpmLiD9EuYuIZtBNKCQsruaQJAGRcXJdOyhUBGqq2SsTtI7RQhDWN3sBrJ0NBqAQYAQ74Ta8sT5DsAAAAASUVORK5CYII=');
    background-size: 16px;
    background-position: 6px center;
    height: 28px;
}
#title{
    color: #fff;
    font-size: 14px;
    font-weight: normal;
    margin-left: 20px;
}
#close{
    width: 28px;
    height: 28px;
    background-repeat: no-repeat;
    background-image: url('data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4NCjxzdmcgd2lkdGg9IjE3OTIiIGhlaWdodD0iMTc5MiIgdmlld0JveD0iMCAwIDE3OTIgMTc5MiIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMTQ5MCAxMzIycTAgNDAtMjggNjhsLTEzNiAxMzZxLTI4IDI4LTY4IDI4dC02OC0yOGwtMjk0LTI5NC0yOTQgMjk0cS0yOCAyOC02OCAyOHQtNjgtMjhsLTEzNi0xMzZxLTI4LTI4LTI4LTY4dDI4LTY4bDI5NC0yOTQtMjk0LTI5NHEtMjgtMjgtMjgtNjh0MjgtNjhsMTM2LTEzNnEyOC0yOCA2OC0yOHQ2OCAyOGwyOTQgMjk0IDI5NC0yOTRxMjgtMjggNjgtMjh0NjggMjhsMTM2IDEzNnEyOCAyOCAyOCA2OHQtMjggNjhsLTI5NCAyOTQgMjk0IDI5NHEyOCAyOCAyOCA2OHoiIGZpbGw9IiNmZmYiLz48L3N2Zz4NCg==');
    background-size: 16px;
    background-position: center center;
    cursor: pointer;
}
#close:hover{
    background-color: #e81123;
}
#tab{
    height: 24px;
    list-style: none;
    cursor: default;
    display: flex;
    align-items: flex-end;
    background-color: #f0f0f0;
    margin: 0;
    padding-left: 6px;
    border-bottom: 1px solid #c0c0c0;
    box-shadow: 0 1px 0 #fff;
}
#tab > li{
    text-align: center;
    border-top: 1px solid #e3e3e3;
    border-left: 1px solid #e3e3e3;
    border-right: 1px solid #e3e3e3;
    background-color: #f0f0f0;
    color: #909090;
    background: linear-gradient(to top, #ececec 50%, #e9e9e9 100%);
    border-top-left-radius: 3px;
    border-top-right-radius: 3px;
    margin: 0 -5px;
    padding: 0 6px;
    height: 20px;
    white-space: nowrap;
    overflow: hidden;
    line-height: 20px;
    box-shadow: 1px 0 1px rgba(0, 0, 0, 0.4), inset 1px 1px 0 #fff;
    user-select: none;
}
#tab .selected{
    color: #000;
    z-index: 2;
    height: 22px;
    line-height: 22px;
}
#form{
    padding: 4px 12px 6px 12px;
    display: flex;
    flex-direction: column;
    min-width: max-content;
    min-height: 280px;
    resize: both;
    overflow: hidden;
}
#area1{
    display: flex;
    align-items: center;
    margin-top: 6px;
}
#subjectlabel{
    min-width: 50px;
    text-align: right;
    padding-right: 4px;
    user-select: none;
}
[type="text"]{
    border-left: solid 1px #696969;
    border-top: solid 1px #696969;
    border-right: solid 1px #e3e3e3;
    border-bottom: solid 1px #e3e3e3;
    box-shadow: -1px -1px 0 #a0a0a0, 1px 1px 0 #fff;
    outline: none;
    padding-left: 2px;
    height: 18px;
    font-family: 'MS PGothic', sans-serif;
}
#subject{
    flex-grow: 1;
}
#subject:disabled{
    color: #6d6d6d;
    background-color: #fff;
}
#area2{
    display: flex;
    align-items: center;
    margin-top: 8px;
}
#fromlabel{
    min-width: 50px;
    text-align: right;
    padding-right: 4px;
    user-select: none;
}
#from{
    flex-grow: 1;
    margin-right: 6px;
}
#maillabel{
    min-width: 50px;
    padding-right: 3px;
    text-align: right;
    user-select: none;
}
#mail{
    flex-grow: 1;
    margin-right: 6px;
}
#mail:read-only{
    color: #6d6d6d;
}
#sagelabel{
    padding: 2px 0;
    user-select: none;
}
#message{
    flex-grow: 1;
    min-height: 160px;
    font-size: 12px;
    border-left: solid 1px #696969;
    border-top: solid 1px #696969;
    border-right: solid 1px #e3e3e3;
    border-bottom: solid 1px #e3e3e3;
    box-shadow: -1px -1px 0 #a0a0a0, 1px 1px 0 #fff;
    overflow: scroll;
    outline: none;
    padding-left: 4px;
    resize: none;
    margin-top: 10px;
}
#area3{
    text-align: center;
    margin-top: 6px;
}
#area3 input{
    background-color: transparent;
    width: 80px;
    font-size: 12px;
    font-family: 'MS PGothic', sans-serif;
    padding: 3px;
    border-left: solid 1px #e3e3e3;
    border-top: solid 1px #e3e3e3;
    border-right: solid 1px #a0a0a0;
    border-bottom: solid 1px #a0a0a0;
    box-shadow: -1px -1px 0 #fff, 1px 1px 0 #696969;
}
#area3 input:active{
    transform: translate(1px, 1px);
}
    `}
}



class KatjushaContext extends HTMLElement{
    static{
        customElements.define('katjusha-context', this)
    }

    constructor(html){
        super()

        this.id   = '$context'
        kit(this)
        this.$.context.innerHTML = html

        window.$context?.remove()
        document.addEventListener('click', () => this.remove(), {once:true})
    }

    $_click(event){
        if(!event.target.onclick && !event.target.href){
            event.stopPropagation()
        }
    }

    $_contextmenu(event){
        event.preventDefault()
    }

    show(x, y){
        this.style.left = `${x}px`
        this.style.top  = `${y}px`
        $body.append(this)
    }

    html(){
        return `<ul id="context" class="menu"></ul>`
    }

    css(){
        return `
:host{
    display: block;
    position: absolute;
    z-index: 10;
}
.menu,
.menu ul{
    min-width: 160px;
    margin: 0;
    padding: 2px 0;
    list-style: none;
    background-color: #f0f0f0;
    border: 1px solid #999;
    border-radius: 2px;
    box-shadow: 2px 2px 1px rgba(50, 50, 50, 0.1);
}
.menu li{
    font-family: 'Yu Gothic UI Medium', 'Meiryo', sans-serif;
    font-size: 12px;
}
.menu li:empty{
    height: 2px;
    margin: 3px 1px;
    background-color: #e5e5e5;
    box-shadow: 0 1px 0 #fff;
}
.menu a{
    display: block;
    padding: 2px 20px 2px 24px;
    line-height: 18px;
    color: #333;
    white-space: nowrap;
    text-decoration: none;
    cursor: default;
}
.menu a:hover,
.menu-sub:hover > a{
    background-color: #91c9f7;
}
.menu-sub{
    position: relative;
}
.menu-sub > a::after{
    position: absolute;
    right: 5px;
    width: 0;
    height: 0;
    margin-top: 5px;
    border: solid 5px transparent;
    border-left: solid 5px #333;
    content: '';
}
.menu-sub > ul{
    position: absolute;
    top: -3px;
    left: 100%;
    border-radius: 2px;
    display: none;
}
.menu-sub:hover > ul{
    display: block;
}
    `}
}



class KatjushaPopup extends HTMLElement{
    static{
        customElements.define('katjusha-popup', this)
    }

    constructor(html){
        super()
        this.id   = '$popup'
        kit(this)
        this.$.popup.innerHTML = html
    }

    show(x, y){
        this.style.left   = `${x}px`
        this.style.bottom = `${y}px`
        $body.prepend(this)
    }

    html(){
        return `<div id="popup"></div>`
    }

    css(){
        return `
:host{
    font-size: 14px;
    color: #000;
    background-color: #ffffe1;
    position: absolute;
    border-right: 1px solid #7f7f7f;
    border-bottom: 1px solid #7f7f7f;
    border-left: 1px solid #e4e4e4;
    border-top: 1px solid #e4e4e4;
    box-shadow: 0 1px 0 #f7f7f7;
    z-index: 8;
    padding: 6px 4px;
    cursor: default;
}
.レス p{
    margin: 3px 0 0 12px !important;
}
/* 以下はKatjushaThreadのコピペ */
.レス i{
    color: blue;
    font-style: normal;
    cursor: pointer;
}
.レス i:hover{
    text-decoration: underline;
}
.レス .from{
    color: forestgreen;
}
.レス .from::before{
    content: '名前：';
    color: #000;
    margin: 0 0.1rem 0 0.7rem;
    user-select: text;
}
.レス time{
}
.レス time::before{
    content: '投稿日：';
    margin: 0 0.1rem 0 0.7rem;
    user-select: text;
}
.レス address{
    display: inline;
    font-style: normal;
    color: red;
    margin-left: 8px;
}
.レス p{
    margin-top: 2px;
    margin-left: 36px;
    white-space: pre-wrap;
}
.レス a{
    text-decoration: none;
}
.レス a:hover{
    text-decoration: underline;
}
.レス .anker{
    position: relative;
    cursor: pointer;
    color: blue;
}
    `}
}


const スレッド = new Proxy({}, {
    get(target, url){
        if(!(url in target)){
            const {bbs, key, bbsurl, baseurl} = $thread.URLParse(url)

            target[url] = {
                url     : url,
                key     : key,
                bbs     : bbs,
                bbsurl  : bbsurl,
                bbsname : $bbs.name(bbsurl),
                baseurl : baseurl,
                daturl  : `${bbsurl}dat/${key}.dat`,
                subject : '',
                html    : '',
                num     : 0,
                byte    : 0,
                etag    : '',
                scroll  : 0,
                既得    : 0,
                新着    : 0,
                最終取得: '',
                最終書き込み: '',
            }
        }

        return target[url]
    }
})



function toClipboard(text){
    navigator.clipboard.writeText(text)
}


function date(){
    const d  = new Date()

    const 年 = d.getFullYear()
    const 月 = (d.getMonth()+1).toString().padStart(2, 0)
    const 日 = d.getDate().toString().padStart(2, 0)
    const 時 = d.getHours().toString().padStart(2, 0)
    const 分 = d.getMinutes().toString().padStart(2, 0)
    const 秒 = d.getSeconds().toString().padStart(2, 0)

    return `${年}/${月}/${日} ${時}:${分}:${秒}`
}


function KB(byte = 0){
    return `${Math.ceil(byte/1024)}KB`
}


function clamp(min, num, max){
    return Math.min(Math.max(min, num), max)
}


function kit(self){
    self.$ = new Proxy(function(){}, {get:(_, name) => self.shadowRoot.querySelector('#'+name), apply})

    if(!self.shadowRoot){
        self.attachShadow({mode:'open'})

        if(self.css){
            if(!self.constructor.css){
                self.constructor.css = new CSSStyleSheet()
                self.constructor.css.replaceSync(self.css())
            }
            self.shadowRoot.adoptedStyleSheets = [self.constructor.css]
        }

        const dom = self.html()
        if(typeof dom === 'string'){
            self.shadowRoot.innerHTML = dom
        }
        else if(dom instanceof Node){
            const el = dom.tagName === 'TEMPLATE' ? dom.content : dom
            self.shadowRoot.append(el.cloneNode(true))
        }
    }

    const specialID = {'':self.shadowRoot, 'Host':self, 'Window':window, 'Document':document}

    for(const method of Object.getOwnPropertyNames(Object.getPrototypeOf(self))){
        self[method] = self[method].bind(self)
        const m = method.match(/^\$(.*?)_([^_]+)$/)
        if(m){
            const el = specialID[m[1]] ?? self.$('#'+m[1])
            el.addEventListener(m[2], self[method])
        }
    }
}

function apply(_, self, [arg, ...values]){
    if(typeof arg === 'string'){
        if(arg.startsWith('@')){
            self.dispatchEvent( new CustomEvent(arg.slice(1), {bubbles:true, composed:true, detail:values[0]}) )
        }
        else if(arg.startsWith('*')){
            return Array.from(self.shadowRoot.querySelectorAll(arg.slice(1) || '*'))
        }
        else{
            return self.shadowRoot.querySelector(arg)
        }
    }
    else if(Array.isArray(arg)){ //タグ関数で起動
        const template = document.createElement('template')
        template.innerHTML = arg.reduce((result, v, i) => result + values[i-1] + v).trim()

        return template.content.childNodes.length === 1 ? template.content.firstChild : template.content
    }
}


$katjusha.start()
