
板一覧.onclick = function(event){
    event.preventDefault()
    if(event.target.tagName !== 'A'){
        return
    }
    
    const selected = document.querySelector("#板一覧 [data-selected]");
    if(selected){
        delete selected.dataset.selected
    }
    event.target.dataset.selected = 'selected'

    const dir  = event.target.href.split('/')
    const 板名 = dir[dir.length-2]
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
    投稿フォーム.limitX = innerWidth  - form.width - 1
    投稿フォーム.limitY = innerHeight - form.height - 1

    document.addEventListener('mousemove', 投稿フォーム_ヘッダ.mousemove, {passive:true})
    document.addEventListener('mouseup'  , 投稿フォーム_ヘッダ.mouseup, {once:true})
}



投稿フォーム_ヘッダ.mousemove = function (event){
    投稿フォーム.style.left = minmax(0, 投稿フォーム.startX + event.pageX, 投稿フォーム.limitX) + 'px'
    投稿フォーム.style.top  = minmax(0, 投稿フォーム.startY + event.pageY, 投稿フォーム.limitY) + 'px'
}



投稿フォーム_ヘッダ.mouseup = function (event){
    document.removeEventListener('mousemove', 投稿フォーム_ヘッダ.mousemove)
}


function minmax(min, val, max){
    if(val < min){
        return min
    }
    else if(val > max){
        return max
    }
    else{
        return val
    }
}

