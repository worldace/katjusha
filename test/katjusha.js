

$katjusha.start = function () {
    $base.title = document.title
    $toolbar.$全板ボタン.textContent = `▽${document.title}`

    if ($base.href !== document.URL) {
        $katjusha.link(document.URL)
    }
}


$katjusha.link = function (url, target){
    $katjusha.href   = url
    $katjusha.target = target
    $katjusha.click()
}


$katjusha.onclick = function(event){
    const {href, target} = event.composedPath()[0]

    if (href === $base.href) {
        event.preventDefault()
        history.replaceState(null, null, href)
    }
    else if (href in $bbs.list) {
        event.preventDefault()
        ajax(`${href}subject.txt`).then(response => $subject.recieve(response, href))
    }
    else if (href?.includes('read.cgi') && $thread.URLParse(href).bbsurl in $bbs.list){
        event.preventDefault()
        const thread  = スレッド[href]
        const headers = thread.etag ? {'If-None-Match':thread.etag, 'Range':`bytes=${thread.byte}-`} : {}

        target ? $tab.openNew(href, thread) : $tab.open(href, thread)
        $tab.loading(href, true)

        ajax(thread.daturl, {headers}).then(response => $thread.recieve(response, href))
    }
}


class KatjushaToolbar extends HTMLElement{

    constructor(){
        super()
        this.html = $toolbarTemplate.content
        benry(this)
    }


    $スレッド投稿アイコン_click(event) {
        new KatjushaForm($subject.bbsurl).open()
    }
}


class KatjushaBorder extends HTMLElement{

    constructor(){
        super()
        this.html = $borderTemplate.content
        benry(this)
    }
}



class KatjushaBBS extends HTMLElement{

    constructor(){
        super()
        this.html = $bbsTemplate.content
        benry(this)

        this.$bbs.innerHTML = this.parse( this.firstChild.textContent.trim() )
    }


    parse(text){
        const bbslist = text.slice(1).split('\n#').map(v => v.split('\n'))
        this.list = {}
        let html  = ''

        for(const categories of bbslist){
            const category = categories.shift()
            html += `<details open><summary>${category}</summary>`

            for(const v of categories){
                const [name,url]     = v.split(' ')
                const [,baseurl,bbs] = url.match(/(.+\/)([^\/]+)\/$/)

                this.list[url] = {category, name, url, baseurl, bbs}
                html += `<a href="${url}">${name}</a>`
            }

            html += `</details>`
        }

        return html
    }


    name(url){
        return this.list[url]?.name
    }


    active(el){
        if(typeof el === 'string'){
            el = this.$shadow.querySelector(`[href="${el}"]`)
        }

        if(el){
            this.selected?.removeAttribute('selected')
            this.selected = el
            el.setAttribute('selected', true)
        }
    }


    $shadow_click(event){
        if (event.target.tagName === 'A') {
            this.active(event.target)
        }
    }

    $shadow_contextmenu(event){
        event.preventDefault()
        event.stopPropagation()

        if (event.target.tagName === 'A') {
            this.active(event.target)

            new KatjushaContext(`
                <li><a onclick="toClipboard('${event.target.href}')">URLをコピー</a></li>
                <li><a onclick="toClipboard('${event.target.innerHTML}\\n${event.target.href}\\n')">掲示板名とURLをコピー</a></li>
            `).show(event.pageX, event.pageY)
        }
    }
}




class KatjushaSubject extends HTMLElement{

    constructor(){
        super()
        this.html = $subjectTemplate.content
        benry(this)
    }


    active(el){
        this.selected?.removeAttribute('selected')
        this.selected = el
        el.setAttribute('selected', true)
    }


    parse(text) {
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

            if (thread.num == thread.既得) {
                thread.新着 = 0
            }

            html += `<tr data-url="${url}"><td>${i}</td><td><a href="${url}">${subject}</a></td><td>${num}</td>
                     <td>${thread.既得 || ''}</td><td>${thread.新着 || ''}</td><td>${thread.最終取得}</td><td>${thread.最終書き込み}</td><td></td></tr>`
        }
    
