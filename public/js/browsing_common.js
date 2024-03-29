var show_list = new Array();
var show_shuffle_order = new Array();
var cur_page = 0;
var is_show_pic = 0;
var browsing_mode = 'file';
var golbol_volume = 1;
var is_star = 0;
var need_play_next = 0;
var loop_mode = "dir_order" //file_order, file_loop, file_shuffle
var storage;
var file_recursive_cnt = 1;
var box_w;
var box_h;
var size_timer;
var show_list_timer;
var shuffle_idx = 0;
var shuffle_offset = 0;

var start_list = new Array()
var favorite_talbe_list = new Array()

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
        // console.log(file_name);
    }
    if (file_name[0] == "/") {
        file_name = file_name.substring(1);
    }
    // file_name = file_name.replace("'", '"')
    // file_name = file_name.replace('"', '\'"')
    return file_name;
}

function set_serch_url(file_dir, browsing_mode, file_recursive_cnt, loop_mode)
{
	file_dir = filePathFix(file_dir)
	console.log(file_dir);
	if (loop_mode == null) {
		loop_mode = "dir_order"
	}
    serch_url = "file_dir=" + file_dir + "&browsing_mode=" + browsing_mode + "&recursive_cnt=" + file_recursive_cnt + "&loop_mode=" + loop_mode;
    return serch_url
}

function show_icon_by_loop_mode(loop_mode) {
	var txt = ""

	if (loop_mode == "file_order") {
		txt =  ""
	} else if (loop_mode == "file_loop") {
		txt = ""
	} else if (loop_mode == "file_shuffle") {
		txt = ""
	} else if (loop_mode == "dir_order") {
		txt = ""
	} else {
		return
	}
	console.log("new loop_mode " + loop_mode);
	txt = "<span>" + txt + "</span>"
	$("#loop_mode").find("span").remove();
	$("#loop_mode").append(txt);
}

function show_star() {
	// // console.log(is_star);
	if (is_star == 1) {
		$("#start_div").attr("style","color: yellow;");
	} else {
		$("#start_div").attr("style","color: black;");
	}
	console.log(start_list)
	console.log(favorite_talbe_list)

	$("#ctr_favorite_from").find("div").remove();
	$("#show_favorite_from").find("div").remove();

	var ctr_list = $('#ctr_favorite_from');
	var show_list = $('#show_favorite_from');

	favorite_talbe_list.forEach(function(data, index, arr) {
		var url1 = '<div class= "from_option"><label><input name="start_item" type="radio" value="'
		url1 = url1 + data + '"/><span style="'

		if (start_list[index] == 1) {
			url1 = url1 + 'color: black; background-color: yellow;">'
		} else {
			url1 = url1 + 'color: #b5ffe0;">'
		}

		url1 = url1 +  data + '</span></label> </div>'
		
		var url = '<div class= "from_option"><label><input name="shwo_item" type="radio" value="'
		url = url + data + '"/><span style="color: #b5ffe0;">'+ data +'</span></label> </div>'

		ctr_list.append(url1)
		show_list.append(url)
	})

	// 追加最后一个 item，作为收藏夹列表的管理。
	var url = '<div class= "from_option"><label><input name="shwo_item" type="radio" value="'
	url = url + "list_manager" + '"/><span style="color: #e3b5ff;">'+ "list" +'</span></label> </div>'

	show_list.append(url)

	selete_m = document.getElementById('ctr_favorite_from')
	selete_m.addEventListener('change', set_start_file, false);

	selete_m = document.getElementById('show_favorite_from')
	selete_m.addEventListener('change', show_start_file, false);
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
    url = "favorite.html?" + set_serch_url("", 'file', 1, loop_mode)
	window.location.replace(url)
}


