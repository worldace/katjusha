<?php
/*
二重書き込み
*/

include './lib.php';
request::init();



if(BBS_ADMIN and method_exists('maintenance', BBS_FROM)){
    error(['maintenance', BBS_FROM](BBS_PATH, BBS_MESSAGE, BBS_KEY));
}


if(!BBS_BBS){
    error('bbsが存在しません');
}
if(preg_match('/[\W]/', BBS_BBS)){
    error('bbsが不正です');
}
if(!subject::exists(BBS_PATH)){
    error('板が存在しません');
}

if(!BBS_IS_THREAD and preg_match('/[\D]/', BBS_KEY)){
    error('keyが不正です');
}
if(!BBS_IS_THREAD and !thread::exists(BBS_PATH, BBS_KEY)){
    thread::is_kako(BBS_PATH, BBS_KEY) ? error('このスレは過去ログなので書き込めません') : error('このスレは存在しません');
}

if(BBS_IS_THREAD and !BBS_SUBJECT){
    error('タイトルを入力してください');
}
if(BBS_IS_THREAD and !is_utf8(BBS_SUBJECT)){
    error('文字コードが不正です');
}
if(BBS_IS_THREAD and strlen(BBS_SUBJECT) > 96){
    error('タイトルが長すぎます');
}

if(strlen(BBS_FROM) > 32){
    error('名前が長すぎます');
}
if(!is_utf8(BBS_FROM)){
    error('文字コードが不正です');
}

if(strlen(BBS_MAIL) > 64){
    error('メールが長すぎます');
}
if(!is_utf8(BBS_MAIL)){
    error('文字コードが不正です');
}

if(!BBS_MESSAGE){
    error('本文を入力してください');
}
if(strlen(BBS_MESSAGE) > 4096){
    error('本文が長すぎます');
}



$from    = res::from(BBS_FROM);
$mail    = res::mail(BBS_MAIL);
$message = res::message(BBS_MESSAGE);

if(BBS_IS_THREAD){
    $subject = res::subject(BBS_SUBJECT);
    thread::create(BBS_PATH, BBS_KEY, $from, $mail, $message, $subject) ? success(BBS_BBS, BBS_KEY) : error('スレッド書き込みエラー');
}
else{
    res::create(BBS_PATH, BBS_KEY, $from, $mail, $message) ? success(BBS_BBS, BBS_KEY) : error('レス書き込みエラー');
}