        return html
    }


    update(thread){
        const tr = Array.from(this.$tbody.rows).find(v => v.dataset.url === thread.url)

        if (tr) {
            this.active(tr)
            tr.cells[2].textContent = thread.num || ''
            tr.cells[3].textContent = thread.既得 || ''
            tr.cells[4].textContent = thread.新着 || ''
            tr.cells[5].textContent = thread.最終取得 || ''
            tr.cells[6].textContent = thread.最終書き込み || ''
        }
    }


    sort(th) {
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
            this.$tbody.innerHTML = this.toHTML(this.parse(response.content), url)

            $title.textContent = `${$base.title} [ ${$bbs.name(url)} ]`
            $bbs.active(url)

            $status.textContent = `${this.$tbody.rows.length}件のスレッドを受信 (${date()})`
            history.replaceState(null, null, url)
        }
        else{
            this.$tbody.textContent = ''
        }
    }


    $shadow_contextmenu(event){
        event.preventDefault()
    }


    $thead_dblclick(event) {
        if(event.target.tagName === 'TH'){
            this.sort(event.target)
        }
    }


    $tbody_mousedown(event) {
        event.preventDefault()
        const tr = event.target.closest('tr')

        if (tr && event.target.cellIndex < 7) {
            this.active(tr)
            $katjusha.link(tr.dataset.url)
        }
    }


    $tbody_contextmenu(event){
        event.preventDefault()
        event.stopPropagation()
        const tr  = event.target.closest('tr')
        const url = tr.dataset.url

        if (tr) {
            this.active(tr)

            new KatjushaContext(`
                <li><a onclick="$katjusha.link('${url}', '_blank')">新しいタブで開く</a></li>
                <li><a onclick="toClipboard('${url}')">URLをコピー</a></li>
                <li><a onclick="toClipboard('${スレッド[url].subject}\\n${url}\\n')">タイトルとURLをコピー</a></li>
            `).show(event.pageX, event.pageY)
        }
    }
}



class KatjushaHeadline extends HTMLElement{

    constructor(){
        super()
        this.html = $headlineTemplate.content
        benry(this)
    }


    render(url) {
        if (url in スレッド) {
            const thread = スレッド[url]

            this.$thread.innerHTML = `${thread.subject} (${thread.num})`
            this.$bbs.innerHTML    = `<a href="${thread.bbsurl}">[${thread.bbsname}]</a>`
            $title.textContent     = thread.subject
            $thread.scrollTop      = thread.scroll //他でやるべき
        }
    }


    $shadow_contextmenu (event) {
        event.preventDefault()
    }


    $レス更新アイコン_click(event) {
        $katjusha.link($tab.selected.url)
    }


    $中止アイコン_click(event) {
        for(const v of ajax.abort){
            v.abort()
        }
    }


    $レス投稿アイコン_click(event) {
        new KatjushaForm($tab.selected.url).open()
    }


    $ごみ箱アイコン_click(event) {
        const url = $tab.selected.url

        if (url in スレッド) {
            $status.textContent = `「${スレッド[url].subject}」のログを削除しました`
            delete スレッド[url]
        }
    }


    $タブ閉じるアイコン_click (event) {
        $tab.close($tab.selected)
    }
}



class KatjushaTab extends HTMLElement{

    constructor(){
        super()
        this.html = $tabTemplate.content
        benry(this)
        this.openNew()
    }


    open(url, thread = {}){
        if (!this.$tab.childElementCount) {
            return this.openNew(url, thread)
        }

        let tab = this.find(url)

        if (tab) {
            return this.select(tab)
        }
        else{
            tab = this.selected
        }

        tab.url          = url
        tab.innerHTML    = thread.subject || ''
        tab.el.url       = url
        tab.el.innerHTML = thread.html || ''

        return this.select(tab)
    }


    openNew(url, thread = {}) {
        const tab = this.find(url)

        if (this.$tab.childElementCount === 1 && !this.$tab.firstElementChild.url) {
            return this.open(url, thread)
        }
        else if (tab) {
            return this.select(tab)
        }
        else{
            return this.select( this.newtab(url, thread.subject, thread.html) )
        }
    }


    close(tab) {
        if(typeof tab === 'string'){
            tab = this.find(tab)
        }

        if (tab?.url) {
            this.select(tab.previousElementSibling || tab.nextElementSibling || this.openNew())
            tab.el.remove()
            tab.remove()
        }
    }


    closeAll(url) {
        for (const tab of Array.from(this.$tab.children).filter(v => v.url !== url)) {
            this.close(tab)
        }
    }