function find_cur_is_star(file) {
	request_url = '/is_start_file?' + "file_dir=" + file
	console.log(request_url);
	$.getJSON(request_url, function(data) {
		// console.log(data);
		if (data["code"] != 0) {
			// show_star(0);
			// is_star = 0;
			return;
		} else {
			is_star = 0
			start_list = new Array(data['is_star'].length)
			favorite_talbe_list = new Array(data['favorite_talbe_list'].length)
			// console.log(data['is_star'])
			// console.log(data['favorite_talbe_list'])
			data['favorite_talbe_list'].forEach(function(data1, i) {
				favorite_talbe_list[i] = data1
			})
			favorite_talbe_list.sort()
			// console.log(favorite_talbe_list)
			// console.log(data['favorite_talbe_list'])

			favorite_talbe_list.forEach(function(data0, idx0) {
				data['favorite_talbe_list'].forEach(function(data1, idx1) {
					if (data0 == data1) {
						// console.log(data['is_star'][idx1])
						// console.log(idx0)
						// console.log(idx1)
						// console.log(data0)
						// console.log(data1)
						start_list[idx0] = data['is_star'][idx1]
						if (start_list[idx0] == 1) {
							is_star = 1
						}
					}
				})
			}) 
			// console.log(start_list)
			show_star(1);
			// is_star = 1;
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


function show_ctr_favorite_list(){
	$("#ctr_favorite_from").attr("style","display:;width:80px;");
	my_list=document.getElementById("start_div");
	my_list.style.height=(30 + 28 * favorite_talbe_list.length) + 'px'
	// my_list.style.width=80+'px'
}

function hide_ctr_favorite_list(){
	my_list=document.getElementById("start_div");
	my_list.style.height=30 + 'px'
	$("#ctr_favorite_from").attr("style","display:none;");
}

function show_favorite_content(){
	// $("#show_favorite_from").attr("style","height:80px;display:");

	$("#show_favorite_from").attr("style","display:;width:80px;");
	my_list=document.getElementById("show_start");
	my_list.style.height=(55 + 28 * favorite_talbe_list.length) + 'px'

}

function hide_favorite_content(){
	my_list=document.getElementById("show_start");
	my_list.style.height=30 + 'px'
	$("#show_favorite_from").attr("style","display:none;");
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
	if(confirm("确定要删除文件？\n" + file_dir) !=true) {
			return
	}
    
	request_url = '/delete_file?' + set_serch_url(file_dir, browsing_mode, file_recursive_cnt, loop_mode)
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

function show_pic_slid()
{
	javascript:scroll(0,0);
	var file_dir = getQueryString('file_dir');
	src = 'store/' + file_dir + "/" + show_list[cur_page]
	myPic = document.getElementById("show_ctx");
	myPic.src = src;
}

function size_increase()
{
	console.log("size_increase");
	if (browsing_mode == 'file') {
		return
	}
	myPic = document.getElementById("show_ctx");
	// myPic.src = src;

	console.log(myPic.width);	
	// console.log(myPic.height);
	console.log(box_w);
	// console.log(box_h);

	if (myPic.width + 20 < box_w - 130) {
		myPic.width += 20
		// myPic.css("height", myPic.width);
		// console.log(myPic.width);	
	} else {
		myPic.width = box_w - 130;
	}
	storage = window.localStorage;
	storage.setItem("pic_width", myPic.width)
}


function size_decrease()
{
	if (browsing_mode == 'file') {
		return
	}
	myPic = document.getElementById("show_ctx");
	// myPic.src = src;
	if (myPic.width - 20 > 100) {
		myPic.width -= 20
	}

	storage = window.localStorage;
	storage.setItem("pic_width", myPic.width)
}


function size_change(direct)
{
	console.log(direct);
	if (direct > 0) {
		size_timer = setInterval(function(){
			size_increase()
		}, 10);
	} else {
		size_timer = setInterval(function(){
			size_decrease()
		}, 10);
	}
}

function reset_shuffle_list(set_cur_page)
{
	shuffle_idx = 0;
	console.log("reset_shuffle_list")
	console.log(set_cur_page);

	show_shuffle_order = new Array(show_list.length);

	for (i = show_list.length - 1; i >= 0; i--) {
		show_shuffle_order[i] = i;
	}

	for (i = show_list.length - 1; i >= 0; i--) {
		shuffle_idx = Math.floor(Math.random() * (i+1));
		tmp = show_shuffle_order[i]
		show_shuffle_order[i] = show_shuffle_order[shuffle_idx]
		show_shuffle_order[shuffle_idx] = tmp
	}

	if (set_cur_page != -1) {
		// 固定将洗牌后的结果，当前播放的设定为第一个。目标是当随机列表遍历完成时，再重新洗牌；
		for (i = 0; i < show_shuffle_order.length; i++) {
			if (show_shuffle_order[i] == cur_page) {
				tmp = show_shuffle_order[i];
				show_shuffle_order[i] = show_shuffle_order[0];
				show_shuffle_order[0] = tmp;
				break;
			}
		}
	}
	shuffle_idx = 0;
	shuffle_offset = 0;
	cur_page = show_shuffle_order[0];
	console.log(show_shuffle_order)
}

function size_timer_clear(){
	console.log("clear timer");
	clearInterval(size_timer);
  }


function loop_mode_change()
{
	console.log(loop_mode);
	if (loop_mode == "dir_order") {
		loop_mode = "file_order"
	} else if (loop_mode == "file_order") {
		loop_mode = "file_loop"
	} else if (loop_mode == "file_loop") {
		loop_mode = "file_shuffle"
		reset_shuffle_list(cur_page);
	} else if (loop_mode == "file_shuffle") {
		loop_mode = "dir_order"
	} else {
		return
	}
	show_icon_by_loop_mode(loop_mode);
}

function shwo_cur_pic(page) {
	console.log("cur_page = " + page)
	// console.log(show_list)

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

	// input = document.getElementById("page_input")
	// input.value = page + 1

	storage.setItem("cur_page", page)
	if (browsing_mode == 'picture') {
		src = 'store/' + file_dir + "/" + show_list[page]
		myPic = document.getElementById("show_ctx");
		if (myPic)  {
			myPic.src = "../img/loading.png";
			setTimeout("show_pic_slid()",10);
		} else {
			var imgStr = '<img id="show_ctx" src="store/' + file_dir + "/" + show_list[page] + '">';
			$("#center_box").append(imgStr);
			myPic = document.getElementById("show_ctx");
			storage = window.localStorage;
			var tmp = storage.getItem("pic_width")
			if (tmp) {
				myPic.width = parseFloat(tmp)
			} else {
				storage.setItem("pic_width", box_w - 130)
			}
		}
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
			var vidstr = '<video width="400" object-fit:fill id = "video1" controls autoplay="autoplay" onended="play_next_by_end_or_error()" onerror="play_next_by_end_or_error()" onplaying="playe__vent()" onvolumechange="volume_change()" > <source src="' + new_src + '" type="video/mp4"> </video>';
			// var vidstr = '<video object-fit:fill id = "video1"  > <source src="' + new_src + '" type="video/mp4"> </video>';

			$("#center_box").append(vidstr);
			// $("#max_ctx11").append(vidstr);
			
			myVid = document.getElementById("video1");
			myVid.volume = golbol_volume;
			myVid.focus()
			video_hw_set()
			javascript:scroll(0,0);
		}
    }
    find_cur_is_star(file_dir + "/" + show_list[page]);
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

	if (loop_mode == "file_shuffle") {
		reset_shuffle_list(-1);
	}

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
		request_url = '/get_prev_dir?' + set_serch_url(file_dir, browsing_mode, file_recursive_cnt, loop_mode)
	} else {
		request_url = '/get_next_dir?' + set_serch_url(file_dir, browsing_mode, file_recursive_cnt, loop_mode)
	}
	$.getJSON(request_url, function(data) {
		if (data["code"] != 0) {
			alert("寻找上、下级目录错误");
			return;
        }
        
		location.href = "browsing.html?" + set_serch_url(data["find_dir"], browsing_mode, file_recursive_cnt, loop_mode)
	});
}

function prev_img(obj) {
	if (loop_mode == "dir_order") {
		if (cur_page == 0) {
			if(confirm("已经是此章节第1页了，要打开上一个章节吗？")==true){
				jump_chapter(0);
			}
		} else {
			cur_page -= 1;
		}
	} else if (loop_mode == "file_order") {
		if (cur_page == 0) {
			cur_page = show_list.length - 1
		} else {
			cur_page -= 1;
		}
	} else if (loop_mode == "file_loop") {
		cur_page = cur_page;
	} else if (loop_mode == "file_shuffle"){
		shuffle_offset -= 1;

		if (Math.abs(shuffle_offset) >= show_shuffle_order.length) {
			reset_shuffle_list(-1);
		} else {
			if (shuffle_idx == 0) {
				shuffle_idx = show_shuffle_order.length - 1
				// reset_shuffle_list(-1);
				// shuffle_idx = 0;
			} else {
				shuffle_idx -= 1;
			}
		}

		cur_page = show_shuffle_order[shuffle_idx]
		console.log(cur_page);
	} else {
		return
	}

	shwo_cur_pic(cur_page);
}

function next_img(obj) {
	if (loop_mode == "dir_order") {
		if (cur_page == (show_list.length - 1)) {
			if(confirm("已经是此章节最后一页了，要打开下一个章节吗？")==true){
				jump_chapter(1);
			}
		} else {
			cur_page += 1;
		}
	} else if (loop_mode == "file_order") {
		if (cur_page == (show_list.length - 1)) {
			cur_page = 0
		} else {
			cur_page += 1;
		}
	} else if (loop_mode == "file_loop") {
		cur_page = cur_page;
	} else if (loop_mode == "file_shuffle"){
		shuffle_offset += 1;
		if (Math.abs(shuffle_offset) >= show_shuffle_order.length) {
			reset_shuffle_list(-1);
		} else {
			if (shuffle_idx == (show_shuffle_order.length - 1)) {
				shuffle_idx = 0
				// 重新洗牌
				// reset_shuffle_list(-1);
			} else {
				shuffle_idx += 1;
			}
		}
		cur_page = show_shuffle_order[shuffle_idx]
	} else {
		return
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
		time = 1 /**1 秒变化 */
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
		} else if(event.keyCode == 37 /*←*/) {
			console.log("left");
			console.log(myVid.currentTime);
			myVid.currentTime !== 0 ? myVid.currentTime -= time : 1;
			console.log(myVid.currentTime);
		} else if(event.keyCode == 39 /*→*/) {
			console.log(myVid.currentTime);
			myVid.currentTime !== myVid.duration ? myVid.currentTime += time : 1;
			console.log("right");
			console.log(myVid.duration);
			console.log(myVid.currentTime);
		} else if (event.keyCode == 69 /*e*/) {
			step = myVid.duration/10; // 快进单位： 1/10 duration

			if (myVid.duration - myVid.currentTime > step) {
				myVid.currentTime += step;
			} else if (myVid.duration - myVid.currentTime > step/4) {
				myVid.currentTime = (myVid.duration - step/4);
			} else {
				next_img()
			}
		} else if (event.keyCode == 81 /*q*/) {
			step = myVid.duration/10; // 快退单位： 1/10 duration

			if (myVid.duration > step) {
				myVid.currentTime -= step;
			} else {
				myVid.duration = 0
			}
		}
		return true
	} else if (browsing_mode == 'picture') {
		//javascript:scroll(0,200);
	}
});

function page_select() {
	input = document.getElementById("page_input")
	
	var page = input.value
	console.log(page);

	if (!page) {
		return
	}
	if (is_show_pic != 0 && cur_page != (page - 1)) {
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
	var home_dir = 0;
	
	console.log(title);

	/** home 目录*/
	var url = "/browsing.html?file_dir=/&browsing_mode=file&recursive_cnt=1&loop_mode=dir_order"
	list.append('<a  style="text-decoration:none" href="' + url + '">' + "<span></span>" + '</style="text-decoration:none">')
	list.append("<span>&nbsp;&nbsp;&nbsp;&nbsp;</span>")
	dir_link.forEach(function(data) {
        if (!data) {
            return;
		}
		var url = new String();
		if (home_dir == 1) {
			url = "/browsing.html?file_dir=/&browsing_mode=file&recursive_cnt=1&loop_mode=dir_order"
			home_dir = 0;
			pre_dir = "windows/"
		} else {
			if (data == "/") {
				url.length = 0;
			} else {
                pre_dir = pre_dir + data;
				url = "browsing.html?" + set_serch_url(pre_dir, browsing_mode,file_recursive_cnt, loop_mode)
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
    // console.log(browsing_mode);
    // console.log(item);
    if (browsing_mode == 'file') {
        for (var i = 0; i < obj.length; i++) { //遍历Radio 
            // console.log(obj[i].value);
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
    new_url = old_url + "?"+ set_serch_url(file_dir, browsing_mode, file_recursive_cnt, loop_mode)
    location.href = new_url
}

function input_key_func(event)
{
	var evt = event || window.event;
	// 之前这里有一个 bug:如果返回 false，意味着其他的 hook 无法接受到此 event；
	if(evt.keyCode==13) {
		page_select();
		return false;
	} else {
		console.log(evt.keyCode)
		return false;
	}
}

function set_start_file()
{
	var item = null;
    var obj = document.getElementById('ctr_favorite_from')
    for (var i = 0; i < obj.length; i++) { //遍历Radio 
        if (obj[i].checked) {
            item = obj[i].value;
            break;              
        }
    }
    if (!item) {
        return
    }

	console.log(item)

	var file_dir = getQueryString('file_dir');
	if (file_dir == null) {
        file_dir = "/"
    }
    if (browsing_mode != 'file') {
        file_dir = file_dir + '/' +  show_list[cur_page]
    }
	var request_url = new String();
    // request_url = set_serch_url(file_dir, browsing_mode, file_recursive_cnt, loop_mode)
	// request_url = request_url + '&Favorites_name='+ item
	request_url = request_url + "file_dir=" + file_dir + '&Favorites_name='+ item

	for (var index = 0; index < favorite_talbe_list.length; index++) {
		data = favorite_talbe_list[index]
		if (data == item) {
			if (start_list[index] == 0) {
				request_url = '/set_favorite_content?' + request_url
				console.log(request_url)

				$.getJSON(request_url, function(data) {
					if (data["code"] != 0) {
						alert("收藏失败");
						var my_list=document.getElementById("start_div");
						my_list.style.height=30 + 'px'
						$("#ctr_favorite_from").attr("style","display:none;");
						return;
					}
					find_cur_is_star(file_dir)
					alert("收藏成功")

					var my_list=document.getElementById("start_div");
					my_list.style.height=30 + 'px'
					$("#ctr_favorite_from").attr("style","display:none;");
				});
			} else {	
				request_url = '/del_favorite_content?' + request_url
				$.getJSON(request_url, function(data) {
					if (data["code"] != 0) {
						alert("取消收藏失败");
						var my_list=document.getElementById("start_div");
						my_list.style.height=30 + 'px'
						$("#ctr_favorite_from").attr("style","display:none;");
						return;
					}
					find_cur_is_star(file_dir)
					alert("取消收藏成功")
					var my_list=document.getElementById("start_div");
					my_list.style.height=30 + 'px'
					$("#ctr_favorite_from").attr("style","display:none;");
				});
			}
			break
		}
	}
}

function show_start_file()
{
	var item = null;
    var obj = document.getElementById('show_favorite_from')
    for (var i = 0; i < obj.length; i++) { //遍历Radio 
        if (obj[i].checked) {
            item = obj[i].value;
            break;              
        }
    }
    if (!item) {
        return
    }


	console.log(item)

	if (item ==obj[obj.length-1].value) {
		window.location.href = "favorite_list.html"
	} else {
		url = "favorite.html?" + set_serch_url("", 'file', 1, loop_mode) + '&Favorites_name='+ item
		window.location.replace(url)
	}
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
	Favorites_name = getQueryString('Favorites_name');
    new_url = old_url + "?"+ set_serch_url(file_dir, browsing_mode, file_recursive_cnt, loop_mode)
	new_url = new_url + "&Favorites_name=" + Favorites_name
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
	console.log(box_h);
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
	loop_mode = getQueryString('loop_mode');
	show_icon_by_loop_mode(loop_mode)

	var file_dir = getQueryString('file_dir');
	if (file_dir == null) {
		file_dir = "";
	} else {
		//file_dir = file_dir.slice(2, file_dir.length-1)
	}

    
    var title_string = file_dir;
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
    req_url = get_load_callback_str() +  set_serch_url(file_dir, browsing_mode, file_recursive_cnt, loop_mode);
    //$('#file-title').html(dir_path);
	var Favorites_name = getQueryString('Favorites_name');
	if (Favorites_name != null) {
        req_url += '&Favorites_name=' + Favorites_name
	}
    console.log(req_url);
	$.getJSON(req_url, function(data) {
		if (data['code'] != 0 &&  data['code'] != 1) {
		    alert("服务器加载失败")
            return;
		}

		try {
			set_load_callback(data)
			console.log(data);
		} catch(e) {
			console.log(e);
		}

		show_list = data['file_list'];
		/*目录显示，一直都在*/
		var file_list = data['dir_list'];
		if (file_list.length != 0) {
			var list = $('#dir_list');
			file_list.forEach(function(data) {
                dir_url = set_serch_url(file_dir + '/' + data, browsing_mode, file_recursive_cnt, loop_mode);
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
		console.log(browsing_mode)
		$("#file_contex").attr("style","width:90%;display:");
		if (show_list.length != 0) {
			if (browsing_mode != 'file') {
				start_show();
			} else {
					list = $('#file_list');
					show_list.forEach(function(data) {
						var is_compressing = 0
						url = '"store/' + file_dir + '/' + data + '"'
						download_info = ""
						var index = data.lastIndexOf(".");
						var suffix = data.substring(index+1).toLowerCase();
						if (suffix == "txt" || suffix == "wav" || suffix == "mp3" || suffix == "epub") {
							download_info = "download='" + data + "'"
						} else if (suffix == "rar" || suffix == "zip" || suffix == "7z") {
							url = '"compressing.html?' + set_serch_url(file_dir + '/' + data, 'file', 1, loop_mode) + '"'
							console.log(url);
							is_compressing = 1
						}
						url = url + download_info
						url = 'href=' + url
						if (is_compressing) {
							url = url + 'target="_blank"'
						}
						url = "<a " + url + ">" + "<txt>" + data + "</txt></a>"
						list.append('<li>' + url + '</li>')
				});
			}
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

		if (browsing_mode == 'file') {
			if (Favorites_name == null || 1) {
				find_cur_is_star(file_dir)
			}
		}
		//var s = len.toString();
		//alert(s); //将输出 String
     });
});


//滚动动画
windowAddMouseWheel();
function windowAddMouseWheel() {
	var scrollFunc = function (e) {
		if (browsing_mode != "video") {
			return;
		}

		myVid=document.getElementById("video1");
		golbol_volume = myVid.volume;

		e = e || window.event;
		if (e.wheelDelta) {  //判断浏览器IE，谷歌滑轮事件
			if (e.wheelDelta > 0) { //当滑轮向上滚动时
				console.log("google 上");
				if (golbol_volume < 0.2) {
					golbol_volume += 0.001;
				} else if (golbol_volume + 0.1 <= 0.99) {
					golbol_volume += 0.1;
				} else  {
					golbol_volume = 1;
				}
				myVid.volume = golbol_volume;
			}
			if (e.wheelDelta < 0) { //当滑轮向下滚动时
				console.log("google 下");
				if (golbol_volume - 0.2 >= 0.01) {
					golbol_volume -= 0.1;
				} else if (golbol_volume >= 0.01) {
					golbol_volume -= 0.001;
				} else {
					golbol_volume = 0;
				}
				myVid.volume = golbol_volume;
			}
		} else if (e.detail) {  //Firefox滑轮事件
			if (e.detail> 0) { //当滑轮向上滚动时
				console.log("fox 上");
				if (golbol_volume < 0.2) {
					golbol_volume += 0.001;
				} else if (golbol_volume + 0.1 <= 0.99) {
					golbol_volume += 0.1;
				} else {
					golbol_volume = 1;
				}
				myVid.volume = golbol_volume;
			}
			if (e.detail< 0) { //当滑轮向下滚动时
				console.log("fox 下");
				if (golbol_volume - 0.2 >= 0.01) {
					golbol_volume -= 0.1;
				} else if (golbol_volume >= 0.01) {
					golbol_volume -= 0.001;
				} else {
					golbol_volume = 0;
				}
				myVid.volume = golbol_volume;
			}
		}
		console.log(golbol_volume);
	};
	//给页面绑定滑轮滚动事件
	if (document.addEventListener) {
		document.addEventListener('DOMMouseScroll', scrollFunc, false);
	}
	//滚动滑轮触发scrollFunc方法
	window.onmousewheel = document.onmousewheel = scrollFunc;
}
