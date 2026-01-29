<?php


$setting = setting_load();
$c       = (object)["isMonazilla" => str_contains($_SERVER['HTTP_USER_AGENT']??'', 'Monazilla')];

mb_substitute_character('entity');
if(!$_POST) parse_str(file_get_contents('php://input'), $_POST);
if($c->isMonazilla) mb_convert_variables('utf-8', 'sjis', $_POST);


$c->isRes   = preg_match("/\d/", $_POST['key'] ?? '');
$c->bbs     = post('bbs');
$c->key     = post('key') ?: $_SERVER['REQUEST_TIME'];
$c->from    = post('FROM');
$c->mail    = post('mail');
$c->subject = post('subject');
$c->message = post('MESSAGE');

$c->bbsDir      = __DIR__."/../$c->bbs";
$c->subjectFile = "$c->bbsDir/subject.txt";
$c->datFile     = "$c->bbsDir/dat/$c->key.dat";
$c->kakoFile    = "$c->bbsDir/kako/".substr($c->key,0,3)."/$c->key.dat";
$c->admin       = setting_admin($setting, $c->mail);


if($c->admin and is_callable("管理$c->from")){
    error("管理$c->from"($c));
}


if(!$c->isMonazilla and $_SERVER['HTTP_SEC_FETCH_SITE'] !== 'same-origin'){
    error('リファラが不正です');
}
if(!$c->bbs){
    error('bbsが存在しません');
}
if(preg_match('/[\W]/', $c->bbs)){
    error('bbsが不正です');
}
if(!file_exists($c->bbsDir)){
    error('板が存在しません');
}
if(preg_match('/[\D]/', $c->key)){
    error('keyが不正です');
}
if($c->isRes and !file_exists($c->datFile)){
    error('このスレは書き込めません');
}
if(strlen($c->from) > 32){
    error('名前が長すぎます');
}
if(!isUTF8($c->from)){
    error('文字コードが不正です');
}
if(strlen($c->mail) > 64){
    error('メールが長すぎます');
}
if(!isUTF8($c->mail)){
    error('文字コードが不正です');
}
if(!$c->message){
    error('本文を入力してください');
}
if(strlen($c->message) > 4096){
    error('本文が長すぎます');
}
if(!$c->isRes and !$c->subject){
    error('タイトルを入力してください');
}
if(!$c->isRes and !isUTF8($c->subject)){
    error('文字コードが不正です');
}
if(!$c->isRes and strlen($c->subject) > 96){
    error('タイトルが長すぎます');
}
if(!$c->isRes and file_exists($c->datFile)){
    error('再度スレを立ててください');
}


$c->from    = dat_from($c->from, $setting['nanashi'], $c->admin);
$c->mail    = dat_mail($c->mail);
$c->message = dat_message($c->message);
$c->subject = dat_subject($c->subject);


if($c->isRes){
    file_edit($c->subjectFile, 'res_save') ? ok($c->bbs, $c->key) : error('レス書き込みエラー');
}
else{
    file_edit($c->subjectFile, 'thread_save') ? ok($c->bbs, $c->key) : error('スレッド書き込みエラー');
}

exit;



function res_save($content){
    global $c;

    $line = subject_select($content, $c->key);
    if(!$line) error('このスレッドは存在しません');
    if($line->num >= 1000)  error('このスレッドにはこれ以上書き込めません');

    $date = dat_date();
    $dat  = mb_convert_encoding("$c->from<>$c->mail<>$date<> $c->message <>\n", 'sjis', 'utf-8');
    file_put_contents($c->datFile, $dat, LOCK_EX|FILE_APPEND);

    $line->num++;
    array_splice($content, $line->index, 1);
    array_unshift($content, "$c->key.dat<>$line->subject ($line->num)\n");

    return $content;
}

function res_delete($dat, $kako, $num){
    $file = file_exists($dat) ? $dat : $kako;

    file_edit($file, function($content) use($num){
        $content[$num-1] = mb_convert_encoding("あぼーん<>あぼーん<>あぼーん<>あぼーん<>\n", 'sjis', 'utf-8');
        return $content;
    });
}


function thread_save($content){
    global $c;

    $date = dat_date();
    $dat  = mb_convert_encoding("$c->from<>$c->mail<>$date<> $c->message <>$c->subject\n", 'sjis', 'utf-8');
    $txt  = mb_convert_encoding("$c->key.dat<>$c->subject (1)\n", 'sjis', 'utf-8');

    file_put_contents($c->datFile, $dat, LOCK_EX);
    array_unshift($content, $txt);

    return $content;
}

function thread_delete($bbsDir, $key){
    $datFile = "$bbsDir/dat/$key.dat";
    if(file_exists($datFile)){
        unlink($datFile);
        subject_delete($bbsDir, $key);
    }
    else{
        unlink("$bbsDir/kako/".substr($key,0,3)."/$key.dat");
    }
}

function thread_move($bbsDir, $key){
    $datFile  = "$bbsDir/dat/$key.dat";
    $kakoFile = "$bbsDir/kako/".substr($key,0,3)."/$key.dat";
    $kakoDir  = dirname($kakoFile);
    if(!is_dir($kakoDir)){
        mkdir($kakoDir, 0777, true);
    }
    rename($datFile, $kakoFile);
    subject_delete($bbsDir, $key);
}


