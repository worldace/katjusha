
板一覧.onclick = function(event){
    event.preventDefault();
    if(event.target.tagName !== 'A'){
        return;
    }
    
    const selected = document.querySelector("#板一覧 [data-selected]");
    if(selected){
        delete selected.dataset.selected;
    }
    event.target.dataset.selected = 'selected';

    const dir  = event.target.href.split('/');
    const 板名 = dir[dir.length-2];
    console.dir(板名);
}