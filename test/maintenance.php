<?php

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
        else if(preg_match("/\/(\d+)\/$/", $v, $m)){
            delete_thread($bbs_path, $m[1]);
        }
    }
    return '削除しました';
}



function 復帰($bbs_path){
    edit_file(get_subject_path($bbs_path), function($contents) use($bbs_path){
        foreach(glob("$bbs_path/dat/*.dat") as $v){
            $list[$v] = filemtime("$bbs_path/dat/$v");
        }
        rsort($list);

    	foreach(array_keys($list) as $v){
    		$dat      = file("$bbs_path/dat/$v");
    		$subject  = explode("<>", $dat[0])[5];
    		$subject  = rtrim($subject);
    		$count    = count($dat);
    		$result[] = "$v<>$subject ($count)\n";
    	}

        return $result;
    });
    return '復帰完了';
}



function 倉庫($bbs_path, $message){
	foreach(explode("\n", $message) as $v){
		if(preg_match("/\/(\d+)\/$/", $v, $m)){
		    move_thread($bbs_path, $m[1]);
        }
    }
    return '倉庫へ移動しました';
}



function delete_res($bbs_path, $key, $num){
	edit_file(get_dat_path($bbs_path, $key), function($contents) use($num){
        $contents[$num-1] = "あぼーん<>あぼーん<>あぼーん<>あぼーん<>\n";
        return $contents;
    });
}



function delete_thread($bbs_path, $key){
    unlink(get_dat_path($bbs_path, $key));
    delete_subject($bbs_path, $key);
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
        return array_filter($contents, function($line) use($key){ !preg_match("/^$key\./", $line); });
    });
}
