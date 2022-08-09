import kit from 'https://cdn.jsdelivr.net/gh/worldace/kit/kit.js'


const css = {
toolbar:`
#ヘッダ{
    background-color: #f0f0f0;
    display: flex;
    border-bottom: solid 1px #a0a0a0;
}
#ナビアイコン{
    display: flex;
    align-items: center;
}
#オンラインアイコン{
    background-image: url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQBAMAAADt3eJSAAAAElBMVEUAAABSGAD/vQD//wCtewD///9149PrAAAAAXRSTlMAQObYZgAAAERJREFUCNdjQAOCMNoRSjsJQGkVAQhtDJZhdDIOhsgIGYcaghmMyqbGECFhYyVFsIixkgrYQBEgDVEMpRlBNFhGENViAOIhBof9+an+AAAAAElFTkSuQmCC');
}
#セーブアイコン{
    background-image: url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQBAMAAADt3eJSAAAAGFBMVEUAAAAAAP////8A//+9vb0AAHt7e3sAAADJRqraAAAAAXRSTlMAQObYZgAAADZJREFUCNdjgANmYzBgYDAUUgICwQAoQwzGECSSIQgCqAwxFxcXCMO9BMFAlmINDUtLSwtlAAC7RBPuQ+XDIQAAAABJRU5ErkJggg==');
}
#検索アイコン{
    background-image: url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQBAMAAADt3eJSAAAAGFBMVEUAAAD/vQAAAAD//wDWnFJ7WgCEhIT////MopgYAAAAAXRSTlMAQObYZgAAAGRJREFUCNctysENgDAIhWFidACqAwgm3hGN11oZxE7h+pbW/8IX8gB6M6jdqtFvL4i7WYQBA4+qRwEJIQYYgupWQecr5Fh20woSbJ9UNpdjIuFckTitDjQzzgE69laGFj8/uvkDXJEPCVqpxYQAAAAASUVORK5CYII=');
}
#巡回アイコン{
    background-image: url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQBAMAAADt3eJSAAAAGFBMVEUAAAD/GACEAAApWv8AAITWAAAAAAD/WlIdvawAAAAAAXRSTlMAQObYZgAAAGFJREFUCNdNzDEOgCAQRNEJEPu1secERDgAES5ggbY2HsDC+7uzlVP9PMLiNxdjtFhF5gQgbxotwXenERpCZvgC9KwrFVq6ap/1iQfuXUTGBUzjkfcAlM6FQCIYEYwINsIHyLoO36kkZ4wAAAAASUVORK5CYII=');
}
#スレッド投稿アイコン{
    background-image: url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQBAMAAADt3eJSAAAAJFBMVEUAAAAhUv9SOQAAAACMrf8AMZTWnFJ7WgB7e1L///9SWlL/3q2cp7MCAAAAAXRSTlMAQObYZgAAAGFJREFUCNdjAAEmJQUGMChKSwLT7E7JZmChEqdkq2SQgMtEtVUgRomnoFBaMlhAUFBJGSwgKBRqABFQDWZgaIcKMDRBBRi6FUECIMYmiACDVYYSWIBhsUWHMthGY2NjsAAABugWBjID06AAAAAASUVORK5CYII=');
}
#ペインアイコン{
    background-image: url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQAgMAAABinRfyAAAADFBMVEUAAAD/vQAAAAB7WgAppcrEAAAAAXRSTlMAQObYZgAAAB9JREFUCNdjAAOtVatWMOi/f/+DQTc3N4J0AmIACAAAqFUWZyWMfcYAAAAASUVORK5CYII=');
}
#グリッド1アイコン{
    background-image: url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQBAMAAADt3eJSAAAAD1BMVEUAAAAAAAD//////wB7e3vPJERoAAAAAXRSTlMAQObYZgAAACFJREFUCNdjgAMWF0dBIBBgYGFgVAYCHAwUNZQyEJbCAAB61wj/gpHNVgAAAABJRU5ErkJggg==');
}
#グリッド2アイコン{
    background-image: url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQAgMAAABinRfyAAAADFBMVEUAAAAAAAD//////wDo8JS4AAAAAXRSTlMAQObYZgAAACFJREFUCNdjAAPR0NAQBgHp3VuQCVGQmAADCxEExAAQAADKVAjjS/YQ1AAAAABJRU5ErkJggg==');
}
#グリッド3アイコン{
    background-image: url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQAgMAAABinRfyAAAADFBMVEUAAAAAAAD//////wDo8JS4AAAAAXRSTlMAQObYZgAAACFJREFUCNdjAAPR0NAQBgEBBhZkQhQkJr17CxEExAAQAAAQNhAxyyxjBAAAAABJRU5ErkJggg==');
}
#設定アイコン{
    background-image: url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAMAAAAoLQ9TAAAAUVBMVEUAAAAAAACEhITG3sZ7OQApOf9S/wApOVIp3gAAnFL/WgD///97/61Se/8pWv8AAIR73gApOa0Ae1IAewCte/8A/60Ava17/1JSWlIA/wB7vQDXW3VzAAAAAXRSTlMAQObYZgAAAItJREFUGNM9zQsOwyAMA1AcGj4rBdbuf/+DzhmjFkL4AYr7BRY7zKqas56EpltOve9tCHJ65XSXEYPU0yeIePGr98IeSmCPMdIk8kcpQVasgHibhZYCr9hsRYI+CKggCKIjbM//i+WyEBxqCeAAKMEZXLdbFfbDYIgq4XgbDIHBjglGBDiDGQHItn0BWkgEOp0LAPAAAAAASUVORK5CYII=');
}
#ヘルプアイコン{
    background-image: url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQBAMAAADt3eJSAAAAHlBMVEUAAAApOf8pOVIpOa17nP////+EhITG3satva1SWlKL+I0lAAAAAXRSTlMAQObYZgAAAHFJREFUCNclyDEOgzAQRNGRbzAW9AlBDim9N7BEDoCECzokCqB1R03DsVnjXz19aOaFUitFJrCoZRxUOurwp+RRsabVQcaRP7zJvg92R+OrkewWfJMPtJfAxeTZnQ6fNSbZZIZRHYsDsiYdj/J41Oi4AaXME0dzTLUNAAAAAElFTkSuQmCC');
}
#板ボタン{
    flex: 1;
    display: flex;
    align-items: center;
}
#板ボタン span{
    padding: 2px 6px;
}
#anime{
    width: 32px;
    height: 32px;
    background-image: url('data:image/gif;base64,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');
    background-repeat: no-repeat;
    background-size: 32px;
    background-position: center;
    z-index: 2;
}
#anime[data-ajax="0"]{
    background-image: url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAMAAABEpIrGAAAAb1BMVEX4+ND42KD4uFio6ACg6AD4+MiQ6ACIUABK2ACI4ACASABAIgDwiAAi0AiY6AD48Lj4wFgy0AiA4AD46LhA0Ah44ABY2AD4yICISAD44KgYyAhg2AD4yHhw4ABo4ABo2AD40IDoiABIKADogAAAAACzzM64AAABjElEQVQ4y22QAXPaMAyFn7R5orKZzbIRp4UWWP//b6wUxwSu+bjcvcv7Ihnjx4ps5UdBtzJ+rtSt/CAIy0bG7zs66UbGr05lKvV7XgUhkPQ8UM94WRDOgViWjKHnu6AU7K2+qKjnTJYd/GloyQCItbA9MNcML7pQCUYh4sI0uDsxVxf+NTQHhKJMDixnFhYrsPTF3kGhecgDPA8SZgPnmbZBPivu1E8d6/mMd0c4w7CpoC7YvrHoOz4cpTaXERLNBBDTyPKBN0doakYwQ0Xl6v/zwhzfmlCJMp6wfjyVZMJxRp+N7N+fmG/H4yIImbHswJCJTqP1KZqwO+4cUb+fTJOZk09n763AbkHIR9uX1pSU4i1G71ehLmcbL5wcbx38NUTtt+z3Gema/qdoheFC61bjMhtdOBwqKCUC2pLczuFLDo4JkdJEZiiaQX4OfhJKAFOQx1vgcl2E/T5OjFB6H/IwkfUc9zMuEJghcOx7G2ACp7tgRru/SP0ex9J7E14Nv7VbZJvbHtsfXxe+ALc1JiQ/QQazAAAAAElFTkSuQmCC');
}
.icon{
    padding: 1px;
    border: solid 1px #f0f0f0;
    width: 20px;
    height: 18px;
    background-repeat: no-repeat;
    background-size: 16px;
    background-position: center;
}
.icon:hover{
    border-top: solid 1px #fff;
    border-left: solid 1px #fff;
    border-bottom: solid 1px #a0a0a0;
    border-right: solid 1px #a0a0a0;
}
.icon:active{
    border-top: solid 1px #a0a0a0;
    border-left: solid 1px #a0a0a0;
    border-bottom: solid 1px #fff;
    border-right: solid 1px #fff;
    transform: translate(1px, 1px);
}
.icon-separate{
    width: 2px;
    height: 16px;
    margin: 0 3px;
    background-repeat: no-repeat;
    background-size: 2px 16px;
    background-position: center;
    background-image: url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAIAAAAQAQMAAAAGZjz3AAAABlBMVEX///+goKD0a5EfAAAAC0lEQVQI12NowA8BgCAIAWcmA/MAAAAASUVORK5CYII=');
}
.icon-text{
    padding: 2px 2px;
    margin: 0 1px;
    border: solid 1px #f0f0f0;
}
.icon-text:hover{
    border-top: solid 1px #fff;
    border-left: solid 1px #fff;
    border-bottom: solid 1px #a0a0a0;
    border-right: solid 1px #a0a0a0;
}
.icon-text:active{
    border-top: solid 1px #a0a0a0;
    border-left: solid 1px #a0a0a0;
    border-bottom: solid 1px #fff;
    border-right: solid 1px #fff;
    transform: translate(1px, 1px);
}
`,


border:`
:host{
    height: 7px;
    margin-top: 1px;
    background-color: #f0f0f0;
    border-bottom: solid 1px #a0a0a0;
    border-left: none;
    border-top: none;
}
`,


bbs:`
:host{
    padding-top: 3px;
    border-right: solid 1px #a0a0a0;
    overflow-y: scroll;
}
details{
}
summary{
    outline: none;
    padding: 1px 1px;
}
a{
    text-decoration: none;
    color: #000;
    padding: 1px 8px;
    margin: 1px 0;
    display: block;
}
a[selected]{
    color: #fff;
    background-color: #0078d7;
}
details:nth-of-type(33n+1){
    border-left: 4px solid #ffffff;
}
details:nth-of-type(33n+2){
    border-left: 4px solid #985a62;
}
details:nth-of-type(33n+3){
    border-left: 4px solid #ddffdd;
}
details:nth-of-type(33n+4){
    border-left: 4px solid #ffd7ff;
}
details:nth-of-type(33n+5){
    border-left: 4px solid #519db0;
}
details:nth-of-type(33n+6){
    border-left: 4px solid #d7d7ff;
}
details:nth-of-type(33n+7){
    border-left: 4px solid #008080;
}
details:nth-of-type(33n+8){
    border-left: 4px solid #ff0000;
}
details:nth-of-type(33n+9){
    border-left: 4px solid #baa047;
}
details:nth-of-type(33n+10){
    border-left: 4px solid #ff8686;
}
details:nth-of-type(33n+11){
    border-left: 4px solid #c2b1ba;
}
details:nth-of-type(33n+12){
    border-left: 4px solid #8b3f78;
}
details:nth-of-type(33n+13){
    border-left: 4px solid #a9ba32;
}
details:nth-of-type(33n+14){
    border-left: 4px solid #a096de;
}
details:nth-of-type(33n+15){
    border-left: 4px solid #d3c48d;
}
details:nth-of-type(33n+16){
    border-left: 4px solid #ff00ff;
}
details:nth-of-type(33n+17){
    border-left: 4px solid #ffff00;
}
details:nth-of-type(33n+18){
    border-left: 4px solid #8f8c91;
}
details:nth-of-type(33n+19){
    border-left: 4px solid #ffa2ff;
}
details:nth-of-type(33n+20){
    border-left: 4px solid #0000ff;
}
details:nth-of-type(33n+21){
    border-left: 4px solid #d022c4;
}
details:nth-of-type(33n+22){
    border-left: 4px solid #b3ffb3;
}
details:nth-of-type(33n+23){
    border-left: 4px solid #37e6d9;
}
details:nth-of-type(33n+24){
    border-left: 4px solid #9595ff;
}
details:nth-of-type(33n+25){
    border-left: 4px solid #5b30c2;
}
details:nth-of-type(33n+26){
    border-left: 4px solid #c8f1ff;
}
details:nth-of-type(33n+27){
    border-left: 4px solid #00ff00;
}
details:nth-of-type(33n+28){
    border-left: 4px solid #28caff;
}
details:nth-of-type(33n+29){
    border-left: 4px solid #ffffd2;
}
details:nth-of-type(33n+30){
    border-left: 4px solid #ffd0d0;
}
details:nth-of-type(33n+31){
    border-left: 4px solid #008cbb;
}
details:nth-of-type(33n+32){
    border-left: 4px solid #ea8aac;
}
details:nth-of-type(33n+33){
    border-left: 4px solid #000000;
}
`,

}

