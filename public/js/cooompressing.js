
function get_load_callback_str()
{
	req_url = '/compressing_dir?'
	return req_url
}

function set_load_callback(data)
{
    target = data['target']
    console.log(target);
    url = "browsing.html?" + set_serch_url(target, 'file', 1)
	window.location.replace(url)
}

function set_recursive_cnt(file_recursive_cnt)
{

}