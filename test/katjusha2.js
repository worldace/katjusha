const スレッド = {}
const 掲示板   = {}




$katjusha.start = function () {
    $katjusha.href = document.URL
    $base.title    = document.title
    //全板ボタン.textContent = `▽${base.title}`

    if ($katjusha.href !== $base.href) {
        $katjusha.click()
    }
}



$katjusha.onclick = function(event){
    const url = event.path[0].href

    if (!url) {/* || !掲示板.ホスト一覧.has( new URL(url).hostname ) */
        return
    }

    event.preventDefault()

    if ($bbs.has(url)) {
        $bbs.active(url)
        ajax(url)
    }
    else if (url.includes('read.cgi')) {
        event.target.target ? $tab.openNew(url, スレッド[url]) : $tab.open(url, スレッド[url])
        ajax(url)
    }
    else if (url === $base.href) {
        history.replaceState(null, null, url)
    }
}



class KatjushaBBS extends HTMLElement{
    constructor(){
        super()
        this.list = JSON.parse(this.firstChild.textContent)
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
        new KatjushaContext(context, event.pageX, event.pageY).print()
    }


    toHTML(list){
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
        
        this.selected = el
        this.$.querySelector('[selected]')?.removeAttribute('selected')
        el.setAttribute('selected', 'selected')
    }


    get html(){
        return `
        ${this.toHTML(this.list)}
        <style>
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
          <li><a onclick="$tab.openNew('${a.href}', スレッド[${a.href}]);ajax('${a.href}')">新しいタブで開く</a></li>
          <li><a onclick="toClipboard('${a.href}')">URLをコピー</a></li>
          <li><a onclick="toClipboard('${a.textContent}\\n${a.href}\\n')">タイトルとURLをコピー</a></li>
        </ul>
        ` // 新しいタブで開くバグってる
        new KatjushaContext(context, event.pageX, event.pageY).print()
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
        this.selected = el
        this.$.querySelector('[selected]')?.removeAttribute('selected')
        el.setAttribute('selected', 'selected')
    }



