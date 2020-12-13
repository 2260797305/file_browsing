var show_list = new Array();
var cur_page = 0;
var is_show_pic = 0;
var browsing_mode = 0; /*0:文件模式; 1:漫画模式; 2:视频模式; 3:音乐模式*/
var golbol_volume = 1;


function add_title_link(title) {
	/*为标题添加各级目录链接*/
	var list = $('#file-title');
	url = "/browsing.html";
	list.append('<a  style="text-decoration:none" href="' + url + '">' + title  + '</a>');
}

$(function() {
	var title_string = "home";
	add_title_link(title_string);

	var host = window.location.host;
	$.getJSON('http://' + host + '/get_favorite_list', function(data) {
		if (data['code'] != 0 &&  data['code'] != 1) {
		    $('#wrong-content').text(JSON.stringify(data));
            metroDialog.open('#dialog');
            return;
		}
		/*目录显示，一直都在*/
		var file_list = data['dir_list'];
		if (file_list.length != 0) {
			var list = $('#dir_list');
			file_list.forEach(function(data) {
				list.append('<li class="list bg-grayLight"><a href="browsing.html?file_dir=' + '/' + data + '" ><span class="list-title">' + data + '/</span></a></li>')
			});
		} else {
			$("#dir_contex").remove()
		}

		show_list = data['file_list'];
		if (show_list.length != 0) {
			if (browsing_mode != 0) {
				start_show();
			}
			list = $('#file_list');
			show_list.forEach(function(data) {
				list.append('<li class="list bg-grayLight"><a href="store/' + file_dir + '/' + data + '" ><span class="list-title">' + data + '</span></a></li>')
			});
		} else {
			$("#file_contex").remove()
			$("#dir_contex").attr("style","width:90%;");
		}
		//var s = len.toString();
		//alert(s); //将输出 String
	});

});
