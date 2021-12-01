<?php
/*
二重書き込み
*/

mb_substitute_character('entity');

if(!$_POST){
    parse_str(file_get_contents('php://input'), $_POST);
}
if(post('submit') !== '書き込む'){
    mb_convert_variables('utf-8', 'sjis', $_POST);
}


define('REFERER', $_SERVER['HTTP_REFERER'] ?? '');
define('RES', (bool)post('key'));
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



if(ADMIN and method_exists('Maintenance', FROM)){
    error(Maintenance::{FROM}(PATH, MESSAGE, KEY));
}


if($_SERVER['HTTP_HOST'] !== parse_url(REFERER, PHP_URL_HOST)){
    error('リファラが不正です');
}
if(!BBS){
    error('bbsが存在しません');
}
if(preg_match('/[\W]/', BBS)){
    error('bbsが不正です');
}
if(!Subject::exists(PATH)){
    error('板が存在しません');
}
if(RES and preg_match('/[\D]/', KEY)){
    error('keyが不正です');
}
if(RES and !Thread::exists(PATH, KEY) and Thread::is_kako(PATH, KEY)){
    error('このスレは過去ログなので書き込めません');
}
if(RES and !Thread::exists(PATH, KEY) and !Thread::is_kako(PATH, KEY)){
    error('このスレは存在しません');
}
if(!RES and !SUBJECT){
    error('タイトルを入力してください');
}
if(!RES and !isUTF8(SUBJECT)){
    error('文字コードが不正です');
}
if(!RES and strlen(SUBJECT) > 96){
    error('タイトルが長すぎます');
}
if(strlen(FROM) > 32){
    error('名前が長すぎます');
}
if(!isUTF8(FROM)){
    error('文字コードが不正です');
}
if(strlen(MAIL) > 64){
    error('メールが長すぎます');
}
if(!isUTF8(MAIL)){
    error('文字コードが不正です');
}
if(!MESSAGE){
    error('本文を入力してください');
}
if(strlen(MESSAGE) > 4096){
    error('本文が長すぎます');
}



if(RES){
    $from    = Res::from(FROM);
    $mail    = Res::mail(MAIL);
    $message = Res::message(MESSAGE);

    Res::save(PATH, KEY, $from, $mail, $message) ? ok(BBS, KEY) : error('レス書き込みエラー');
}
else{
    $from    = Res::from(FROM);
    $mail    = Res::mail(MAIL);
    $message = Res::message(MESSAGE);
    $subject = Res::subject(SUBJECT);

    Thread::save(PATH, KEY, $from, $mail, $message, $subject) ? ok(BBS, KEY) : error('スレッド書き込みエラー');
}




class Subject{
    static function path($path){
        return "$path/subject.txt";
    }


    static function exists($path){
        return file_exists(self::path($path));
    }


    static function select($file, $key){
        $marker = "$key.";
        foreach($file as $k => $v){
            if(strpos($v, $marker) === 0){
                preg_match('/<>(.+?) \((\d+)\)$/', $v, $m);
                return (object)['index'=>$k, 'key'=>$key, 'subject'=>$m[1], 'num'=>$m[2]];
            }
        }
    }


    static function delete($path, $key){
        file_edit(self::path($path), function($file) use($key){
            return array_filter($file, function($line) use($key){ return !preg_match("/^$key\./", $line); });
        });
    }
}



class Thread{
    static function path($path, $key){
        return "$path/dat/$key.dat";
    }


    static function exists($path, $key){
        return file_exists(self::path($path, $key));
    }


    static function kako_path($path, $key){
        return sprintf('%s/kako/%s/%s.dat', $path, substr($key,0,3), $key);
    }


    static function is_kako($path, $key){
        return file_exists(self::kako_path($path, $key));
    }


