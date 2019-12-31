<?php

$password = '#default';
/*

トリップ
管理者
二重書き込み
>>11
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

$is_thread = $key ? false : true;
$bbs_path  = sprintf('%s/../%s', __DIR__, $bbs);


if($mail === $password){
    include './maintenance.php';

    if(is_callable($from)){
        error($from($bbs_path, $message, $key));
    }
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
    error('スレが存在しないかDAT落ちです');
}

if($is_thread and !$subject){
    error('タイトルを入力してください');
}
if($is_thread and strlen($subject) > 96){
    error('タイトルが長すぎます');
}

if(strlen($from) > 32){
    error('名前が長すぎます');
}

if(strlen($mail) > 64){
    error('メールが長すぎます');
}

if(!$message){
    error('本文を入力してください');
}
if(strlen($message) > 800){
    error('本文が長すぎます');
}



$from    = $from !== '' ? html_escape($from) : '名無しさん';
$mail    = replace_mail($mail);
$message = html_escape($message, '<br>');


if($is_thread){
    $subject = html_escape($subject);
    $key     = $_SERVER['REQUEST_TIME'];
    thread($bbs_path, $key, $from, $mail, $message, $subject) ? success($bbs, $key) : error('スレッド書き込みエラー');
}
else{
    res($bbs_path, $key, $from, $mail, $message) ? success($bbs, $key) : error('レス書き込みエラー');
}





function thread($bbs_path, $key, $from, $mail, $message, $subject){
    $date    = create_date($key);
    $dat     = "$from<>$mail<>$date<> $message <>$subject\n";
    $dat     = mb_convert_encoding($dat, 'sjis', 'utf-8');
    $subject = mb_convert_encoding($subject, 'sjis', 'utf-8');

    return edit_file(get_subject_path($bbs_path), function($contents) use($bbs_path, $key, $dat, $subject){
        $dat_path = get_dat_path($bbs_path, $key);
        if(file_exists($dat_path)){
            error('再度スレを立ててください');
        }
        file_put_contents($dat_path, $dat, LOCK_EX);
        array_unshift($contents, "$key.dat<>$subject (1)\n");
        return $contents;
    });
}



function res($bbs_path, $key, $from, $mail, $message){
    $date = create_date($_SERVER['REQUEST_TIME']);
    $dat  = "$from<>$mail<>$date<> $message <>\n";
    $dat  = mb_convert_encoding($dat, 'sjis', 'utf-8');

    return edit_file(get_subject_path($bbs_path), function($contents) use($bbs_path, $key, $dat){
        $num = 0;
        foreach($contents as $i => $v){
            if(strpos($v, "$key.") === 0){
                preg_match('/(\d+)\)$/', $v, $m);
                $num = $m[1];
                break;
            }
        }
        if(!$num){
            error('このスレッドは存在しません');
        }
        if($num >= 1000){
            error('このスレッドにはこれ以上書き込めません');
        }

        file_put_contents(get_dat_path($bbs_path, $key), $dat, LOCK_EX|FILE_APPEND); //重複チェックが

        $num++;
        $line = preg_replace('/\d+\)$/', "$num)", $v);
        array_splice($contents, $i, 1);
	    array_unshift($contents, $line);

        return $contents;
    });
}



function success($bbs, $key){
    header('Cache-Control: no-cache');
    header('Content-type: text/html; charset=shift_jis');

    $html  = "<html><!-- 2ch_X:true --><head><title>書きこみました。</title><meta http-equiv='refresh' content='1;URL=read.cgi/$bbs/$key/'></head>";
    $html .= "<body>書きこみが終わりました。<br><br><a href='read.cgi/$bbs/$key/'>画面を切り替える</a>までしばらくお待ち下さい。</body></html>";

    print mb_convert_encoding($html, 'sjis', 'utf-8');
	exit;
}



function error($str){
	header('Cache-Control: no-cache');
	header('Content-Type: text/html; charset=shift_jis');

    $html  = "<html><!-- 2ch_X:error --><head><title>ＥＲＲＯＲ！</title></head>";
    $html .= "<body><b>ＥＲＲＯＲ：$str</b><br><a href='javascript:history.back()'>戻る</a></body></html>";

    print mb_convert_encoding($html, 'sjis', 'utf-8');
    exit;
}



function get_subject_path($bbs_path){
    return "$bbs_path/subject.txt";
}



function get_dat_path($bbs_path, $key){
    return "$bbs_path/dat/$key.dat";
}



function get_kako_path($bbs_path, $key){ //仕様未決定
    return sprintf('%s/kako/%s/%s/', $bbs_path, substr($key,0,4), substr($key,0,5));
}



function create_date($time){
	$week = ['日','月','火','水','木','金','土'][date('w', $time)];
	return date("Y/m/d($week) H:i:s", $time);
}



function replace_mail($mail){
    $mail = preg_replace('/#.*/', '', $mail);
    $mail = html_escape($mail);
    return $mail;
}



function html_escape($str, $br = ''){
    $str = str_replace('<', '&lt;', $str);
    $str = str_replace('>', '&gt;', $str);
    $str = str_replace('"', '&quot;', $str);
    $str = str_replace("'", '&apos;', $str);
    $str = str_replace("\r", '', $str);
    $str = str_replace("\n", $br, $str);

	return $str;
}



function edit_file(string $file, callable $fn, ...$args){
    $fp = fopen($file, 'cb+');
    if(!$fp){
        return false;
    }
    flock($fp, LOCK_EX);

    $contents = [];
    while(($line = fgets($fp)) !== false){
        $contents[] = $line;
    }

    $contents = $fn($contents, ...$args);

    if(is_array($contents)){
        $contents = implode('', $contents);
        ftruncate($fp, 0);
        rewind($fp);
        fwrite($fp, $contents);
        fflush($fp);
        flock($fp, LOCK_UN);
        fclose($fp);
        return true;
    }
    else{
        flock($fp, LOCK_UN);
        fclose($fp);
        return false;
    }
}


function raw_post(){
    $post  = [];
    foreach(explode('&', file_get_contents('php://input')) as $kv){
        [$key, $value] = explode('=', $kv);
        $post[$key]    = urldecode($value);
    }
    return $post;
}