    受信後(response, bbsurl, text) {
        history.replaceState(null, null, bbsurl)

        if (response.status !== 200) {
            this.$tbody.textContent = ''
            return
        }

        this.$tbody.innerHTML = this.render(this.parse(text), bbsurl)
        this.$tbody.bbsurl    = bbsurl

        $title.textContent = `${$base.title} [ ${$bbs.name(bbsurl)} ]`
        $bbs.active(bbsurl)

        this.scrollTop = 0
        $status.textContent = `${this.$tbody.rows.length}件のスレッドを受信 (${date()})`
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
        new KatjushaContext(context, event.pageX, event.pageY).print()
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

        const newtab        = document.createElement('li')
        newtab.url          = url
        newtab.innerHTML    = thread.subject || ''

        newtab.el           = document.createElement('div')
        newtab.el.url       = url
        newtab.el.className = 'スレッド'
        newtab.el.innerHTML = thread.html || ''

        this.$tab.append(newtab)
        $thread.$.append(newtab.el)

        return this.select(newtab)
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


    search(url) {
        return Array.from(this.$tab.children).find(v => v.url === url)
    }



    select(tab) {
        this.selected = tab
        this.$tab.querySelector('[selected]')?.removeAttribute('selected')
        tab.setAttribute('selected', 'selected')

        $thread.active(tab.el)
        $headline.render(tab.url)
        history.replaceState(null, null, tab.url || $subject.bbsurl || $base.href)

        return tab
    }


    loadStart(url) {
        const tab = this.search(url)

        if (tab) {
            tab.dataset.loading = true
        }
    }


    loadEnd(url) {
        const tab = this.search(url)

        if (tab) {
            delete tab.dataset.loading
        }
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
        [data-loading]{
            background-image: url('data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiIHN0YW5kYWxvbmU9Im5vIj8+PHN2ZyB4bWxuczpzdmc9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB2ZXJzaW9uPSIxLjAiIHdpZHRoPSI2NHB4IiBoZWlnaHQ9IjY0cHgiIHZpZXdCb3g9IjAgMCAxMjggMTI4IiB4bWw6c3BhY2U9InByZXNlcnZlIj48Zz48bGluZWFyR3JhZGllbnQgaWQ9ImxpbmVhci1ncmFkaWVudCI+PHN0b3Agb2Zmc2V0PSIwJSIgc3RvcC1jb2xvcj0iI2ZmZmZmZiIgZmlsbC1vcGFjaXR5PSIwIi8+PHN0b3Agb2Zmc2V0PSIxMDAlIiBzdG9wLWNvbG9yPSIjMTA4NmU2IiBmaWxsLW9wYWNpdHk9IjEiLz48L2xpbmVhckdyYWRpZW50PjxwYXRoIGQ9Ik02My44NSAwQTYzLjg1IDYzLjg1IDAgMSAxIDAgNjMuODUgNjMuODUgNjMuODUgMCAwIDEgNjMuODUgMHptLjY1IDE5LjVhNDQgNDQgMCAxIDEtNDQgNDQgNDQgNDQgMCAwIDEgNDQtNDR6IiBmaWxsPSJ1cmwoI2xpbmVhci1ncmFkaWVudCkiIGZpbGwtcnVsZT0iZXZlbm9kZCIvPjxhbmltYXRlVHJhbnNmb3JtIGF0dHJpYnV0ZU5hbWU9InRyYW5zZm9ybSIgdHlwZT0icm90YXRlIiBmcm9tPSIwIDY0IDY0IiB0bz0iMzYwIDY0IDY0IiBkdXI9IjEwODBtcyIgcmVwZWF0Q291bnQ9ImluZGVmaW5pdGUiPjwvYW5pbWF0ZVRyYW5zZm9ybT48L2c+PC9zdmc+');
            background-repeat: no-repeat;
            background-size: 12px;
            background-position: 4px center;
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
        else {
            this.$thread.textContent = ''
            this.$bbs.textContent    = ''
            $title.textContent       = $base.title
        }
    }


    $_contextmenu (event) {
        event.preventDefault()
    }


    $レス更新アイコン_click(event) {
        if ($tab.selected.url) {
            $tab.select($tab.selected)
            ajax($tab.selected.url)
        }
    }


    $中止アイコン_click(event) {
        for(const v of ajax.abort){
            v.abort()
        }
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
            <li><a onclick="これにレス(${event.target.textContent})">これにレス</a></li>
          </ul>
        `

        new KatjushaContext(context, event.pageX, event.pageY).print()
    }


    scroll(event) {
        const url = this.selected.url

        if (スレッド[url]) {
            スレッド[url].scroll = this.scrollTop
        }
    }


    active(el){
        this.selected = el
        this.$.querySelector('[selected]')?.removeAttribute('selected')
        el.setAttribute('selected', 'selected')
    }


    追記(url, title, html) {
        const tab         = $tab.search(url) || $tab.selected
        tab.innerHTML     = title
        tab.el.innerHTML += html

        $headline.render(url)
    }


    クリア(url) {
        const el = Array.from(this.children).find(v => v.url === url)

        if(el){
            el.textContent = ''
        }
    }


    アンカー移動(n) {
        this.selected.children[n--]?.scrollIntoView()
    }


    これにレス(n) {
        //レス投稿アイコン.click()
        //insert_text(投稿フォーム_本文欄, `>>${n}\n`)
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
            message = message.replace(/&gt;&gt;([1-9]\d{0,3})/g, '<span class="anker" onclick="スレッド.アンカー移動($1)" onmouseenter="$popup.open($1)" onmouseleave="$popup.close()">&gt;&gt;$1</span>')
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


    受信後(response, url, text, byte) {
        history.replaceState(null, null, url)

        if (response.status === 200) {
            const thread        = スレッド[url] = {}
            const dat           = this.parse(text)
            const {bbsurl, key} = スレッドURL分解(url)

            thread.bbsurl  = bbsurl
            thread.bbsname = $bbs.name(bbsurl)
            thread.key     = key
            thread.url     = url
            thread.scroll  = 0
            thread.subject = dat.subject
            thread.html    = dat.html
            thread.num     = dat.num
            thread.byte    = byte
            thread.etag    = String(response.headers.get('ETag')).replace('W/', '').replace('-gzip', '')

            thread.既得    = dat.num
            thread.新着    = dat.num
            thread.最終取得= date()

            this.クリア(thread.url)
            this.追記(thread.url, thread.subject, thread.html)
            $subject.update(thread)
            $status.textContent = `${dat.num}のレスを受信 (${date()}) ${KB(thread.byte)}`
        }
        else if (response.status === 206) {
            const thread = スレッド[url]
            const dat    = this.parse(text, thread.num)

            thread.html   += dat.html
            thread.num    += dat.num
            thread.byte   += byte || 0
            thread.etag    = String(response.headers.get('ETag')).replace('W/', '').replace('-gzip', '')

            thread.既得    = thread.num
            thread.新着    = dat.num
            thread.最終取得= date()

            this.追記(thread.url, thread.subject, dat.html)
            $subject.update(thread)
            $status.textContent = `${dat.num}のレスを受信 (${date()}) ${KB(thread.byte)}`
        }
        else if (response.status === 304) {
            const thread = スレッド[url]
            thread.新着 = 0
            $subject.update(thread)
            $status.textContent = `新着なし (${date()}) ${KB(thread.byte)}`
        }
        else if (response.status === 404) {
            $status.textContent = `スレッドが見つかりません (${date()})`
        }
    }


    get html(){
        return `
        <style>
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


    print(){
        document.body.append(this)
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




async function ajax(url, formdata) {
    const abort   = new AbortController()
    ajax.abort  ??= new Set

    const request = {cache:'no-store', mode:'cors', signal:abort.signal}
    let   callback

    if (url.includes('bbs.cgi')) {
        request.url    = url
        request.method = 'POST'
        request.body   = formdata

        const bbsurl = url.replace('test/bbs.cgi', `${formdata.get('bbs')}/`)
        url          = formdata.has('key') ? スレッドURL作成(bbsurl, formdata.get('key')) : bbsurl
        //callback     = $form.受信後
    }
    else if (url.includes('read.cgi')) {
        request.url = datURL作成(url)
        callback    = $thread.受信後

        if (スレッド[url]) {
            request.headers = {
                'Range'        : `bytes=${スレッド[url].byte || 0}-`,
                'If-None-Match': スレッド[url].etag
            }
        }
    }
    else {
        request.url = `${url}subject.txt`
        callback    = $subject.受信後
    }


    try {
        $status.textContent = `${new URL(url).hostname}に接続しています`
        //$anime.dataset.ajax++
        $tab.loadStart(url)
        ajax.abort.add(abort)
        var response = await fetch(request.url, request)
    }
    catch (error) {
        if(error.name !== 'AbortError'){
            request.error = `${new URL(url).hostname}に接続できませんでした`
        }
        return
    }
    finally {
        $status.textContent = request.error || ''
        //$anime.dataset.ajax--
        $tab.loadEnd(url)
        ajax.abort.delete(abort)
    }

    const buffer = await response.arrayBuffer()
    const text   = new TextDecoder('shift-jis').decode(buffer)

    callback(response, url, text, buffer.byteLength)
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



customElements.define('katjusha-bbs', KatjushaBBS)
customElements.define('katjusha-subject', KatjushaSubject)
customElements.define('katjusha-headline', KatjushaHeadline)
customElements.define('katjusha-thread', KatjushaThread)
customElements.define('katjusha-tab', KatjushaTab)
customElements.define('katjusha-context', KatjushaContext)
