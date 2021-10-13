

$katjusha.start = function () {
    window.スレッド = {}
    $base.title = document.title
    //全板ボタン.textContent = `▽${base.title}`

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
    const url = event.path[0].href ?? ''

    if(!url){
        return
    }
    else if (url === $base.href) {
        event.preventDefault()
        history.replaceState(null, null, url)
    }
    else if ($bbs.has(url)) {
        event.preventDefault()
        $bbs.active(url)
        ajax(url).then(response => ajax.subject(response))
    }
    else if (url.includes('read.cgi') && $bbs.has(スレッドURL分解(url).bbsurl)){
        event.preventDefault()
        event.path[0].target ? $tab.openNew(url, スレッド[url]) : $tab.open(url, スレッド[url])
        ajax(url).then(response => ajax.thread(response))
    }
}


class KatjushaToolbar extends HTMLElement{
    constructor(){
        super()
        benry(this)
    }


    $スレッド投稿アイコン_click(event) {
        new KatjushaForm().open($subject.bbsurl)
    }


    get html(){
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
        <style>
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
        </style>
        `
    }
}


class KatjushaBorder extends HTMLElement{
    constructor(){
        super()
        benry(this)
    }

    get html(){
        return `
        <style>
        :host{
            height: 7px;
            margin-top: 1px;
            background-color: #f0f0f0;
            border-bottom: solid 1px #a0a0a0;
            border-left: none;
            border-top: none;
        }
        </style>
        `
    }
}



class KatjushaBBS extends HTMLElement{
    constructor(){
        super()
        this.list    = JSON.parse(this.firstChild.textContent)
        this.content = this.render(this.list)
        benry(this)
    }


    $_contextmenu(event){
        event.preventDefault()
        event.stopPropagation()

        if (event.target.tagName !== 'A') {
            return
        }

        this.active(event.target)

        const context = `
          <ul class="menu">
            <li><a onclick="toClipboard('${event.target.href}')">URLをコピー</a></li>
            <li><a onclick="toClipboard('${event.target.innerHTML}\\n${event.target.href}\\n')">掲示板名とURLをコピー</a></li>
          </ul>
        `
        new KatjushaContext(context, event.pageX, event.pageY).show()
    }


    render(list){
        let html = ''
        let category

        for(const v of list){
            if(v.category !== category){
                category = v.category
                html += `</details><details open><summary>${v.category}</summary>`
            }
            html += `<a href="${v.url}">${v.name}</a>`
        }

        return html.slice(10) + '</details>'
    }


    has(url){
        return this.list.some(v => v.url === url)
    }


    name(url){
        return this.list.find(v => v.url === url)?.name
    }


    active(el){
        if(typeof el === 'string'){
            el = this.$.querySelector(`a[href="${el}"]`)
            if(!el){
                return
            }
        }

        this.selected?.removeAttribute('selected')
        this.selected = el
        el.setAttribute('selected', true)
    }


    get html(){
        return `
        ${this.content}
        <style>
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
        </style>`
    }
}




class KatjushaSubject extends HTMLElement{

    constructor(){
        super()
        benry(this)
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
            tr.querySelector('a').click()
        }
    }


    $tbody_contextmenu(event){
        event.preventDefault()
        event.stopPropagation()
        const tr = event.target.closest('tr')

        if (!tr) {
            return
        }

        this.active(tr)

        const a = tr.querySelector('a')
        const context = `
        <ul class="menu context-subject">
          <li><a onclick="$katjusha.link('${a.href}', '_blank')">新しいタブで開く</a></li>
          <li><a onclick="toClipboard('${a.href}')">URLをコピー</a></li>
          <li><a onclick="toClipboard('${a.textContent}\\n${a.href}\\n')">タイトルとURLをコピー</a></li>
        </ul>
        `
        new KatjushaContext(context, event.pageX, event.pageY).show()
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


    active(el){
        this.selected?.removeAttribute('selected')
        this.selected = el
        el.setAttribute('selected', true)
    }


    parse(text) {
        const list = text.trim().split('\n')

        for(let i = 0; i < list.length; i++){
            const [, key, subject, num] = list[i].match(/(\d+)\.dat<>(.+?) \((\d+)\)$/)
            list[i] = {i:i+1, key, subject, num}
        }

        return list
    }


    render(list, bbsurl){
        let html = ''

        for(const {i, key, subject, num} of list){
            const url = スレッドURL作成(bbsurl, key)
            const thread = スレッド[url] || {url, subject}
            thread.num = num //ここでthreadをいじるのは悪手

            if (thread.num == thread.既得) {
                thread.新着 = 0
            }

            html += `<tr data-url="${thread.url}"><td>${i}</td><td><a href="${thread.url}">${thread.subject}</a></td><td>${thread.num}</td>
                     <td>${thread.既得 || ''}</td><td>${thread.新着 || ''}</td><td>${thread.最終取得 || ''}</td><td>${thread.最終書き込み || ''}</td><td></td></tr>`
        }
    
        return html
    }


    update(thread){
        const tr = this.$tbody.querySelector(`[data-url="${thread.url}"]`)

        if (tr) {
            this.active(tr)
            tr.cells[2].textContent = thread.num || ''
            tr.cells[3].textContent = thread.既得 || ''
            tr.cells[4].textContent = thread.新着 || ''
            tr.cells[5].textContent = thread.最終取得 || ''
            tr.cells[6].textContent = thread.最終書き込み || ''
        }
    }
    
    
    get html(){
        return `
        <table>
          <thead id="thead">
            <tr><th>No.</th><th>タイトル</th><th>レス</th><th>既得</th><th>新着</th><th>最終取得</th><th>最終書き込み</th><th></th></tr>
          </thead>
          <tbody id="tbody"></tbody>
        </table>
        <style>
        :host{
            overflow-y: scroll;
        }
        table{
            border-collapse: collapse;
            width: 100%;
            margin: 1px 0 3px 0;
            /*table-layout: fixed;*/
        }
        th{ /* stickey https://teratail.com/questions/202382 */
            background-color: #f0f0f0;
            border-top: solid 1px #e3e3e3;
            border-left: solid 1px #e3e3e3;
            border-right: solid 1px #a0a0a0;
            border-bottom: solid 3px #fff;
            box-shadow: 0 -1px 0 0 #a0a0a0 inset;
            font-weight: normal;
            padding: 1px 4px 2px 4px;
        }
        th:nth-of-type(1){
            text-align: right;
            width: 40px;
        }
        th:nth-of-type(2){
            text-align: left;
            padding-left: 8px;
            width: 450px;
            overflow: hidden;
        }
        th:nth-of-type(3){
            text-align: right;
            width: 45px;
        }
        th:nth-of-type(4){
            text-align: right;
            width: 45px;
        }
        th:nth-of-type(5){
            text-align: right;
            width: 45px;
        }
        th:nth-of-type(6){
            text-align: left;
            width: 140px;
        }
        th:nth-of-type(7){
            text-align: left;
            width: 140px;
        }


        td{
            padding: 2px 4px;
        }
        td:nth-of-type(1){
            text-align: right;
        }
        td:nth-of-type(2){
            text-align: left;
            padding-left: 10px;
        }
        td:nth-of-type(3){
            text-align: right;
        }
        td:nth-of-type(4){
            text-align: right;
        }
        td:nth-of-type(5){
            text-align: right;
        }
        td:nth-of-type(6){
            text-align: left;
        }
        td:nth-of-type(7){
            text-align: left;
        }
        td:nth-of-type(8){
            z-index: 2;
            background-color: #fff;
        }
        a{
            text-decoration: none;
            color: #000;
            cursor: default;
        }
        tr[selected]{
            color: #fff;
            background-color: #0078d7;
        }
        tr[selected] a{
            color: #fff;
        }
        </style>
        `
    }
}



class KatjushaHeadline extends HTMLElement{

    constructor(){
        super()
        benry(this)
    }


    render(url) {
        if (スレッド[url]) {
            const thread = スレッド[url]
            this.$thread.innerHTML = `${thread.subject} (${thread.num})`
            this.$bbs.innerHTML    = `<a href="${thread.bbsurl}">[${thread.bbsname}]</a>`
            $title.textContent     = thread.subject
            $thread.scrollTop      = thread.scroll //他でやるべき
        }
    }


    $_contextmenu (event) {
        event.preventDefault()
    }


    $レス更新アイコン_click(event) {
        if ($tab.selected.url) {
            $tab.select($tab.selected)
            $katjusha.link($tab.selected.url)
        }
    }


    $中止アイコン_click(event) {
        for(const v of ajax.abort){
            v.abort()
        }
    }


    $レス投稿アイコン_click(event) {
        new KatjushaForm().open($tab.selected.url)
    }


    $ごみ箱アイコン_click(event) {
        const url = $tab.selected.url

        if (スレッド[url]) {
            $status.textContent = `「${スレッド[url].subject}」のログを削除しました`
            delete スレッド[url]
        }
    }


    $タブ閉じるアイコン_click (event) {
        $tab.close($tab.selected)
    }


    get html(){
        return `
        <div id="wrap">
          <div>
            <span id="bbs"></span>
            <span id="thread"></span>
          </div>
          <div id="icons">
            <span id="リストアイコン" class="icon"></span>
            <span class="icon-separate"></span>
            <span id="レス更新アイコン" class="icon" title="レスを取得"></span>
            <span id="中止アイコン" class="icon" title="レス受信中止"></span>
            <span class="icon-separate"></span>
            <span id="レス投稿アイコン" class="icon" title="レス書き込み"></span>
            <span id="お気に入りアイコン" class="icon"></span>
            <span class="icon-separate"></span>
            <span id="ごみ箱アイコン" class="icon" title="ログ削除"></span>
            <span id="タブ閉じるアイコン" class="icon" title="タブを閉じる"></span>
          </div>
        </div>
        <style>
        #wrap{
            background-color: #f0f0f0;
            margin: 0;
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-top: 1px solid #c0c0c0;
            box-shadow: 0 1px 0 0 #fff inset;
        }
        #bbs{
            margin-left: 14px;
        }
        #bbs a{
            color: #000;
            text-decoration: none;
        }
        #icons{
            display: flex;
            align-items: center;
            padding-top: 1px;
        }
        #リストアイコン{
            background-image: url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQBAMAAADt3eJSAAAAElBMVEUAAAD///+EhIQAAADG3sZSWlK9Ut21AAAAAXRSTlMAQObYZgAAAD1JREFUCNdjQAAlMAAyFAWBQAjGEAYxVJSUnIRRRVSclFBFgEpU0EWU0EVcVEKDoSIhzjCGAZChbAwEDAwApasK+zo+x0wAAAAASUVORK5CYII=');
        }
        #レス更新アイコン{
            background-image: url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQBAMAAADt3eJSAAAAElBMVEUAAAD/GACEAADWAAAAAAD/WlLW5g+1AAAAAXRSTlMAQObYZgAAAD9JREFUCNdjQAJKQKAAYigKCgqSymBRAjGUVBgYnA2BDGMHoJBxoGCwCUiNs6koSAAkBBIAC4EEwEImMPtBAgBdxwlHhjWoKgAAAABJRU5ErkJggg==');
        }
        #中止アイコン{
            background-image: url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQBAMAAADt3eJSAAAAIVBMVEUAAACEAAD/AADWAACtAAD///8AAAClpaVSAAD/WlL/nK0BYpsaAAAAAXRSTlMAQObYZgAAAIZJREFUCNdjYGBgFBQUYADRwkpKhiCWsNLMmUqGQAEjJc1JSsoCDIxK5UpAJACUCS1SDwXKCRuphpcGGQMZxsZLo4yBjBZn49JwY2MPhhYX99DQEhcPhkaX0hDXcBcJBjbBUBeXUMcEBrZGERcXR4kEBoYMQSBoA9rFligoKAYUALLS0oA0ANegGhWasO0CAAAAAElFTkSuQmCC');
        }
        #レス投稿アイコン{
            background-image: url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQBAMAAADt3eJSAAAAHlBMVEUAAAD/vQBSOQAAAAB7WgD/3q3WnFJ7e1KAgIBSWlLnpR9xAAAAAXRSTlMAQObYZgAAAGFJREFUCNdjAAEmJQUGMHBKSwLTLEHJZmAh16Bky2SQQGij2kwQwzVCUCgtGSwgKKikDBYQFHIxgAioODMwlEAFGIqgAgyliiABECMIIsBgma4EFmCYbF6uDLbR2NgYLAAAk/AUIWxYH70AAAAASUVORK5CYII=');
        }
        #お気に入りアイコン{
            background-image: url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQBAMAAADt3eJSAAAAFVBMVEUAAAD/vQAAAAAAAITWnFL//wB7WgBge4O/AAAAAXRSTlMAQObYZgAAAEdJREFUCNdjQAAWFxcIwzU01AEsECgoGOLi4sDAJigoKBoaGgZkgIEQmGEIZRgaGkIYwsZgESANZMFEEGoQuhDmMClBANwRAHcUC4t31YHOAAAAAElFTkSuQmCC');
        }
        #ごみ箱アイコン{
            background-image: url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQBAMAAADt3eJSAAAAFVBMVEUAAAClpaUAAABSWlLG3sb///f////hVKakAAAAAXRSTlMAQObYZgAAAElJREFUCNdjAAIlJQYIFWwIYjIJgoCwAgOTS2iIo6AxkGEMAkAGg0qoi6CwEQOQIQiUATNEHQMNyWEkmoAYioKCEHOMlIBAmQEAhE4QrWeW2SgAAAAASUVORK5CYII=');
        }
        #タブ閉じるアイコン{
            background-image: url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQAgMAAABinRfyAAAACVBMVEUAAAAAAAD///+D3c/SAAAAAXRSTlMAQObYZgAAAEpJREFUCNcdxLENwCAMAMEHBSl0adynIXMwggsLuWQUlkDKuLFyxfE74ELAaD05VcskmyzYA2geFY3EorEheeuUWRVZ2Xjg5YT7A0oLCUNeetUUAAAAAElFTkSuQmCC');
        }
        .icon{
            padding: 2px 3px;
            margin: 0 1px;
            border: solid 1px #f0f0f0;
            width: 20px;
            height: 20px;
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
        </style>
        `
    }
}



class KatjushaTab extends HTMLElement{

    constructor(){
        super()
        benry(this)
        this.openNew()
    }


    $_click(event) {
        if (event.target.tagName === 'LI' && event.target !== this.selected) {
            this.select(event.target)
        }
    }


    $_dblclick(event) {
        $headline.$レス更新アイコン.click()
    }


    $_contextmenu(event) {
        event.preventDefault()
        event.stopPropagation()

        if (event.target.tagName !== 'LI') {
            return
        }

        const context = `
            <ul class="menu context-tab">
              <li><a onclick="$tab.close('${event.target.url}')">閉じる</a></li>
              <li><a onclick="$tab.closeAll('${event.target.url}')">このタブ以外全て閉じる</a></li>
              <li><a onclick="toClipboard('${event.target.url}')">URLをコピー</a></li>
              <li><a onclick="toClipboard('${event.target.innerHTML}\\n${event.target.url}\\n')">タイトルとURLをコピー</a></li>
            </ul>
        `
        new KatjushaContext(context, event.pageX, event.pageY).show()
    }



    open(url, thread = {}){
        if (!this.$tab.childElementCount) {
            return this.openNew(url, thread)
        }

        let tab = this.search(url)

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
        const tab = this.search(url)

        if (this.$tab.childElementCount === 1 && !this.$tab.firstElementChild.url) {
            return this.open(url, thread)
        }
        if (tab) {
            return this.select(tab)
        }

        return this.select( this.newtab(url, thread.subejct, thread.html) )
    }



    close(tab) {
        if(typeof tab == 'string'){
            tab = this.search(tab)
        }

        if (!tab || !tab.url) {
            return
        }

        this.select(tab.previousElementSibling || tab.nextElementSibling || this.openNew())

        tab.el.remove()
        tab.remove()
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
        $thread.$.append(thread)

        return tab
    }


    search(url) {
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


    loadStart(url) {
        this.search(url)?.setAttribute('loading', true)
    }


    loadEnd(url) {
        this.search(url)?.removeAttribute('loading')
    }


    get html(){
        return `
        <ul id="tab"></ul>
        <style>
        ul{
            list-style: none;
            cursor: default;
            display: flex;
            align-items: flex-end;
            background-color: #f0f0f0;
            margin: 0;
            padding-left: 10px;
            border-bottom: 1px solid #c0c0c0;
        }
        li{
            text-align: left;
            border-top: 1px solid #e3e3e3;
            border-left: 1px solid #e3e3e3;
            border-right: 1px solid #e3e3e3;
            background-color: #f0f0f0;
            color: #909090;
            background: linear-gradient(to top, #ececec 50%, #e9e9e9 100%);
            border-top-left-radius: 3px;
            border-top-right-radius: 3px;
            width: 100px;
            margin: 0 -5px;
            padding-left: 10px;
            height: 20px;
            white-space: nowrap;
            overflow: hidden;
            line-height: 20px;
            box-shadow: 1px 0 1px rgba(0, 0, 0, 0.4), inset 1px 1px 0 #fff;
        }
        [selected]{
            color: #000;
            z-index: 2;
            height: 22px;
            line-height: 22px;
        }
        [selected]::before{
            box-shadow: 2px 2px 0 #fff;
        }
        [selected]::after{
            box-shadow: -2px 2px 0 #fff;
        }
        [loading]{
            background-image: url('data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiIHN0YW5kYWxvbmU9Im5vIj8+PHN2ZyB4bWxuczpzdmc9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB2ZXJzaW9uPSIxLjAiIHdpZHRoPSI2NHB4IiBoZWlnaHQ9IjY0cHgiIHZpZXdCb3g9IjAgMCAxMjggMTI4IiB4bWw6c3BhY2U9InByZXNlcnZlIj48Zz48bGluZWFyR3JhZGllbnQgaWQ9ImxpbmVhci1ncmFkaWVudCI+PHN0b3Agb2Zmc2V0PSIwJSIgc3RvcC1jb2xvcj0iI2ZmZmZmZiIgZmlsbC1vcGFjaXR5PSIwIi8+PHN0b3Agb2Zmc2V0PSIxMDAlIiBzdG9wLWNvbG9yPSIjMTA4NmU2IiBmaWxsLW9wYWNpdHk9IjEiLz48L2xpbmVhckdyYWRpZW50PjxwYXRoIGQ9Ik02My44NSAwQTYzLjg1IDYzLjg1IDAgMSAxIDAgNjMuODUgNjMuODUgNjMuODUgMCAwIDEgNjMuODUgMHptLjY1IDE5LjVhNDQgNDQgMCAxIDEtNDQgNDQgNDQgNDQgMCAwIDEgNDQtNDR6IiBmaWxsPSJ1cmwoI2xpbmVhci1ncmFkaWVudCkiIGZpbGwtcnVsZT0iZXZlbm9kZCIvPjxhbmltYXRlVHJhbnNmb3JtIGF0dHJpYnV0ZU5hbWU9InRyYW5zZm9ybSIgdHlwZT0icm90YXRlIiBmcm9tPSIwIDY0IDY0IiB0bz0iMzYwIDY0IDY0IiBkdXI9IjEwODBtcyIgcmVwZWF0Q291bnQ9ImluZGVmaW5pdGUiPjwvYW5pbWF0ZVRyYW5zZm9ybT48L2c+PC9zdmc+');
            background-repeat: no-repeat;
            background-size: 12px;
            background-position: 4px center;
        }
        </style>
        `
    }
}



class KatjushaThread extends HTMLElement{

    constructor(){
        super()
        benry(this)
        this.onscroll = this.scroll
    }


    $_click(event) {
        if (event.target.tagName !== 'I') {
            return
        }

        event.stopPropagation()

        const context = `
          <ul class="menu">
            <li><a onclick="$thread.responseTo(${event.target.textContent})">これにレス</a></li>
          </ul>
        `

        new KatjushaContext(context, event.pageX, event.pageY).show()
    }


    scroll(event) {
        const url = this.selected.url

        if (スレッド[url]) {
            スレッド[url].scroll = this.scrollTop
        }
    }


    active(el){
        this.selected?.removeAttribute('selected')
        this.selected = el
        el.setAttribute('selected', true)
    }


    appendHTML(html, url, title) {
        const tab         = $tab.search(url) || $tab.selected
        tab.innerHTML     = title
        tab.el.innerHTML += html

        $headline.render(url)
    }


    clear(url) {
        const el = Array.from(this.children).find(v => v.url === url)

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

        if (!el) {
            return
        }

        const {left, width, top} = event.target.getBoundingClientRect()
        const x = left + width / 2
        const y = innerHeight - top + 6

        new KatjushaPopup(el.outerHTML, x, y).show()
    }


    parse(text, no = 0) {
        const dat  = text.trim().split('\n')
        let broken = false
        let html   = ''

        for (const v of dat) {
            no++
            let [from, mail, date, message, subject] = v.split('<>')

            if (subject === undefined) {
                from = mail = date = message = subject = 'ここ壊れてます'
                broken = true
            }

            //datファイルにaタグが含まれる場合: message = message.replace(/<a (.+?)>(.+?)<\/a>/g, '$2')
            message = message.replace(/&gt;&gt;([1-9]\d{0,3})/g, '<span class="anker" onclick="$thread.goto($1)" onmouseenter="$thread.popup(event, $1)" onmouseleave="$popup.remove()">&gt;&gt;$1</span>')
            message = message.replace(/(https?:\/\/[^\s<]+)/g, '<a href="$1" target="_blank">$1</a>')
            message = message.replace(/^ /, '')

            html += `
              <article class="レス" data-no="${no}">
                <header><i>${no}</i><span class="from"><b>${from}</b></span><time>${date}</time><address>${mail}</address></header>
                <p>${message}</p>
              </article>
            `
        }

        return {html, num:dat.length, subject:dat[0].split('<>').pop(), broken}
    }


    get html(){
        return `
        <style>
        :host{
            font-size: 18px;
            user-select: text;
            cursor: auto;
            overflow-y: scroll;
            padding: 2px 12px 24px 6px;
            word-break: break-all;
            line-height: 1.15;
        }
        .スレッド{
            display: none;
        }
        .スレッド[selected]{
            display: block;
        }

        .レス{
            margin: 20px 8px;
        }
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
        </style>
        `
    }
}



class KatjushaStatus extends HTMLElement{

    constructor(){
        super()
        benry(this)
    }


    get html(){
        return `
        <slot></slot>
        <style>
        :host{
            border-top: 1px solid #c0c0c0;
            box-shadow: 0 1px 0 0 #fff inset;
            background-color: #f0f0f0;
            line-height: 18px;
            font-family: 'Meiryo', sans-serif;
            padding-left: 4px;
        }
        </style>
        `
    }
}



class KatjushaForm extends HTMLElement{

    constructor(){
        super()
        benry(this)
        this.id = '$form'
    }


    open(url){
        if(!url || window['$form']){
            return
        }

        $body.append(this)
        this.centering()

        if( url.includes('read.cgi') ){
            const thread = スレッド[url]
            const [,bbshome, bbskey] = thread.bbsurl.match(/(.+\/)([^\/]+)\/$/)

            this.$form.action = `${bbshome}test/bbs.cgi`
            this.$bbs.value = bbskey
            this.$key.value = thread.key
            this.$subject.value = thread.subject
            this.$subject.disabled = true
            this.$title.textContent = `「${thread.subject}」にレス`
            this.$message.focus()
        }
        else{
            const [,bbshome, bbskey] = url.match(/(.+\/)([^\/]+)\/$/)

            this.$form.action = `${bbshome}test/bbs.cgi`
            this.$bbs.value = bbskey
            this.$title.textContent = `『${$bbs.name(url)}』に新規スレッド`
            this.$subject.focus()
        }
    }


    centering(){
        const {width, height} = this.getBoundingClientRect()
        this.style.left = `${innerWidth/2 - width/2}px`
        this.style.top  = `${innerHeight/2 - height/2}px`
    }


    insert(text){
        const cursor = this.$message.selectionStart
        const before = this.$message.value.substr(0, cursor)
        const after  = this.$message.value.substr(cursor, this.$message.value.length)

        this.$message.value = before + text + after
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
        this.$mail.readOnly = this.checked
        this.$mail.value    = this.checked ? 'sage' : ''
    }


    $header_mousedown(event) {
        dndwindow(this, event.pageX, event.pageY)
    }


    $form_submit(event) {
        event.preventDefault()
        this.$submit.disabled = true
        ajax(this.$form.action, new FormData(this.$form)).then(response => ajax.form(response))
    }



    get html(){
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
        <style>
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
        </style>
        `
    }
}