    newtab(url, subject='', html=''){
        const thread     = document.createElement('div')
        thread.className = 'スレッド'
        thread.url       = url
        thread.innerHTML = html

        const tab        = document.createElement('li')
        tab.url          = url
        tab.innerHTML    = subject
        tab.el           = thread

        this.$tab.append(tab)
        $thread.$shadow.append(thread)

        return tab
    }


    find(url) {
        return Array.from(this.$tab.children).find(v => v.url === url)
    }



    select(tab) {
        this.selected?.removeAttribute('selected')
        this.selected = tab
        tab.setAttribute('selected', true)

        $thread.active(tab.el)

        if(tab.url){
            $headline.render(tab.url)
            history.replaceState(null, null, tab.url || $subject.bbsurl || $base.href)
        }

        return tab
    }


    loading(url, bool) {
        this.find(url)?.toggleAttribute('loading', bool)
    }




    $shadow_click(event) {
        if (event.target.tagName === 'LI' && event.target !== this.selected) {
            this.select(event.target)
        }
    }


    $shadow_dblclick(event) {
        $headline.$レス更新アイコン.click()
    }


    $shadow_contextmenu(event) {
        event.preventDefault()
        event.stopPropagation()

        if (event.target.tagName === 'LI') {
            new KatjushaContext(`
                <li><a onclick="$tab.close('${event.target.url}')">閉じる</a></li>
                <li><a onclick="$tab.closeAll('${event.target.url}')">このタブ以外全て閉じる</a></li>
                <li><a onclick="toClipboard('${event.target.url}')">URLをコピー</a></li>
                <li><a onclick="toClipboard('${event.target.innerHTML}\\n${event.target.url}\\n')">タイトルとURLをコピー</a></li>
            `).show(event.pageX, event.pageY)
        }
    }
}



class KatjushaThread extends HTMLElement{

    constructor(){
        super()
        this.html = $threadTemplate.content
        benry(this)
    }


    active(el){
        this.selected?.removeAttribute('selected')
        this.selected = el
        el.setAttribute('selected', true)
    }


    appendHTML(html, url, subject) {
        const tab         = $tab.find(url) || $tab.selected
        tab.innerHTML     = subject
        tab.el.innerHTML += html

        $headline.render(url)
    }


    clear(url) {
        const el = Array.from(this.children).find(v => v.url === url) || this.selected

        if(el){
            el.textContent = ''
        }
    }


    goto(n) {
        this.selected.children[n-1]?.scrollIntoView()
    }


    responseTo(n) {
        $headline.$レス投稿アイコン.click()
        $form.insert(`>>${n}\n`)
    }


    popup(event, n){
        const el = this.selected.children[n-1]

        if (el) {
            const {left, width, top} = event.target.getBoundingClientRect()
            const x = left + width / 2
            const y = innerHeight - top + 6

            new KatjushaPopup(el.outerHTML).show(x, y)
        }
    }


    parse(text, n = 0) {
        const dat  = text.trim().split('\n')
        let  html  = ''

        for (const v of dat) {
            let [from, mail, date, message, subject] = v.split('<>')

            //datファイルにaタグが含まれる場合: replace(/<a (.+?)>(.+?)<\/a>/g, '$2')
            message = message
            .replace(/&gt;&gt;([1-9]\d{0,3})/g, '<span class="anker" data-n="$1" onmouseenter="$thread.popup(event, $1)" onmouseleave="$popup.remove()">&gt;&gt;$1</span>')
            .replace(/(https?:\/\/[^\s<]+)/g, '<a href="$1" target="_blank">$1</a>')
            .replace(/^ /, '')

            html += `
              <article class="レス" data-n="${n}">
                <header><i>${++n}</i><span class="from"><b>${from}</b></span><time>${date}</time><address>${mail}</address></header>
                <p>${message}</p>
              </article>
            `
        }

        return {html, num:dat.length, subject:dat[0].split('<>').pop()}
    }


    URLParse(url) {
        const [,bbs,key] = url.match(/([^\/]+)\/([^\/]+)\/$/)
        const baseurl    = url.replace(/\/test\/.+/, `/`)
        const bbsurl     = `${baseurl}${bbs}/`

        return {bbs, key, bbsurl, baseurl}
    }