    static function save($path, $key, $from, $mail, $message, $subject){
        if(self::exists($path, $key)){
            error('再度スレを立ててください');
        }
        $date = Res::date($key);
        $dat  = mb_convert_encoding("$from<>$mail<>$date<> $message <>$subject\n", 'sjis', 'utf-8');
        $txt  = mb_convert_encoding("$key.dat<>$subject (1)\n", 'sjis', 'utf-8');

        return file_edit(Subject::path($path), function($file) use($path, $key, $dat, $txt){
            file_put_contents(self::path($path, $key), $dat, LOCK_EX);
            array_unshift($file, $txt);
            return $file;
        });
    }


    static function delete($path, $key){
        if(self::exists($path, $key)){
            unlink(self::path($path, $key));
            Subject::delete($path, $key);
        }
        else{
            unlink(self::kako_path($path, $key));
        }
    }


    static function move($path, $key){
        $kako_dir = dirname(self::kako_path($path, $key));
        if(!is_dir($kako_dir)){
            mkdir($kako_dir, 0777, true);
        }
        rename(self::path($path, $key), self::kako_path($path, $key));
        Subject::delete($path, $key);
    }
}



class Res{
    static function from($from){
        if(ADMIN){
            return ADMIN['name'] . ' ★';
        }
        if($from === ''){
            return SET['nanashi'];
        }
        $from = self::escape($from);
        $from = str_replace('★', '☆', $from);
        $from = str_replace('◆', '◇', $from);
        $from = preg_replace_callback('/#(.+)/', function($m){ return ' ◆</b>'.self::trip($m[1]).'<b>'; }, $from);

        return $from;
    }


    static function mail($mail){
        $mail = preg_replace('/#.*/', '', $mail);
        return self::escape($mail);
    }


    static function date($time){
        $week = ['日','月','火','水','木','金','土'][date('w', $time)];
        return date("Y/m/d($week) H:i:s", $time);
    }


    static function subject($subject){
        return self::escape($subject);
    }


    static function message($message){
        return self::escape(rtrim($message), '<br>');
    }


    static function save($path, $key, $from, $mail, $message){
        $date = self::date($_SERVER['REQUEST_TIME']);
        $dat  = mb_convert_encoding("$from<>$mail<>$date<> $message <>\n", 'sjis', 'utf-8');

        return file_edit(Subject::path($path), function($file) use($path, $key, $dat){
            $selected = Subject::select($file, $key);
            if(!$selected){
                error('このスレッドは存在しません');
            }
            if($selected->num >= 1000){
                error('このスレッドにはこれ以上書き込めません');
            }

            file_put_contents(Thread::path($path, $key), $dat, LOCK_EX|FILE_APPEND);

            $selected->num++;
            array_splice($file, $selected->index, 1);
            array_unshift($file, "$key.dat<>$selected->subject ($selected->num)\n");

            return $file;
        });
    }


    static function delete($path, $key, $num){
        $dat_path = Thread::exists($path, $key) ? Thread::path($path, $key) : Thread::kako_path($path, $key);
        file_edit($dat_path, function($file) use($num){
            $file[$num-1] = mb_convert_encoding("あぼーん<>あぼーん<>あぼーん<>あぼーん<>\n", 'sjis', 'utf-8');
            return $file;
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



class Maintenance{

    static function 削除($path, $message, $key = null){
        foreach(explode("\n", $message) as $v){
            if(preg_match("/>>(\d+)-?(\d+)?/", $v, $m)){
                if($m[1] == 1){
                    return '1番目のレスは削除できません';
                }
                $m[2] = $m[2] ?? $m[1];
                for($i = $m[1]; $i <= $m[2]; $i++){
                    Res::delete($path, $key, $i);
                }
            }
            else if(preg_match("|/(\d+)/$|", $v, $m)){
                Thread::delete($path, $m[1]);
            }
        }
        return '削除しました';
    }


    static function 復帰($path){
        file_edit(Subject::path($path), function($file) use($path){
            foreach(glob("$path/dat/*.dat") as $v){
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



    static function 倉庫($path, $message){
        foreach(explode("\n", $message) as $v){
            if(preg_match("|/(\d+)/$|", $v, $m)){
                Thread::move($path, $m[1]);
            }
        }
        return '倉庫へ移動しました';
    }
}


function post($name){
    return $_POST[$name] ?? '';
}


function isUTF8($str){
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

