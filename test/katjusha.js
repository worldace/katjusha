
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


$katjusha.clipboard = function(text){
    navigator.clipboard.writeText(text)
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
        $tab.loading(href)

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
    static{
        this.observedAttributes = ['bbslist']
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
            this.select(event.target)
        }
    }

    $_contextmenu(event){
        event.preventDefault()
        event.stopPropagation()

        if(event.target.tagName === 'A'){
            this.select(event.target)

            new KatjushaContext(`
                <li><a onclick="$katjusha.clipboard('${event.target.href}')">URLをコピー</a></li>
                <li><a onclick="$katjusha.clipboard('${event.target.innerHTML}\\n${event.target.href}\\n')">掲示板名とURLをコピー</a></li>
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

    select(el){
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
        this.compare = new Intl.Collator('ja-JP', {numeric:true}).compare
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
            this.select(tr)
            $katjusha.link(tr.dataset.url)
        }
    }

    $tbody_contextmenu(event){
        event.preventDefault()
        event.stopPropagation()
        const tr = event.target.closest('tr')

        if(tr){
            const url = tr.dataset.url
            this.select(tr)

            new KatjushaContext(`
                <li><a onclick="$katjusha.link('${url}', '_blank')">新しいタブで開く</a></li>
                <li><a onclick="$katjusha.clipboard('${url}')">URLをコピー</a></li>
                <li><a onclick="$katjusha.clipboard('${スレッド[url].subject}\\n${url}\\n')">タイトルとURLをコピー</a></li>
            `).show(event.pageX, event.pageY)
        }
    }

    recieve(response, url){
        if(response.status === 200){
            this.bbsurl = url
            this.scrollTop = 0
            this.$.tbody.innerHTML = response.content.trim().split('\n').map(this.toHTML).join('')

            $title.textContent = `${$base.title} [ ${$bbs.name(url)} ]`
            $bbs.select(url)

            $status.textContent = `${this.$.tbody.rows.length}件のスレッドを受信 (${date()})`
            history.replaceState(null, null, url)
        }
        else{
            this.$.tbody.textContent = ''
        }
    }

    toHTML(line, i){
        const [, key, subject, num] = line.match(/(\d+)\.dat<>(.+?) \((\d+)\)$/)
        const url      = this.bbsurl.replace(/([^\/]+)\/$/, `test/read.cgi/$1/${key}/`)
        const thread   = スレッド[url]
        thread.subject = subject

        if(thread.num === thread.既得){
            thread.新着 = 0
        }

        return `<tr data-url="${url}">
                  <td>${i+1}</td>
                  <td><a href="${url}">${subject}</a></td>
                  <td>${num}</td>
                  <td>${thread.既得 || ''}</td>
                  <td>${thread.新着 || ''}</td>
                  <td>${thread.最終取得}</td>
                  <td>${thread.最終書き込み}</td>
                  <td></td>
                </tr>`
    }

    select(el){
        this.selected?.removeAttribute('selected')
        this.selected = el
        el.setAttribute('selected', true)
    }

    update(thread){
        const tr = Array.from(this.$.tbody.rows).find(v => v.dataset.url === thread.url)

        if(tr){
            this.select(tr)
            tr.cells[2].textContent = thread.num || ''
            tr.cells[3].textContent = thread.既得 || ''
            tr.cells[4].textContent = thread.新着 || ''
            tr.cells[5].textContent = thread.最終取得 || ''
            tr.cells[6].textContent = thread.最終書き込み || ''
        }
    }

    sort(th){
        th.order = th.order ? -th.order : -1
        const i  = th.cellIndex
        const tr = Array.from(this.$.tbody.rows).sort((a, b) => KatjushaSubject.compare(a.cells[i].textContent, b.cells[i].textContent)*th.order)

        this.$.tbody.append(...tr)
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

    $タブ閉じるアイコン_click(event){
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
    }

    $_click(event){
        if(event.target.tagName === 'I'){
            event.stopPropagation()

            new KatjushaContext(`
                <li><a onclick="$thread.resTo(${event.target.textContent})">これにレス</a></li>
            `).show(event.pageX, event.pageY)
        }
        else if(event.target.className === 'anker'){
            event.stopPropagation()
            this.goto(event.target.dataset.n)
        }
    }

    $Host_scroll(event){
        if(this.selected.url){
            スレッド[this.selected.url].scroll = this.scrollTop
        }
    }

    select(el){
        this.selected?.removeAttribute('selected')
        this.selected = el
        el.setAttribute('selected', true)
    }

    goto(n){
        this.selected.children[n-1]?.scrollIntoView()
    }

    resTo(n){
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
        const dat = text.trim().split('\n')
        let  html = ''

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
        const tab     = $tab.find(thread.url) ?? $tab.selected
        tab.innerHTML = thread.subject
        if(append){
            tab.thread.insertAdjacentHTML('beforeend', append)
        }
        else{
            tab.thread.innerHTML = thread.html
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
                <li><a onclick="$katjusha.clipboard('${event.target.url}')">URLをコピー</a></li>
                <li><a onclick="$katjusha.clipboard('${event.target.innerHTML}\\n${event.target.url}\\n')">タイトルとURLをコピー</a></li>
            `).show(event.pageX, event.pageY)
        }
    }

    find(url){
        return Array.from(this.$.tab.children).find(v => v.url === url)
    }

    open(url, thread = {}){
        const tab = this.find(url)
        tab ? this.select(tab) : this.overwrite(url, thread.subject, thread.html)
    }

    openNew(url, thread = {}){
        const tab = this.find(url)

        if(tab){
            this.select(tab)
        }
        else if(this.$.tab.childElementCount === 1 && !this.$.tab.firstElementChild.url){
            this.overwrite(url, thread.subject, thread.html)
        }
        else{
            this.create(url, thread.subject, thread.html)
        }
    }

    select(tab){
        this.selected?.removeAttribute('selected')
        tab.setAttribute('selected', true)
        this.selected = tab
        $thread.select(tab.thread)

        if(tab.url){
            const thread       = スレッド[tab.url]
            $thread.scrollTop  = thread.scroll
            $title.textContent = thread.subject
            $headline.render(thread)
            history.replaceState(null, null, tab.url)
        }
    }

    create(url, subject='', html=''){
        const thread = t('div', html, {url, className:'スレッド'})
        $thread.shadowRoot.append(thread)

        const tab = t('li', subject, {url, thread})
        this.$.tab.append(tab)
        this.select(tab)
    }

    overwrite(url, subject='', html=''){
        this.selected.url              = url
        this.selected.innerHTML        = subject
        this.selected.thread.url       = url
        this.selected.thread.innerHTML = html
    }

    close(tab){
        if(typeof tab === 'string'){
            tab = this.find(tab)
        }
        if(tab?.url){
            const select = tab.previousElementSibling ?? tab.nextElementSibling
            select ? this.select(select) : this.openNew()

            tab.thread.remove()
            tab.remove()
        }
    }

    closeAll(url){
        for(const tab of Array.from(this.$.tab.children)){
            if(tab.url !== url){
                this.close(tab)
            }
        }
    }

    loading(url, bool = true){
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
        this.url = url
        this.id  = '$form'
        kit(this, $formTemplate)
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

        if(this.url.includes('read.cgi')){
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
        const i = this.$.message.selectionStart

        this.$.message.value = this.$.message.value.slice(0, i) + text + this.$.message.value.slice(i)
        this.$.message.focus()
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
}



class KatjushaContext extends HTMLElement{
    static{
        customElements.define('katjusha-context', this)
    }

    constructor(html){
        super()

        this.id   = '$context'
        kit(this, $contextTemplate)
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
}



class KatjushaPopup extends HTMLElement{
    static{
        customElements.define('katjusha-popup', this)
    }

    constructor(html){
        super()
        this.id = '$popup'
        kit(this, $popupTemplate)
        this.$.popup.innerHTML = html
    }

    show(x, y){
        this.style.left   = `${x}px`
        this.style.bottom = `${y}px`
        $body.prepend(this)
    }
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



function t(name, html = '', prop = {}){
    const el = document.createElement(name)
    el.innerHTML = html

    return Object.assign(el, prop)
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
    return Math.ceil(byte/1024) + 'KB'
}

function clamp(min, num, max){
    return Math.min(Math.max(min, num), max)
}

function kit(self, template){
    if(!self.shadowRoot){
        self.attachShadow({mode:'open'})
        self.shadowRoot.append(template.content.cloneNode(true))
    }

    self.$ = new Proxy(function(){}, {get:(_, name) => self.shadowRoot.querySelector('#'+name), apply})
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