    recieve(response, url){

        $tab.loading(url, false)

        if (response.status === 200) {
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

            this.clear(thread.url)
            this.appendHTML(thread.html, thread.url, thread.subject)
            $subject.update(thread)
            $status.textContent = `${dat.num}のレスを受信 (${date()}) ${KB(thread.byte)}`
        }
        else if (response.status === 206) {
            const thread   = スレッド[url]
            const dat      = this.parse(response.content, thread.num)

            thread.html   += dat.html
            thread.num    += dat.num
            thread.byte   += response.byte
            thread.etag    = response.etag
            thread.既得    = thread.num
            thread.新着    = dat.num
            thread.最終取得= date()

            this.appendHTML(dat.html, thread.url, thread.subject)
            $subject.update(thread)
            $status.textContent = `${dat.num}のレスを受信 (${date()}) ${KB(thread.byte)}`
        }
        else if (response.status === 304) {
            const thread = スレッド[url]
            thread.新着  = 0

            $subject.update(thread)
            $status.textContent = `新着なし (${date()}) ${KB(thread.byte)}`
        }
        else if (response.status === 404) {
            $status.textContent = `スレッドが見つかりません (${date()})`
        }
        else{
            return
        }

        history.replaceState(null, null, url)
    }


    $shadow_click(event) {
        if (event.target.tagName === 'I') {
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


    $host_scroll(event) {
        const url = this.selected.url
        スレッド[url].scroll = this.scrollTop
    }
}



class KatjushaStatus extends HTMLElement{

    constructor(){
        super()
        this.html = $statusTemplate.content
        benry(this)
    }
}



class KatjushaForm extends HTMLElement{

    constructor(url){
        super()
        this.html = $formTemplate.content.cloneNode(true)
        benry(this)

        this.url = url
        this.id  = '$form'

        if( url.includes('read.cgi') ){
            const thread = スレッド[url]

            this.$title.textContent = `「${thread.subject}」にレス`
            this.$form.action       = `${thread.baseurl}test/bbs.cgi`
            this.$bbs.value         = thread.bbs
            this.$key.value         = thread.key
            this.$subject.value     = thread.subject
            this.$subject.disabled  = true
        }
        else{
            const bbs = $bbs.list[url]

            this.$title.textContent = `『${bbs.name}』に新規スレッド`
            this.$form.action       = `${bbs.baseurl}test/bbs.cgi`
            this.$bbs.value         = bbs.bbs
        }
    }


    open(){
        if(this.url && !window.$form){
            $body.append(this)
            this.centering()
            this.url.includes('read.cgi') ? this.$message.focus() : this.$subject.focus()
        }
    }


    centering(){
        const {width, height} = this.getBoundingClientRect()
        this.style.left = `${innerWidth/2 - width/2}px`
        this.style.top  = `${innerHeight/2 - height/2}px`
    }


    insert(text){
        const before = this.$message.value.substr(0, this.$message.selectionStart)
        const after  = this.$message.value.substr(this.$message.selectionStart)

        this.$message.value = before + text + after
    }


    disable(bool){
        this.$submit.toggleAttribute('disabled', bool)
    }


    $shadow_contextmenu(event) {
        if (!['text','textarea'].includes(event.target.type)) {
            event.preventDefault()
        }
    }


    $form_reset(event) {
        this.remove()
    }


    $close_click(event) {
        this.remove()
    }


    $sage_change(event) {
        this.$mail.readOnly = this.checked
        this.$mail.value    = this.checked ? 'sage' : ''
    }


    $header_mousedown(event) {
        dndwindow(this, event.pageX, event.pageY)
    }


    $form_submit(event) {
        event.preventDefault()
        this.disable(true)
        ajax(this.$form.action, {method:'POST', body:new FormData(this.$form)})
        .then(response => KatjushaForm.recieve(response, this.url))
    }


    static recieve(response, url){

        window.$form?.disable(false)

        if(response.status !== 200){
            alert('エラーが発生して投稿できませんでした')
        }
        else if(response.content.includes('ＥＲＲＯＲ！')){
            alert( response.content.match(/<b>(.+?)</i)[1] )
        }
        else{
            if (url.includes('read.cgi')) {
                スレッド[url].最終書き込み = date()
            }

            window.$form?.remove()
            $katjusha.link(url)
        }
    }
}



class KatjushaContext extends HTMLElement{

    constructor(html){
        super()

        this.id   = '$context'
        this.html = $contextTemplate.content.cloneNode(true)
        benry(this)
        this.$context.innerHTML = html

        window.$context?.remove()
        document.addEventListener('click', () => this.remove(), {once:true})
    }


    show(x, y){
        this.style.left = `${x}px`
        this.style.top  = `${y}px`
        $body.append(this)
    }


    $shadow_click(event){
        if (!event.target.onclick && !event.target.href) {
            event.stopPropagation()
        }
    }


    $shadow_contextmenu(event){
        event.preventDefault()
    }
}



class KatjushaPopup extends HTMLElement{

    constructor(html){
        super()
        this.id   = '$popup'
        this.html = $popupTemplate.content.cloneNode(true)
        benry(this)
        this.$popup.innerHTML = html
    }


    show(x, y){
        this.style.left   = `${x}px`
        this.style.bottom = `${y}px`
        $body.prepend(this)
    }
}



async function ajax(url, option = {}) {
    const host  = new URL(url).hostname
    const abort = new AbortController()

    try {
        $status.textContent = `${host}に接続しています`
        $toolbar.$anime.dataset.ajax++
        ajax.abort.add(abort)
        var response = await fetch(url, {cache:'no-store', signal:abort.signal, ...option})
        $status.textContent = `${host}に接続しました`
    }
    catch (error) { // DNSエラー・CORSエラー・Abortの時のみ来る。404の時は来ない。
        $status.textContent = (error.name === 'AbortError') ? `` : `${host}に接続できませんでした`
        return error // finally後にreturnされる。(responseはundefined)
    }
    finally {
        $toolbar.$anime.dataset.ajax--
        ajax.abort.delete(abort)
    }

    const buffer     = await response.arrayBuffer()
    response.content = new TextDecoder('shift-jis').decode(buffer)
    response.byte    = buffer.byteLength
    response.etag    = response.headers.get('ETag')?.replace('W/', '').replace('-gzip', '')

    return response
}


ajax.abort = new Set


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


function date() {
    const d  = new Date()

    const 年 = d.getFullYear()
    const 月 = (d.getMonth()+1).toString().padStart(2, 0)
    const 日 = d.getDate().toString().padStart(2, 0)
    const 時 = d.getHours().toString().padStart(2, 0)
    const 分 = d.getMinutes().toString().padStart(2, 0)
    const 秒 = d.getSeconds().toString().padStart(2, 0)

    return `${年}/${月}/${日} ${時}:${分}:${秒}`
}


function KB(byte = 0) {
    return `${Math.ceil(byte/1024)}KB`
}


function dndwindow(el, pageX, pageY) {
    const {left, top, width, height} = el.getBoundingClientRect()

    const startX = left - pageX
    const startY = top  - pageY
    const limitX = innerWidth  - width
    const limitY = innerHeight - height

    document.addEventListener('mousemove', move, {passive:true})
    document.addEventListener('mouseup', up, {once:true})

    function move(event) {
        el.style.left = Math.min(Math.max(0, startX+event.pageX), limitX) + 'px'
        el.style.top  = Math.min(Math.max(0, startY+event.pageY), limitY) + 'px'
    }

    function up(event) {
        document.removeEventListener('mousemove', move)
    }
}


function benry(self){ // https://qiita.com/economist/items/6c923c255f6b4b7bbf84
    self.$host   = self
    self.$shadow = self.attachShadow({mode:'open'})

    if(self.html instanceof Node){
        self.$shadow.append(self.html)
    }
    else{
        self.$shadow.innerHTML = self.html ?? ''
    }

    for(const el of self.$shadow.querySelectorAll('[id]')){
        self[`$${el.id}`] = el
    }

    const methods = Object.getOwnPropertyNames(self.constructor.prototype).filter(v => typeof self[v] === 'function')

    for(const method of methods){
        self[method] = self[method].bind(self)
        const match  = method.match(/^(\$.*?)_([^_]+)$/)
        if(match){
            self[match[1]]?.addEventListener(match[2], self[method])
        }
    }
}



customElements.define('katjusha-toolbar', KatjushaToolbar)
customElements.define('katjusha-border', KatjushaBorder)
customElements.define('katjusha-bbs', KatjushaBBS)
customElements.define('katjusha-subject', KatjushaSubject)
customElements.define('katjusha-headline', KatjushaHeadline)
customElements.define('katjusha-thread', KatjushaThread)
customElements.define('katjusha-tab', KatjushaTab)
customElements.define('katjusha-status', KatjushaStatus)
customElements.define('katjusha-form', KatjushaForm)
customElements.define('katjusha-context', KatjushaContext)
customElements.define('katjusha-popup', KatjushaPopup)


$katjusha.start()
