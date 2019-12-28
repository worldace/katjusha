<?php

/*

トリップ
管理者
管理モード
二重書き込み
>>11

*/


if(!$_POST){
    $_POST = raw_post();
}


$submit = $_POST['submit'] ?? '';

if($submit !== '書き込む'){
    mb_convert_variables('utf-8', 'sjis', $_POST);
}


$bbs     = $_POST['bbs'] ?? '';
$key     = $_POST['key'] ?? '';
$from    = $_POST['FROM'] ?? '';
$mail    = $_POST['mail'] ?? '';
$subject = $_POST['subject'] ?? '';
$message = $_POST['MESSAGE'] ?? '';

$is_thread = $key ? false : true;

if($is_thread){
    $key = $_SERVER['REQUEST_TIME'];
}

$bbs_path     = sprintf('%s/../%s', __DIR__, $bbs);
$subject_path = sprintf('%s/subject.txt', $bbs_path);
$dat_path     = sprintf('%s/dat/%s.dat', $bbs_path, $key);
$kako_path    = sprintf('%s/kako/%s/%s/%s.dat', $bbs_path, substr($key,0,4), substr($key,0,5), $key);



if(!$bbs){
    error('bbsが存在しません');
}
if(strpos($bbs, '/') !== false){
    error('bbsが不正です');
}
if(!file_exists($subject_path)){
    error('板が存在しません');
}

if(!$is_thread and preg_match('/[^\d]/', $key)){
    error('keyが不正です');
}
if(!$is_thread and !file_exists($dat_path)){
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
$mail    = html_escape($mail);
$message = html_escape($message, '<br>');
$subject = $is_thread ? html_escape($subject) : '';

$date = create_date();
$dat  = "$from<>$mail<>$date<> $message <>$subject\n";
$dat  = mb_convert_encoding($dat, 'sjis', 'utf-8');



if($is_thread){
    edit_file($subject_path, function($subjects) use($dat_path, $dat, $key, $subject){
        if(file_exists($dat_path)){
            error('再度スレッドを立ててください');
        }
        file_put_contents($dat_path, $dat, LOCK_EX);

        $subject = mb_convert_encoding($subject, 'sjis', 'utf-8');
        array_unshift($subjects, "$key.dat<>$subject (1)\n");
        return $subjects;
    });
}
else{
    edit_file($subject_path, function($subjects) use($dat_path, $dat, $key){
        $num = 0;
        foreach($subjects as $i => $v){
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

        file_put_contents($dat_path, $dat, LOCK_EX|FILE_APPEND);//重複チェックが

        $num++;
        $line = preg_replace('/\d+\)$/', "$num)", $v);

        array_splice($subjects, $i, 1);
	    array_unshift($subjects, $line);

        return $subjects;
    });
}


success($bbs, $key, $from, $mail);





function success($bbs, $key, $from, $mail){
    setcookie('FROM', $from, $_SERVER['REQUEST_TIME']+60*60*24*180, '/');
    setcookie('mail', $mail, $_SERVER['REQUEST_TIME']+60*60*24*180, '/');

    header('Cache-Control: no-cache');
    header('Content-type: text/html; charset=shift_jis');

    $html = <<<END
    <html><!-- 2ch_X:true -->
    <head>
      <title>書きこみました。</title>
      <meta http-equiv="refresh" content="1;URL=read.cgi/$bbs/$key/">
    </head>
    <body>
      書きこみが終わりました。<br><br>
      <a href="read.cgi/$bbs/$key/">画面を切り替える</a>までしばらくお待ち下さい。
    </body>
    </html>
    END;

    print mb_convert_encoding($html, 'sjis', 'utf-8');
	exit;
}



function error($str){
	header('Cache-Control: no-cache');
	header('Content-Type: text/html; charset=shift_jis');

    $html = <<<END
    <html><!-- 2ch_X:error -->
    <head>
      <title>ＥＲＲＯＲ！</title>
    </head>
    <body>
      <b>ＥＲＲＯＲ：$str</b><br>
      <a href="javascript:history.back()">戻る</a>
    </body>
    </html>
    END;

    print mb_convert_encoding($html, 'sjis', 'utf-8');
    exit;
}



function create_date(){
	$week = ['日','月','火','水','木','金','土'][date('w', $_SERVER['REQUEST_TIME'])];
	return date("Y/m/d($week) H:i:s", $_SERVER['REQUEST_TIME']);
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
    $post = [];
    foreach(explode('&', file_get_contents('php://input')) as $kv){
        [$key, $value] = explode('=', $kv);
        $post[$key]    = urldecode($value);
    }
    return $post;
}
