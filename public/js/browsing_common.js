var show_list = new Array();
var cur_page = 0;
var is_show_pic = 0;
var browsing_mode = 'file';
var golbol_volume = 1;
var is_star = 0;
var need_play_next = 0;
var storage;
var file_recursive_cnt = 1;
var box_w;
var box_h;

/**规范路径 */
function filePathFix(file_name) {

    // var a = "//jwioq/e/j////f/q//o//efjqo/";
    // while (1) {
    //     var b = a.replace(/\/\//, "/");
    //     if (b == a) {
    //         if (b[0] == "/") {
    //             a = b.substring(1);
    //         }
    //         break;
    //     }
    //     a = b;
    // }
    // console.log(a);

    if (file_name.length == 0) {
        return ''
    }
    /**规范路径 */
    while (1) {
        var b = file_name.replace(/\/\//, "/");
        if (b == file_name) {
            file_name = b;
            break;
        }
        file_name = b;
        console.log(file_name);
    }
    if (file_name[0] == "/") {
        file_name = file_name.substring(1);
    }
    // file_name = file_name.replace("'", '"')
    // file_name = file_name.replace('"', '\'"')
    return file_name;
}

function set_serch_url(file_dir, browsing_mode, file_recursive_cnt)
{
    file_dir = filePathFix(file_dir)
    serch_url = "file_dir=" + file_dir + "&browsing_mode=" + browsing_mode + "&recursive_cnt=" + file_recursive_cnt;
    return serch_url
}

function show_star(is_star) {
	console.log(is_star);
	if (is_star == 1) {
		$("#start_div").attr("style","color: yellow;");
	} else {
		$("#start_div").attr("style","color: black;");
	}
}


function path_dir_cvt (path_url) {
    path_url=path_url.replace(/\%/g,"%25");
    path_url=path_url.replace(/\#/g,"%23");
    path_url=path_url.replace(/\&/g,"%26");
    path_url=path_url.replace(/\ /g,"%20");
    path_url=path_url.replace(/\+/g,"%2B");
    path_url=path_url.replace(/\//g,"%2F");
    path_url=path_url.replace(/\?/g,"%3F");
    path_url=path_url.replace(/\=/g,"%3D");
    return path_url
};


function goto_favorite() {
    url = "favorite.html?" + set_serch_url("", 'file', 1)
	window.location.replace(url)
}


function find_cur_is_star(file) {
    set_serch_url(file, browsing_mode, file_recursive_cnt)
	request_url = '/is_start_file?' + set_serch_url(file, browsing_mode, file_recursive_cnt)
	console.log(request_url);
	$.getJSON(request_url, function(data) {
		console.log(data);
		if (data["code"] != 0) {
			show_star(0);
			is_star = 0;
			return;
		} else {
			show_star(1);
			is_star = 1;
		}
	})
}

function dir_copy() {
	var file_dir = getQueryString('file_dir');
	if (file_dir == null) {
        file_dir = "/"
	}
	var idx = file_dir.indexOf("windows")
	if (idx == -1) {
		return
	}
	file_dir = file_dir.slice(idx + 8)
	if (show_list[cur_page] && browsing_mode != 'file') {
		file_dir = file_dir + "/" + show_list[cur_page]
	}
	file_dir = file_dir.replace("//", "/")
	var cp_text = file_dir.slice(0, 1) + ":" + file_dir.slice(1)

	copyTest(cp_text, function(text) {
		alert(text + " copy ok")
	})
}


function delete_file() {
	if (browsing_mode == 'file') {
		alert("只有浏览模式才可以删除文件")
		return
	}

	var file_dir = getQueryString('file_dir');
	if (file_dir == null) {
        file_dir = "/"
	}
	
	if (show_list.length == 0) {
		alert("没有文件可以删除")
		return
	}

	file_dir += "/" + show_list[cur_page]
	if(confirm("确定要删除文件？\n" + file_dir) !=true){
			return
	}
    
	request_url = '/delete_file?' + set_serch_url(file_dir, browsing_mode, file_recursive_cnt)
	$.getJSON(request_url, function(data) {
		if (data["code"] != 0) {
			alert("删除失败" + data['reson']);
			return;
		}
		alert("删除成功")

		if(window.localStorage){
			var file_dir = getQueryString('file_dir');
			if (file_dir == null) {
				file_dir = "/"
			}
			storage = window.localStorage;
			if (cur_page > 0 && cur_page < show_list.length) {
				cur_page = cur_page - 1
			} else {
				cur_page = 0
			}
			storage.setItem("cur_page", cur_page)
			storage.setItem("cur_dir", file_dir)
			location.reload()
		} 
	});
}

function dir_star() {
	var file_dir = getQueryString('file_dir');
	if (file_dir == null) {
        file_dir = "/"
    }
    if (browsing_mode != 'file') {
        file_dir = file_dir + '/' +  show_list[cur_page]
    }
	var request_url = new String();
    request_url = set_serch_url(file_dir, browsing_mode, file_recursive_cnt)
	if (is_star == 0) {
		request_url = '/set_favorite_list?' + request_url
		$.getJSON(request_url, function(data) {
			if (data["code"] != 0) {
				alert("收藏失败");
				return;
			}
			show_star(1);
			is_star = 1;
			alert("收藏成功")
		});
	} else  {
		request_url = '/del_favorite_list?' + request_url
		$.getJSON(request_url, function(data) {
			if (data["code"] != 0) {
				alert("取消收藏失败");
				return;
			}
			show_star(0);
			is_star = 0;
			alert("取消收藏成功")
		});
	}
 }

function jujed_play_next(ojb) {
	if (need_play_next == 1) {
		next_img()
		need_play_next = 0;
	}
}

function play_next_by_end_or_error(obj) {
	need_play_next = 1;
	setTimeout("jujed_play_next()",2000);
	//next_img(obj)
}

function playe__vent() {
	//alert("start play");
	need_play_next = 0;
}

function volume_change() {
	myVid=document.getElementById("video1");
	golbol_volume = myVid.volume;
	storage.setItem("volume", golbol_volume)
}

function video_set_by_hw() {
	var myVid=document.getElementById("video1");
	if (!myVid) {
		return
	}

	// alert(myVid.videoWidth)
	// alert(myVid.videoHeight)

	var rotio = 0

	if (myVid.videoWidth == 0 || myVid.videoHeight == 0) {
		ratio = 1280/720
	} else {
		ratio = myVid.videoWidth/myVid.videoHeight
	}

	if ((box_w / box_h) > ratio) {
			// this.height = this.videoHeight
			// this.width = box_w
			myVid.height = box_h - 65

			myVid.width = myVid.height * ratio
			// alert("set height")
			// this.width = box_w
		} else {
			// this.height = box_h.videoHeight
			// this.width = videoWidth

			// this.height = box_h.videoHeight
			// alert("set width")
			myVid.width = box_w - 110
			myVid.height = myVid.width * (1/ratio)

		}
}

function video_hw_set() {
	// return
	// alert(document.body.clientWidth)
	// alert(document.body.clientHeight)
	// return
	var video = document.querySelector('video');
	video.addEventListener('canplay', function () {
		removeEventListener('canplay', function () {
			alert("事件结束")
		}, false);
		video_set_by_hw()
	}, false);
}

function shwo_cur_pic(page) {
	var file_dir = getQueryString('file_dir');
	var pic_info = "<txt>【" + (cur_page+1) + "/" + show_list.length + "】: " + show_list[page] + "</txt>"
    //document.getElementById("demo").innerHTML = "Hello javascript!";
    var div_item = $("#picinfo").find("div")[0]
    div_item.innerHTML = pic_info;
    var txt = div_item.children[0]
    if (txt.offsetWidth > div_item.offsetWidth * 1.1) {
        txt.onmouseover = function () {
            //设定鼠标行为，滚动
            this.style.animation = "6s wordsLoop linear infinite normal";
        };
        //为li注册鼠标离开事件
        txt.onmouseout = function () {
            //取消滚动
            this.style.animation = "";
        };
    }

	//$("#picinfo").find("b").remove();
	//$("#picinfo").append(pic_info);

	input = document.getElementById("page_input")
	input.value = page + 1

	storage.setItem("cur_page", page)

	if (browsing_mode == 'picture') {
		var imgStr = '<img id="show_ctx" src="./img/loading.png" lazy-src="store/' + file_dir + "/" + show_list[page] + '">';
		$("#center_box").find("img").remove();
		$("#center_box").append(imgStr);
		new LazyLoad().init();
	} else if (browsing_mode == 'video') {
		var new_src = "store/" + file_dir + "/" + show_list[page];
		myVid=document.getElementById("video1");
		need_play_next = 0;
		if (myVid) {
			myVid.src = new_src;
			myVid.focus()
			myVid.play()
			//return
		} else {
			var vidstr = '<video object-fit:fill id = "video1" controls autoplay="autoplay" onended="play_next_by_end_or_error()" onerror="play_next_by_end_or_error()" onplaying="playe__vent()" onvolumechange="volume_change()" > <source src="' + new_src + '" type="video/mp4"> </video>';
			$("#center_box").append(vidstr);
			myVid = document.getElementById("video1");
			myVid.volume = golbol_volume;
			myVid.focus()
			video_hw_set()
		}
    }
    find_cur_is_star(file_dir + "/" + show_list[page]);
	javascript:scroll(0,0);
}

function start_show()
{
	if(window.localStorage){
		storage = window.localStorage;
		var tmp = storage.getItem("cur_dir")
		var file_dir = getQueryString('file_dir');
		if (file_dir == null) {
			file_dir = "";
		} else {
			//file_dir = file_dir.slice(2, file_dir.length-1)
		}
		if (tmp) {
			// alert(tmp)
			// alert(file_dir)
			if (tmp === file_dir) {
				var page = storage.getItem("cur_page")
				page = parseInt(page)
				if (page < 0 || page >= show_list.length) {
					cur_page = 0
				} else {
					cur_page = page
				}
			}
		}
		storage.setItem("cur_dir", file_dir)
	} 


	//$("#shwo_pic").attr["style"].append("display:none;");
	//$("#dir_contex").attr("style","display:none;");
	//$("#file_contex").attr("style","display:none;");
	$("#dir_contex").remove()
	$("#file_contex").remove()

	$("#picinfo").attr("style","display:;width:100%;")

	if (browsing_mode == 'video') { // 视频模式
		$("#center_box").attr("style","display:;")
		$("#pre_evt").attr("style","height:50%;");//remove();
		$("#nxt_evt").attr("style","height:50%;");//remove();
	} else {
		$("#center_box").attr("style","display:;")
	}

	is_show_pic = 1;
	shwo_cur_pic(cur_page);
}

function jump_chapter(dirct) {
	var file_dir = getQueryString('file_dir');
	var browsing_mode = getQueryString('browsing_mode');
	if (!browsing_mode) {
		browsing_mode = 'file';
	}
	var request_url = new String();
	var host = window.location.host;
    file_dir = path_dir_cvt(file_dir)
    
	if (dirct == 0) {
		request_url = '/get_prev_dir?' + set_serch_url(file_dir, browsing_mode, file_recursive_cnt)
	} else {
		request_url = '/get_next_dir?' + set_serch_url(file_dir, browsing_mode, file_recursive_cnt)
	}
	$.getJSON(request_url, function(data) {
		if (data["code"] != 0) {
			alert("寻找上、下级目录错误");
			return;
        }
        
		location.href = "browsing.html?" + set_serch_url(data["find_dir"], browsing_mode, file_recursive_cnt)
	});
}

function prev_img(obj) {
	if (cur_page == 0) {
		if(confirm("已经是此章节第1页了，要打开上一个章节吗？")==true){
			jump_chapter(0);
		}
		return;
	} else {
		cur_page -= 1;
	}
	shwo_cur_pic(cur_page);
}

function next_img(obj) {
	if (cur_page == (show_list.length - 1)) {
		if(confirm("已经是此章节最后一页了，要打开下一个章节吗？")==true){
			jump_chapter(1);
		}
		return;
	} else {
		cur_page += 1;
	}
	shwo_cur_pic(cur_page);
}

$(document).keydown(function(event){

	if (is_show_pic == 0) {
		return;
	}
	//alert(event.keyCode)
//	return
	if (event.keyCode == 65 /*a*/) {
		prev_img(null);
		return
	} else if (event.keyCode == 68 /*d*/) {
		next_img(null);
		return
	}
	if (browsing_mode == 'video') {
		myVid=document.getElementById("video1");
		golbol_volume = myVid.volume;
		if (event.keyCode == 87 /*w*/) {
			if (golbol_volume + 0.1 <= 0.99) {
				golbol_volume += 0.1;
			} else  {
				golbol_volume = 1;
			}
			myVid.volume = golbol_volume;
		} else if (event.keyCode == 83 /*s*/) {
			if (golbol_volume - 0.1 >= 0.01) {
				golbol_volume -= 0.1;
			} else  {
				golbol_volume = 0;
			}
			//alertalert(myVid.volume)
			myVid.volume = golbol_volume;
			
		}
		return
	} else if (browsing_mode == 'picture') {
		//javascript:scroll(0,200);
	}
});

function page_select() {
	input = document.getElementById("page_input")
	var page = input.value
	if (is_show_pic != 0 && cur_page != page) {
		if (page <= 0 && page >= show_list.length) {
			return;
		}
		cur_page = parseInt(page) - 1;
		shwo_cur_pic(cur_page);
	}
}

function add_title_link(title) {
	/*为标题添加各级目录链接*/
	var list = $('#file-title');
	var dir_link =  title .split("/");
	var pre_dir = new String();
    var home_dir = 1;
    console.log(dir_link);
	dir_link.forEach(function(data) {
        console.log(data);
        if (!data) {
            return;
        }
		var url = new String();
		if (home_dir == 1) {
			url = "/browsing.html?file_dir=windows&browsing_mode=file&recursive_cnt=1"
			home_dir = 0;
		} else {
			if (data == "/") {
				url.length = 0;
			} else {
                pre_dir = pre_dir + data;
                
				url = "browsing.html?" + set_serch_url(pre_dir, browsing_mode,file_recursive_cnt)
				pre_dir = pre_dir + "/";
			}
        }
        
		if (url.length != 0) {
			list.append('<a  style="text-decoration:none" href="' + url + '">' + data + '/</style="text-decoration:none">')
		}
	});
}

function copyTest(text, cbk) {
	var tag = document.createElement("input")
	tag.setAttribute("id", "cp_hgz_input")
	tag.value = text
	document.getElementsByTagName('body')[0].appendChild(tag)
	document.getElementById("cp_hgz_input").select()
	document.execCommand("copy")
	document.getElementById("cp_hgz_input").remove()
	if (cbk) {
		cbk(text)
	}
}

function recursive_change()
{
    // alert(old_url)
    old_url = window.location.pathname
    var item = null;
    var obj = document.getElementById('file_recursive_cnt')
    for (var i = 0; i < obj.length; i++) { //遍历Radio 
        if (obj[i].checked) {
            item = obj[i].value;
            break;              
        }
    }
    if (!item) {
        return
    }
    console.log(browsing_mode);
    console.log(item);
    if (browsing_mode == 'file') {
        for (var i = 0; i < obj.length; i++) { //遍历Radio 
            console.log(obj[i].value);
            if (obj[i].value == 1) {
                obj[i].checked = true
                break;              
            }
        }
        return
    }
    old_url = window.location.pathname
    file_recursive_cnt = item
    file_dir = getQueryString('file_dir');
    browsing_mode = getQueryString('browsing_mode');
    new_url = old_url + "?"+ set_serch_url(file_dir, browsing_mode, file_recursive_cnt)
    location.href = new_url
}

function mode_change()
{
    var item = null;
    var obj = document.getElementById('browsing_mode')
    for (var i = 0; i < obj.length; i++) { //遍历Radio 
        if (obj[i].checked) {
            item = obj[i].value;
            break;              
        }
    }
    if (!item) {
        return
    }

    old_url = window.location.pathname
    browsing_mode = item
    file_dir = getQueryString('file_dir');
    file_recursive_cnt = getQueryString('recursive_cnt');
    new_url = old_url + "?"+ set_serch_url(file_dir, browsing_mode, file_recursive_cnt)
    location.href = new_url
}

$(window).resize(function(){ 
	box_h = $(window).height();
	box_w = $(window).width();
	video_set_by_hw();
})



$(function() {
	box_h = $(window).height();
	box_w = $(window).width();

	if(! window.localStorage){
		alert("浏览器不支持localstorage");
		return false;
	}
	storage = window.localStorage;

	var tmp = storage.getItem("volume")
	if (tmp) {
		golbol_volume = parseFloat(tmp)
	} else {
		storage.setItem("volume", golbol_volume)
    }
    
    browsing_mode = getQueryString('browsing_mode');
    // alert(browsing_mode)
    file_recursive_cnt = getQueryString('recursive_cnt');
    // alert(file_recursive_cnt)

	var file_dir = getQueryString('file_dir');
	if (file_dir == null) {
		file_dir = "";
	} else {
		//file_dir = file_dir.slice(2, file_dir.length-1)
	}

    
    var title_string = "home/" + file_dir;
    title_string = filePathFix(title_string)
    add_title_link(title_string);
    set_recursive_cnt(file_recursive_cnt);

	var selete_m = document.getElementById('browsing_mode')
	for (var i = 0; i < selete_m.length; i++) { //遍历Radio 
		if (selete_m[i].value == browsing_mode) {
			selete_m[i].checked = true
			break;              
		}
	}
	// selete_m.value = browsing_mode
    selete_m.addEventListener('change', mode_change, false);
    
    // file_dir = path_dir_cvt(file_dir)
    req_url = get_load_callback_str() +  set_serch_url(file_dir, browsing_mode, file_recursive_cnt);
    //$('#file-title').html(dir_path);
    console.log(req_url);
	$.getJSON(req_url, function(data) {
		if (data['code'] != 0 &&  data['code'] != 1) {
		    alert("服务器加载失败")
            return;
        }
        show_list = data['file_list'];
        set_load_callback(data)
		/*目录显示，一直都在*/
		var file_list = data['dir_list'];
		if (file_list.length != 0) {
			var list = $('#dir_list');
			file_list.forEach(function(data) {
                dir_url = set_serch_url(file_dir + '/' + data, browsing_mode, file_recursive_cnt);
                dir_url = "browsing.html?" + dir_url
                dir_url = 'href="' + dir_url + '"'
                dir_url = "<a " + dir_url + ">" + "<txt>" + data + "</txt></a>"
				list.append('<li>' + dir_url + '</li>')
			});
		} else {
			$("#dir_contex").attr("style","display:none;");
			$("#file_contex").attr("style","width:90%;");
		}
		console.log(show_list);
		if (show_list.length != 0) {
			if (browsing_mode != 'file') {
				start_show();
			}
			list = $('#file_list');
			
			show_list.forEach(function(data) {
                url = '"store/' + file_dir + '/' + data + '"'
				download_info = ""
				var index = data.lastIndexOf(".");
				var suffix = data.substring(index+1).toLowerCase();
				if (suffix == "txt" || suffix == "wav" || suffix == "mp3") {
					download_info = "download='" + data + "'"
                }
                img_url = url + download_info
                img_url = 'href=' + img_url
                img_url = "<a " + img_url + ">" + "<txt>" + data + "</txt></a>"
				list.append('<li>' + img_url + '</li>')
			});
		} else {
			$("#file_contex").remove()
			$("#dir_contex").attr("style","width:90%;");
        }
        
        var list = document.getElementsByTagName("li");
        for (var i = 0; i < list.length; i++) {
            //为a 注册鼠标进入事件
            var len_w = list[i].offsetWidth
           
            var aLi = list[i].children;//获取ul元素的所有元素子节点
            // alert(aLi.length)
            for (var j = 0; j < aLi.length; j++) {
                var txt_li = aLi[j].children

                for (var k = 0; k < txt_li.length; k++) {
                    if (txt_li[k].nodeName === 'TXT') {
                        var txt = txt_li[k];
                        if ((len_w * 0.90) > txt.offsetWidth) {
                            // alert(a.offsetWidth)
                            // alert(len_w)
                            continue
                        }
                        txt.onmouseover = function () {
                            //设定鼠标行为，滚动
                            this.style.animation = "6s wordsLoop linear infinite normal";
                        };
                        //为li注册鼠标离开事件
                        txt.onmouseout = function () {
                            //取消滚动
                            this.style.animation = "";
                        };
                    }
                }
            }
        }
		//var s = len.toString();
		//alert(s); //将输出 String
     });
});