class KatjushaContext extends HTMLElement{

    constructor(html, x, y){
        super()
        this.content    = html
        this.style.left = `${x}px`
        this.style.top  = `${y}px`
        this.id         = '$context'

        window.$context?.remove()
        document.addEventListener('click', () => this.remove(), {once:true})
        benry(this)
    }


    show(){
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


    get html(){
        return `
        ${this.content}
        <style>
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
        </style>`
    }
}



class KatjushaPopup extends HTMLElement{

    constructor(html, x, y){
        super()
        this.content      = html
        this.style.left   = `${x}px`
        this.style.bottom = `${y}px`
        this.id           = '$popup'

        benry(this)
    }


    show(){
        $body.append(this)
    }


    get html(){
        return `
        ${this.content}
        <style>
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
        </style>
        `
    }
}



async function ajax(url, formdata) {
    const abort   = new AbortController()
    const request = {cache:'no-store', mode:'cors', signal:abort.signal}

    if (url.includes('bbs.cgi')) {
        request.url    = url
        request.method = 'POST'
        request.body   = formdata

        const bbsurl = url.replace('test/bbs.cgi', `${formdata.get('bbs')}/`)
        url          = formdata.has('key') ? スレッドURL作成(bbsurl, formdata.get('key')) : bbsurl
    }
    else if (url.includes('read.cgi')) {
        request.url = datURL作成(url)

        if (スレッド[url]) {
            request.headers = {
                'Range'        : `bytes=${スレッド[url].byte || 0}-`,
                'If-None-Match': スレッド[url].etag
            }
        }
    }
    else {
        request.url = `${url}subject.txt`
    }


    try {
        $status.textContent = `${new URL(url).hostname}に接続しています`
        $toolbar.$anime.dataset.ajax++
        $tab.loadStart(url)
        ajax.abort.add(abort)
        var response = await fetch(request.url, request)
    }
    catch (error) { // DNSエラー・CORSエラー・Abortの時のみ来る。404の時は来ない。
        if(error.name !== 'AbortError'){
            request.error = `${new URL(url).hostname}に接続できませんでした`
        }
        return error // finally後にreturnされる。(responseはundefined)
    }
    finally {
        $status.textContent = request.error || ''
        $toolbar.$anime.dataset.ajax--
        $tab.loadEnd(url)
        ajax.abort.delete(abort)
    }

    const buffer = await response.arrayBuffer()

    response.URL     = url
    response.byte    = buffer.byteLength
    response.content = new TextDecoder('shift-jis').decode(buffer)

    return response
}


ajax.abort = new Set


ajax.subject = function(response){

    if(response.status === 200){
        $subject.bbsurl = response.URL
        $subject.$tbody.innerHTML = $subject.render($subject.parse(response.content), response.URL)

        $title.textContent = `${$base.title} [ ${$bbs.name(response.URL)} ]`
        $bbs.active(response.URL)

        $subject.scrollTop = 0
        $status.textContent = `${$subject.$tbody.rows.length}件のスレッドを受信 (${date()})`
    }
    else{
        $subject.$tbody.textContent = ''
        return
    }

    history.replaceState(null, null, response.URL)
}


ajax.thread = function(response){

    if (response.status === 200) {
        const thread        = スレッド[response.URL] = {}
        const dat           = $thread.parse(response.content)
        const {bbsurl, key} = スレッドURL分解(response.URL)

        thread.bbsurl  = bbsurl
        thread.bbsname = $bbs.name(bbsurl)
        thread.key     = key
        thread.url     = response.URL
        thread.scroll  = 0
        thread.subject = dat.subject
        thread.html    = dat.html
        thread.num     = dat.num
        thread.byte    = response.byte
        thread.etag    = String(response.headers.get('ETag')).replace('W/', '').replace('-gzip', '')

        thread.既得    = dat.num
        thread.新着    = dat.num
        thread.最終取得= date()

        $thread.clear(thread.url)
        $thread.appendHTML(thread.html, thread.url, thread.subject)
        $subject.update(thread)
        $status.textContent = `${dat.num}のレスを受信 (${date()}) ${KB(thread.byte)}`
    }
    else if (response.status === 206) {
        const thread = スレッド[response.URL]
        const dat    = $thread.parse(response.content, thread.num)

        thread.html   += dat.html
        thread.num    += dat.num
        thread.byte   += response.byte || 0
        thread.etag    = String(response.headers.get('ETag')).replace('W/', '').replace('-gzip', '')

        thread.既得    = thread.num
        thread.新着    = dat.num
        thread.最終取得= date()

        $thread.appendHTML(dat.html, thread.url, thread.subject)
        $subject.update(thread)
        $status.textContent = `${dat.num}のレスを受信 (${date()}) ${KB(thread.byte)}`
    }
    else if (response.status === 304) {
        const thread = スレッド[response.URL]
        thread.新着 = 0
        $subject.update(thread)
        $status.textContent = `新着なし (${date()}) ${KB(thread.byte)}`
    }
    else if (response.status === 404) {
        $status.textContent = `スレッドが見つかりません (${date()})`
    }
    else{
        return
    }

    history.replaceState(null, null, response.URL)
}


ajax.form = function(response){
    if(response.status === 200){
        if (response.content.includes('<title>ＥＲＲＯＲ！')) {
            if(window['$form']){
                $form.$submit.disabled = false
            }
            alert( response.content.match(/<b>(.+?)</i)[1] )
            return
        }
        if (response.URL.includes('read.cgi')) {
            スレッド[response.URL].最終書き込み = date()
        }

        window['$form']?.remove()
        $katjusha.link(response.URL)
    }
    else{
        if(window['$form']){
            $form.$submit.disabled = false
        }
        alert('エラーが発生して投稿できませんでした')
    }
}



function benry(self, attr = []){ // https://qiita.com/economist/items/6c923c255f6b4b7bbf84
    self.$ = self.attachShadow({mode:'open'})
    self.$.innerHTML = self.html || ''

    for(const el of self.$.querySelectorAll('[id]')){
        self[`$${el.id}`] = el
    }

    for(const name of Object.getOwnPropertyNames(self.constructor.prototype)){
        if(typeof self[name] !== 'function'){
            continue
        }
        self[name]  = self[name].bind(self)
        const match = name.match(/^(\$.*?)_([^_]+)$/)
        if(match && self[match[1]]){
            self[match[1]].addEventListener(match[2], self[name])
        }
    }

    for(const name of attr){
        self[name] = self.getAttribute(name)
    }
}


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


function スレッドURL作成(bbsurl, key) {
    return bbsurl.replace(/([^\/]+)\/$/, `test/read.cgi/$1/${key}/`)
}


function スレッドURL分解(url) {
    const [,bbs,key] = url.match(/([^\/]+)\/([^\/]+)\/$/)
    const bbsurl = url.replace(/\/test\/.+/, `/${bbs}/`)

    return {bbsurl, bbs, key}
}


function datURL作成(url){
    const {bbsurl, key} = スレッドURL分解(url)
    return `${bbsurl}dat/${key}.dat`
}


function dndwindow(el, pageX, pageY) {
    const {left, top, width, height} = el.getBoundingClientRect()

    const startX = left - pageX
    const startY = top  - pageY
    const limitX = innerWidth  - width
    const limitY = innerHeight - height

    document.addEventListener('mousemove', move)
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
