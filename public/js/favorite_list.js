favorite_talbe_list = 0


$(function() {
    var list = $('#file-title');
    var url = "/browsing.html?file_dir=/&browsing_mode=file&recursive_cnt=1&loop_mode=dir_order"
	list.append('<a  style="text-decoration:none" href="' + url + '">' + "<span></span>" + '</style="text-decoration:none">')
	list.append("<span>&nbsp;&nbsp;&nbsp;&nbsp;</span>")

    req_url = "/get_favorite_list"
    console.log(req_url);

    document.getElementById("create_fav_button").addEventListener('click', create_fav_action, false);

	$.getJSON(req_url, function(data) {
		if (data['code'] != 0 &&  data['code'] != 1) {
		    alert("服务器加载失败")
            return;
		}
        console.log(data)

		favorite_talbe_list = data['Favorites_list'];
        var list = $('#favorite_list_from');

        favorite_talbe_list.forEach(function(data) {
            url = '<div class= "from_option">'
            url = url + '<label><input name="delete_fav" type="radio" value="'+ data + '"/><span style="color: #b5ffe0;">'+ data +'</span> </label> '
            url = url + '</div>'
            list.append(url)
        });

        list = document.getElementById('favorite_list_from')
        list.addEventListener('change', delete_fav, false);
     });
});

function create_fav_action() {
    fav_name = document.getElementById("create_fav_input").value
    console.log(fav_name)

    if(confirm("确定要创建收藏夹: " + fav_name) !=true) {
        return
    }

    request_url = '/add_favorite_list?Favorites_name=' + fav_name
	$.getJSON(request_url, function(data) {
		if (data["code"] != 0) {
			alert("创建失败" + data['reson']);
			return;
		}
		alert("创建成功")
        location.reload()
	});

}

function create_fav_key_func(event)
{
	var evt = event || window.event;
	// 之前这里有一个 bug:如果返回 false，意味着其他的 hook 无法接受到此 event；
	if(evt.keyCode==13) {
		create_fav_action();
		return false;
	} else {
		console.log(evt.keyCode)
		return false;
	}

    create_fav_action();
}

function delete_fav()
{
    var fav_name = null;
    var obj = document.getElementById('favorite_list_from')
    for (var i = 0; i < obj.length; i++) { //遍历Radio 
        if (obj[i].checked) {
            fav_name = obj[i].value;
            break;              
        }
    }

    console.log(fav_name)

    if (!fav_name) {
        return
    }
    if(confirm("确定要删除收藏夹: " + fav_name) !=true) {
        return
    }

    request_url = '/del_favorite_list?Favorites_name=' + fav_name
	$.getJSON(request_url, function(data) {
		if (data["code"] != 0) {
			alert("删除失败" + data['reson']);
			return;
		}
		alert("删除成功")
        location.reload()
	});
}