$katjusha.start = function () {
    $base.title = document.title
    $toolbar.$.全板ボタン.textContent = `▽${document.title}`
    $katjusha.aborts = new Set

    if ($base.href !== document.URL) {
        $katjusha.link(document.URL)
    }
}


$katjusha.link = function (url, target){
    $katjusha.href   = url
    $katjusha.target = target
    $katjusha.click()
}


$katjusha.fetch = async function(url, option = {}) {
    const host  = new URL(url).hostname
    const abort = new AbortController()

    try {
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
    catch (error) { // DNSエラー・CORSエラー・Abortの時のみ来る。404の時は来ない。
        $status.textContent = (error.name === 'AbortError') ? `` : `${host}に接続できませんでした`
        return error
    }
    finally {
        $toolbar.$.anime.dataset.ajax--
        $katjusha.aborts.delete(abort)
    }
}


$katjusha.onclick = function(event){
    const {href, target} = event.composedPath()[0]

    if (href === $base.href) {
        event.preventDefault()
        history.replaceState(null, null, href)
    }
    else if (href in $bbs.list) {
        event.preventDefault()
        $katjusha.fetch(`${href}subject.txt`).then(response => $subject.recieve(response, href))
    }
    else if (href?.includes('read.cgi') && $thread.URLParse(href).bbsurl in $bbs.list){
        event.preventDefault()
        const thread  = スレッド[href]
        const headers = thread.etag ? {'If-None-Match':thread.etag, 'Range':`bytes=${thread.byte}-`} : {}

        target ? $tab.openNew(href, thread) : $tab.open(href, thread)
        $tab.loading(href, true)

        $katjusha.fetch(thread.daturl, {headers}).then(response => $thread.recieve(response, href))
    }
}


class KatjushaToolbar extends HTMLElement{

    html(){
        return `
<header id="ヘッダ">
  <div id="ナビアイコン">
    <span id="オンラインアイコン" class="icon"></span>
    <span id="セーブアイコン" class="icon"></span>
    <span class="icon-separate"></span>
    <span id="検索アイコン" class="icon"></span>
    <span id="巡回アイコン" class="icon"></span>
    <span id="スレッド投稿アイコン" class="icon" title="新規スレッド書き込み"></span>
    <span class="icon-separate"></span>
    <span id="ペインアイコン" class="icon"></span>
    <span id="グリッド1アイコン" class="icon"></span>
    <span id="グリッド2アイコン" class="icon"></span>
    <span id="グリッド3アイコン" class="icon"></span>
    <span class="icon-separate"></span>
    <span id="設定アイコン" class="icon"></span>
    <span id="ヘルプアイコン" class="icon" title="ヘルプ"></span>
    <span class="icon-separate"></span>
  </div>
  <div id="板ボタン">
    <span class="icon-text" id="全板ボタン">▽</span>
  </div>
  <div id="anime" data-ajax="0"></div>
</header>
<style>${css.toolbar}</style>
    `}


    constructor(){
        super()
        kit(this)
    }


    $スレッド投稿アイコン_click(event) {
        new KatjushaForm($subject.bbsurl).open()
    }
}


class KatjushaBorder extends HTMLElement{

    constructor(){
        super()
        kit(this)
    }


    html(){
        return `<style>${css.border}</style>`
    }
}



class KatjushaBBS extends HTMLElement{

    html(){
        return `<div id="bbs"></div><style>${css.bbs}</style>`
    }


    constructor(){
        super()
        kit(this)
    }

    attributeChangedCallback(name, oldValue, newValue){
        if(name === 'bbslist'){
            this.$.bbs.innerHTML = this.parse(newValue)
        }
    }

    static get observedAttributes(){
        return ['bbslist']
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


    $_click(event){
        if (event.target.tagName === 'A') {
            this.active(event.target)
        }
    }

    $_contextmenu(event){
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
        kit(this)
    }


    active(el){
        this.selected?.removeAttribute('selected')
        this.selected = el
        el.setAttribute('selected', true)
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
        const tr = Array.from(this.$.tbody.rows).find(v => v.dataset.url === thread.url)

        if (tr) {
            this.active(tr)
            tr.cells[2].textContent = thread.num || ''
            tr.cells[3].textContent = thread.既得 || ''
            tr.cells[4].textContent = thread.新着 || ''
            tr.cells[5].textContent = thread.最終取得 || ''
            tr.cells[6].textContent = thread.最終書き込み || ''
        }
    }


    html(){
        return $subjectTemplate.content
    }


    $_contextmenu(event){
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
        const tr = event.target.closest('tr')

        if (tr) {
            const url = tr.dataset.url
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


    html(){
        return $headlineTemplate.content
    }


    constructor(){
        super()
        kit(this)
    }


    render(thread) {
        this.$.thread.innerHTML = `${thread.subject} (${thread.num})`
        this.$.bbs.innerHTML    = `<a href="${thread.bbsurl}">[${thread.bbsname}]</a>`
    }


    $_contextmenu (event) {
        event.preventDefault()
    }


    $レス更新アイコン_click(event) {
        $katjusha.link($tab.selected.url)
    }


    $中止アイコン_click(event) {
        for(const v of $katjusha.aborts){
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


    html(){
        return $tabTemplate.content
    }

    constructor(){
        super()
        kit(this)
        this.openNew()
    }


    open(url, thread = {}){
        if (!this.$.tab.childElementCount) {
            return this.openNew(url, thread)
        }

        let tab = this.find(url)

        if (tab) {
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


    openNew(url, thread = {}) {
        const tab = this.find(url)

        if (this.$.tab.childElementCount === 1 && !this.$.tab.firstElementChild.url) {
            return this.open(url, thread)
        }
        else if (tab) {
            return this.select(tab)
        }
        else{
            return this.select( this.create(url, thread.subject, thread.html) )
        }
    }


    close(tab) {
        if(typeof tab === 'string'){
            tab = this.find(tab)
        }

        if (tab?.url) {
            this.select(tab.previousElementSibling || tab.nextElementSibling || this.openNew())
            tab.panel.remove()
            tab.remove()
        }
    }


    closeAll(url) {
        for (const tab of Array.from(this.$.tab.children).filter(v => v.url !== url)) {
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


    select(tab) {
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


    find(url) {
        return Array.from(this.$.tab.children).find(v => v.url === url)
    }


    loading(url, bool) {
        this.find(url)?.toggleAttribute('loading', bool)
    }


    $_click(event) {
        if (event.target.tagName === 'LI' && event.target !== this.selected) {
            this.select(event.target)
        }
    }


    $_dblclick(event) {
        if (event.target.tagName === 'LI' && event.target.url) {
            $headline.$.レス更新アイコン.click()
        }
    }


    $_contextmenu(event) {
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

    html(){
        return $threadTemplate.content
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


    active(el){
        this.selected?.removeAttribute('selected')
        this.selected = el
        el.setAttribute('selected', true)
    }


    goto(n) {
        this.selected.children[n-1]?.scrollIntoView()
    }


    responseTo(n) {
        $headline.$.レス投稿アイコン.click()
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

            this.render(thread)
            $headline.render(thread)
            $subject.update(thread)
            $title.textContent  = thread.subject
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

            this.render(thread, dat.html)
            $headline.render(thread)
            $subject.update(thread)
            $title.textContent  = thread.subject
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
        else if (response.status === 416) {
            delete スレッド[url]
            $katjusha.link(url)
            return
        }
        else{
            return
        }

        history.replaceState(null, null, url)
    }


    parse(text, n = 0) {
        const dat  = text.trim().split('\n')
        let  html  = ''

        for (const v of dat) {
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


    URLParse(url) {
        const [,bbs,key] = url.match(/([^\/]+)\/([^\/]+)\/$/)
        const baseurl    = url.replace(/\/test\/.+/, `/`)
        const bbsurl     = `${baseurl}${bbs}/`

        return {bbs, key, bbsurl, baseurl}
    }


    $_click(event) {
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
}



class KatjushaStatus extends HTMLElement{

    html(){
        return $statusTemplate.content
    }


    constructor(){
        super()
        kit(this)
    }
}



class KatjushaForm extends HTMLElement{

    html(){
        return $formTemplate.content.cloneNode(true)
    }


    constructor(url){
        super()
        this.url  = url
        this.id   = '$form'
        kit(this)
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


    $_contextmenu(event) {
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
        this.$.mail.readOnly = this.checked
        this.$.mail.value    = this.checked ? 'sage' : ''
    }


    $header_mousedown(event) {
        dndwindow(this, event.pageX, event.pageY)
    }


    async $form_submit(event) {
        event.preventDefault()
        this.disable(true)
        const response = await $katjusha.fetch(this.$.form.action, {method:'POST', body:new FormData(this.$.form)})
        KatjushaForm.recieve(response, this.url)
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
            if (url.includes('read.cgi')) {
                スレッド[url].最終書き込み = date()
            }
            window.$form?.remove()
            $katjusha.link(url)
        }
    }
}



class KatjushaContext extends HTMLElement{

    html(){
        return $contextTemplate.content.cloneNode(true)
    }


    constructor(html){
        super()

        this.id   = '$context'
        kit(this)
        this.$.context.innerHTML = html

        window.$context?.remove()
        document.addEventListener('click', () => this.remove(), {once:true})
    }


    show(x, y){
        this.style.left = `${x}px`
        this.style.top  = `${y}px`
        $body.append(this)
    }


    $_click(event){
        if (!event.target.onclick && !event.target.href) {
            event.stopPropagation()
        }
    }


    $_contextmenu(event){
        event.preventDefault()
    }
}



class KatjushaPopup extends HTMLElement{

    html(){
        return $popupTemplate.content.cloneNode(true)
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