function subject_select($content, $key){
    $marker = "$key.";
    foreach($content as $k => $v){
        if(str_starts_with($v, $marker)){
            preg_match('/<>(.+?) \((\d+)\)$/', $v, $m);
            return (object)['index'=>$k, 'key'=>$key, 'subject'=>$m[1], 'num'=>$m[2]];
        }
    }
}

function subject_delete($bbsDir, $key){
    file_edit("$bbsDir/subject.txt", fn($content) => array_filter($content, fn($v) => !str_starts_with($v, "$key.")));
}


function dat_from($from, $default, $admin){
    if($admin)       return $admin['name'] . ' ★';
    if($from === '') return $default;

    $from = escape($from);
    $from = str_replace('★', '☆', $from);
    $from = str_replace('◆', '◇', $from);
    $from = preg_replace_callback('/#(.+)/', fn($m)=>' ◆</b>'.self::trip($m[1]).'<b>', $from);

    return $from;
}

function dat_mail($mail){
    $mail = preg_replace('/#.*/', '', $mail);
    return escape($mail);
}

function dat_message($message){
    return escape(rtrim($message), true);
}

function dat_subject($subject){
    return escape($subject);
}

function dat_date(){
    $week = ['日','月','火','水','木','金','土'][date('w', $_SERVER['REQUEST_TIME'])];
    return date("Y/m/d($week) H:i:s", $_SERVER['REQUEST_TIME']);
}

function trip($tripkey){
    if(strlen($tripkey) >= 12){
        return str_replace('+', '.', substr(base64_encode(sha1($tripkey, true)), 0, 12));
    }
    else{
        $salt = preg_replace('/[^.-z]/', '.', substr($tripkey.'H.', 1, 2));
        $map  = [':'=>'A', ';'=>'B', '<'=>'C', '='=>'D', '>'=>'E', '?'=>'F', '@'=>'G', '['=>'a', '\\'=>'b', ']'=>'c', '^'=>'d', '_'=>'e', '`'=>'f'];
        return substr(crypt($tripkey, strtr($salt, $map)), -10);
    }
}

function id($bbs = ''){
    $ip   = substr(getenv('REMOTE_ADDR'), -5);
    $date = date('Ymd');
    $pass = __FILE__;
    $md5  = md5($ip.$date.$pass.$bbs);

    return substr($md5, 0, 10);
}


function post($name){
    return $_POST[$name] ?? "";
}

function isUTF8($str){
    return preg_match('//u', $str);
}

function escape($str, $br = false){
    $br  = $br ? '<br>' : '';
    $str = htmlspecialchars($str);
    $str = str_replace("\n", $br, $str);
    $str = preg_replace('/[[:cntrl:]]/', '', $str);

    return $str;
}

function file_edit($file, $fn){
    $fp = fopen($file, 'cb+');
    if(!$fp) return false;
    flock($fp, LOCK_EX);

    while(($line = fgets($fp)) !== false){
        $content[] = $line;
    }

    $content = $fn($content ?? []);

    if(is_array($content)){
        ftruncate($fp, 0);
        rewind($fp);
        fwrite($fp, implode('', $content));
        fclose($fp);
        return true;
    }
    else{
        fclose($fp);
        return false;
    }
}

function setting_load(){
    include './setting.php';
    return get_defined_vars();
}

function setting_admin($setting, $mail){
    $i = array_search($mail, array_column($setting['admin'], 'password'));

    return is_int($i) ? $setting['admin'][$i] : false;
}


function ok($bbs, $key){
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


function 管理削除($c){
    foreach(explode("\n", $c->message) as $v){
        if(preg_match("/>>(\d+)-?(\d+)?/", $v, $m)){
            if($m[1] == 1) return '1番目のレスは削除できません';

            $m[2] = $m[2] ?? $m[1];
            foreach(range($m[1], $m[2]) as $i){
                res_delete($c->datFile, $c->kakoFile, $i);
            }
        }
        else if(preg_match("|/(\d+)/$|", $v, $m)){
            thread_delete($c->bbsDir, $m[1]);
        }
    }
    return '削除しました';
}



function 管理倉庫($c){
    foreach(explode("\n", $c->message) as $v){
        if(preg_match("|/(\d+)/$|", $v, $m)){
            thread_move($c->bbsDir, $m[1]);
        }
    }
    return '倉庫へ移動しました';
}


function 管理復帰($c){
    file_edit($c->subjectFile, function() use($c){
        foreach(glob("$c->bbsDir/dat/*.dat") as $v){
            $list[$v] = filemtime($v);
        }
        arsort($list);

        foreach(array_keys($list) as $v){
            $filename = basename($v);
            $dat      = file($v);
            $subject  = explode("<>", $dat[0])[4];
            $subject  = rtrim($subject);
            $count    = count($dat);
            $content[] = "$filename<>$subject ($count)\n";
        }

        return $content;
    });
    return '復帰完了';
}
