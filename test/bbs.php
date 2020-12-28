<?php
/*
二重書き込み
*/

require_once './lib.php';

start();



if(ADMIN and method_exists('maintenance', FROM)){
    error(maintenance::{FROM}(PATH, MESSAGE, KEY));
}


if(!BBS){
    error('bbsが存在しません');
}
if(preg_match('/[\W]/', BBS)){
    error('bbsが不正です');
}
if(!subject::exists(PATH)){
    error('板が存在しません');
}

if(!IS_THREAD and preg_match('/[\D]/', KEY)){
    error('keyが不正です');
}
if(!IS_THREAD and !thread::exists(PATH, KEY)){
    thread::is_kako(PATH, KEY) ? error('このスレは過去ログなので書き込めません') : error('このスレは存在しません');
}

if(IS_THREAD and !SUBJECT){
    error('タイトルを入力してください');
}
if(IS_THREAD and !is_utf8(SUBJECT)){
    error('文字コードが不正です');
}
if(IS_THREAD and strlen(SUBJECT) > 96){
    error('タイトルが長すぎます');
}

if(strlen(FROM) > 32){
    error('名前が長すぎます');
}
if(!is_utf8(FROM)){
    error('文字コードが不正です');
}

if(strlen(MAIL) > 64){
    error('メールが長すぎます');
}
if(!is_utf8(MAIL)){
    error('文字コードが不正です');
}

if(!MESSAGE){
    error('本文を入力してください');
}
if(strlen(MESSAGE) > 4096){
    error('本文が長すぎます');
}




if(IS_THREAD){
    $from    = res::from(FROM);
    $mail    = res::mail(MAIL);
    $message = res::message(MESSAGE);
    $subject = res::subject(SUBJECT);

    thread::create(PATH, KEY, $from, $mail, $message, $subject) ? success(BBS, KEY) : error('スレッド書き込みエラー');
}
else{
    $from    = res::from(FROM);
    $mail    = res::mail(MAIL);
    $message = res::message(MESSAGE);

    res::create(PATH, KEY, $from, $mail, $message) ? success(BBS, KEY) : error('レス書き込みエラー');
}
