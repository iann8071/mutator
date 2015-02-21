<?php
	$domain = $_GET["domain"];
	$inputHTML = preg_replace("/\d+/", "", $_GET["targetHTML"]);
	$type = $_GET["type"];
	$attributeName = $_GET["attributeName"];
	$styleName = $_GET["styleName"];

	$mutantDir;
	if($styleName != "") {
	$mutantDir = "./".$domain."/style/".$styleName;
	} else if($attributeName != "") {
	$mutantDir = "./".$domain."/attribute/".$attributeName;
	} else {
	$mutantDir = "./".$domain."/".$type;
	}

	if(file_exists($mutantDir)){
		$handle = opendir($mutantDir);
		while(false !== ($file = readdir($handle))) {
			if($file != "." && $file != "..") {
			$content = file_get_contents($file, true);
			echo $content;
			}
		} 
	}else {
		echo "read fail";	
	}

