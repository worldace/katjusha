<?php
/*
二重書き込み
*/

mb_substitute_character('entity');

if(getenv('REQUEST_METHOD') !== 'POST'){
    exit;
}
if(!$_POST){
    parse_str(file_get_contents('php://input'), $_POST);
}
if(post('submit') !== '書き込む'){
    mb_convert_variables('utf-8', 'sjis', $_POST);
}

define('IS_THREAD', !post('key'));

define('BBS', post('bbs'));
define('KEY', post('key') ?: $_SERVER['REQUEST_TIME']);
define('FROM', post('FROM'));
define('MAIL', post('mail'));
define('SUBJECT', post('subject'));
define('MESSAGE', post('MESSAGE'));

define('PATH', sprintf('%s/../%s', __DIR__, BBS));

define('SET', (function(){
    include __DIR__.'/setting.php';
    return get_defined_vars();
})());

define('ADMIN', (function (){
    $i = array_search(MAIL, array_column(SET['admin'], 'password'));
    return is_int($i) ? SET['admin'][$i] : [];
})());




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




class subject{
    static function path($bbs_path){
        return "$bbs_path/subject.txt";
    }


    static function exists($bbs_path){
        return file_exists(subject::path($bbs_path));
    }


    static function delete($bbs_path, $key){
        file_edit(subject::path($bbs_path), function($contents) use($key){
            return array_filter($contents, function($line) use($key){ return !preg_match("/^$key\./", $line); });
        });
    }
}



class thread{
    static function path($bbs_path, $key){
        return "$bbs_path/dat/$key.dat";
    }


    static function kako_path($bbs_path, $key){
        return sprintf('%s/kako/%s/%s.dat', $bbs_path, substr($key,0,3), $key);
    }


    static function exists($bbs_path, $key){
        return file_exists(thread::path($bbs_path, $key));
    }


    static function is_kako($bbs_path, $key){
        return file_exists(thread::kako_path($bbs_path, $key));
    }


    static function create($bbs_path, $key, $from, $mail, $message, $subject){
        $date     = res::date($key);
        $dat      = mb_convert_encoding("$from<>$mail<>$date<> $message <>$subject\n", 'sjis', 'utf-8');
        $txt      = mb_convert_encoding("$key.dat<>$subject (1)\n", 'sjis', 'utf-8');
        $dat_path = thread::path($bbs_path, $key);

        return file_edit(subject::path($bbs_path), function($contents) use($dat_path, $dat, $txt){
            if(file_exists($dat_path)){
                error('再度スレを立ててください');
            }
            file_put_contents($dat_path, $dat, LOCK_EX);
            array_unshift($contents, $txt);
            return $contents;
        });
    }


    static function delete($bbs_path, $key){
        if(thread::exists($bbs_path, $key)){
            unlink(thread::path($bbs_path, $key));
            subject::delete($bbs_path, $key);
        }
        else{
            unlink(thread::kako_path($bbs_path, $key));
        }
    }


    static function move($bbs_path, $key){
        $kako_dir = dirname(thread::kako_path($bbs_path, $key));
        if(!is_dir($kako_dir)){
            mkdir($kako_dir, 0777, true);
        }
        rename(thread::path($bbs_path, $key), thread::kako_path($bbs_path, $key));
        subject::delete($bbs_path, $key);
    }
}



class res{
    static function from($from){
        if(ADMIN){
            return ADMIN['name'] . ' ★';
        }
        if($from === ''){
            return SET['nanashi'];
        }
        $from = res::escape($from);
        $from = str_replace('★', '☆', $from);
        $from = str_replace('◆', '◇', $from);
        $from = preg_replace_callback('/#(.+)/', function($m){ return ' ◆</b>'.res::trip($m[1]).'<b>'; }, $from);

        return $from;
    }


    static function mail($mail){
        $mail = preg_replace('/#.*/', '', $mail);
        $mail = res::escape($mail);
        return $mail;
    }


    static function date($time){
        $week = ['日','月','火','水','木','金','土'][date('w', $time)];
        return date("Y/m/d($week) H:i:s", $time);
    }


    static function subject($subject){
        return res::escape($subject);
    }


    static function message($message){
        $message = rtrim($message);
        $message = res::escape($message, '<br>');
        return $message;
    }


