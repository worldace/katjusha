<?php


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



function get_kako_path($bbs_path, $key){
    return sprintf('%s/kako/%s/', $bbs_path, substr($key,0,3));
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



function replace_message($message){
    $message = rtrim($message);
    $message = html_escape($message, '<br>');
    return $message;
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


function is_utf8($v){
    return preg_match('//u', $v);
}



function 削除($bbs_path, $message, $key = null){
	foreach(explode("\n", $message) as $v){
        if(preg_match("/>>(\d+)-?(\d+)?/", $v, $m)){
            if($m[1] == 1){
                return '1番目のレスは削除できません';
            }
            $m[2] = $m[2] ?? $m[1];
            for($i = $m[1]; $i <= $m[2]; $i++){
                delete_res($bbs_path, $key, $i);
            }
        }
        else if(preg_match("|/(\d+)/$|", $v, $m)){
            delete_thread($bbs_path, $m[1]);
        }
    }
    return '削除しました';
}



function 復帰($bbs_path){
    edit_file(get_subject_path($bbs_path), function($contents) use($bbs_path){
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



function 倉庫($bbs_path, $message){
	foreach(explode("\n", $message) as $v){
		if(preg_match("|/(\d+)/$|", $v, $m)){
		    move_thread($bbs_path, $m[1]);
        }
    }
    return '倉庫へ移動しました';
}



function delete_res($bbs_path, $key, $num){
    $dat_path = is_live($bbs_path, $key) ? get_dat_path($bbs_path, $key) : get_kako_path($bbs_path, $key);
    edit_file($dat_path, function($contents) use($num){
        $contents[$num-1] = mb_convert_encoding("あぼーん<>あぼーん<>あぼーん<>あぼーん<>\n", 'sjis', 'utf-8');
        return $contents;
    });
}



function delete_thread($bbs_path, $key){
    if(is_live($bbs_path, $key)){
        unlink(get_dat_path($bbs_path, $key));
        delete_subject($bbs_path, $key);
    }
    else{
        unlink(get_kako_path($bbs_path, $key));
    }
}



function move_thread($bbs_path, $key){
    $kako_path = get_kako_path($bbs_path, $key);
    if(!is_dir($kako_path)){
        mkdir($kako_path, 0777, true);
    }
    rename("$bbs_path/dat/$key.dat", "$kako_path/$key.dat");
    delete_subject($bbs_path, $key);
}



function delete_subject($bbs_path, $key){
    edit_file(get_subject_path($bbs_path), function($contents) use($key){
        return array_filter($contents, function($line) use($key){ return !preg_match("/^$key\./", $line); });
    });
}


function is_live($bbs_path, $key){
    return file_exists(get_dat_path($bbs_path, $key));
}