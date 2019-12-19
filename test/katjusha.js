
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
    投稿フォーム_本文欄.focus()
}


投稿フォーム_キャンセルボタン.onclick = function (event){
    delete katjusha.dataset.投稿フォーム
}


投稿フォーム_閉じるボタン.onclick = function (event){
    delete katjusha.dataset.投稿フォーム
}