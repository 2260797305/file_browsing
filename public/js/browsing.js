
function get_load_callback_str()
{
	req_url = '/get_file_list?'
	return req_url
}

function set_load_callback(data)
{
	is_star = data['is_star']
	show_star(is_star);
}

function set_recursive_cnt(file_recursive_cnt)
{

	var selete_s = document.getElementById('file_recursive_cnt');
	for (var i = 0; i < selete_s.length; i++) { //遍历Radio 
		if (selete_s[i].value == file_recursive_cnt) {
			selete_s[i].checked = true
			break;              
		}
	}

	selete_s.addEventListener('change', recursive_change, false);
}