    static function create($bbs_path, $key, $from, $mail, $message){
        $date = res::date($_SERVER['REQUEST_TIME']);
        $dat  = mb_convert_encoding("$from<>$mail<>$date<> $message <>\n", 'sjis', 'utf-8');

        return file_edit(subject::path($bbs_path), function($contents) use($bbs_path, $key, $dat){
            $num = 0;
            foreach($contents as $k => $v){
                if(strpos($v, "$key.") === 0){
                    $v = preg_replace_callback('/\d+(?=\)$)/', function($m) use(&$num){$num=$m[0]; return $num+1;}, $v);
                    break;
                }
            }
            if(!$num){
                error('このスレッドは存在しません');
            }
            if($num >= 1000){
                error('このスレッドにはこれ以上書き込めません');
            }

            file_put_contents(thread::path($bbs_path, $key), $dat, LOCK_EX|FILE_APPEND); //重複チェックが

            array_splice($contents, $k, 1);
            array_unshift($contents, $v);

            return $contents;
        });
    }


    static function delete($bbs_path, $key, $num){
        $dat_path = thread::exists($bbs_path, $key) ? thread::path($bbs_path, $key) : thread::kako_path($bbs_path, $key);
        file_edit($dat_path, function($contents) use($num){
            $contents[$num-1] = mb_convert_encoding("あぼーん<>あぼーん<>あぼーん<>あぼーん<>\n", 'sjis', 'utf-8');
            return $contents;
        });
    }


    static function trip($tripkey){
        if(strlen($tripkey) >= 12){
            return str_replace('+', '.', substr(base64_encode(sha1($tripkey, true)), 0, 12));
        }
        else{
            $salt = preg_replace('/[^.-z]/', '.', substr($tripkey.'H.', 1, 2));
            $map  = [':'=>'A', ';'=>'B', '<'=>'C', '='=>'D', '>'=>'E', '?'=>'F', '@'=>'G', '['=>'a', '\\'=>'b', ']'=>'c', '^'=>'d', '_'=>'e', '`'=>'f'];
            return substr(crypt($tripkey, strtr($salt, $map)), -10);
        }
    }


    static function id($bbs = ''){
        $ip   = substr(getenv('REMOTE_ADDR'), -5);
        $date = date('Ymd');
        $pass = __FILE__;
        $md5  = md5($ip.$date.$pass.$bbs);

        return substr($md5, 0, 10);
    }


    static function escape($str, $br = ''){
        $str = htmlspecialchars($str, ENT_QUOTES, 'UTF-8', false);
        $str = str_replace("\n", $br, $str);
        $str = preg_replace('/[[:cntrl:]]/', '', $str);

        return $str;
    }
}



class maintenance{
    static function 削除($bbs_path, $message, $key = null){
        foreach(explode("\n", $message) as $v){
            if(preg_match("/>>(\d+)-?(\d+)?/", $v, $m)){
                if($m[1] == 1){
                    return '1番目のレスは削除できません';
                }
                $m[2] = $m[2] ?? $m[1];
                for($i = $m[1]; $i <= $m[2]; $i++){
                    res::delete($bbs_path, $key, $i);
                }
            }
            else if(preg_match("|/(\d+)/$|", $v, $m)){
                thread::delete($bbs_path, $m[1]);
            }
        }
        return '削除しました';
    }


    static function 復帰($bbs_path){
        file_edit(subject::path($bbs_path), function($contents) use($bbs_path){
            foreach(glob("$bbs_path/dat/*.dat") as $v){
                $list[$v] = filemtime($v);
            }
            arsort($list);

            foreach(array_keys($list) as $v){
                $filename = basename($v);
                $dat      = file($v);
                $subject  = explode("<>", $dat[0])[4];
                $subject  = rtrim($subject);
                $count    = count($dat);
                $result[] = "$filename<>$subject ($count)\n";
            }

            return $result;
        });
        return '復帰完了';
    }



    static function 倉庫($bbs_path, $message){
        foreach(explode("\n", $message) as $v){
            if(preg_match("|/(\d+)/$|", $v, $m)){
                thread::move($bbs_path, $m[1]);
            }
        }
        return '倉庫へ移動しました';
    }
}


function post($name){
    return $_POST[$name] ?? '';
}


function is_utf8($str){
    return preg_match('//u', $str);
}


function file_edit($file, $fn){
    $fp = fopen($file, 'cb+');
    if(!$fp){
        return false;
    }
    flock($fp, LOCK_EX);

    $contents = [];
    while(($line = fgets($fp)) !== false){
        $contents[] = $line;
    }

    $contents = $fn($contents);

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

