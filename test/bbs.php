<?php
include './fn.php';


$password = '#default';
/*
トリップ
管理者
二重書き込み
*/


if(!$_POST){
    $_POST = raw_post();
}
if($_POST['submit'] !== '書き込む'){
    mb_convert_variables('utf-8', 'sjis', $_POST);
}


$bbs     = $_POST['bbs'] ?? '';
$key     = $_POST['key'] ?? '';
$from    = $_POST['FROM'] ?? '';
$mail    = $_POST['mail'] ?? '';
$subject = $_POST['subject'] ?? '';
$message = $_POST['MESSAGE'] ?? '';

$is_thread = !$key;
$bbs_path  = sprintf('%s/../%s', __DIR__, $bbs);



if($mail === $password and in_array($from, ['削除','倉庫','復帰'])){
    error($from($bbs_path, $message, $key));
}


if(!$bbs){
    error('bbsが存在しません');
}
if(strpos($bbs, '/') !== false){
    error('bbsが不正です');
}
if(!file_exists(get_subject_path($bbs_path))){
    error('板が存在しません');
}

if(!$is_thread and preg_match('/[^\d]/', $key)){
    error('keyが不正です');
}
if(!$is_thread and !file_exists(get_dat_path($bbs_path, $key))){
    get_kako_path($bbs_path, $key) ? error('このスレは過去ログなので書き込めません') : error('このスレは存在しません');
}

if($is_thread and !$subject){
    error('タイトルを入力してください');
}
if($is_thread and !is_utf8($subject)){
    error('文字コードが不正です');
}
if($is_thread and strlen($subject) > 96){
    error('タイトルが長すぎます');
}

if(strlen($from) > 32){
    error('名前が長すぎます');
}
if(!is_utf8($from)){
    error('文字コードが不正です');
}

if(strlen($mail) > 64){
    error('メールが長すぎます');
}
if(!is_utf8($mail)){
    error('文字コードが不正です');
}

if(!$message){
    error('本文を入力してください');
}
if(strlen($message) > 4096){
    error('本文が長すぎます');
}



$from    = $from !== '' ? html_escape($from) : '名無しさん';
$mail    = replace_mail($mail);
$message = replace_message($message);


if($is_thread){
    $subject = html_escape($subject);
    $key     = $_SERVER['REQUEST_TIME'];
    thread($bbs_path, $key, $from, $mail, $message, $subject) ? success($bbs, $key) : error('スレッド書き込みエラー');
}
else{
    res($bbs_path, $key, $from, $mail, $message) ? success($bbs, $key) : error('レス書き込みエラー');
}
