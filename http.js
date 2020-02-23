var fs = require("fs");
var express = require('express');
var app = express();

var HOST = "192.168.31.111"; // 请改成实际的ip地址
                        // 后面的图片的URL会使用这个变量来构造
var PORT = 8089;

app.use('/', express.static('public'));


/**
 * 错误提示
 */
var ErrorHelper = {
    'internal_error': function () {
        return {
            'msg': 'something wrong with server',
            'code': 1
        };
    },
    'missing_param': function (param) {
        return {
            'msg': 'missing param: ' + param,
            'code': 2
        };
    },
    'error_param': function (param, data) {
        return {
            'msg': 'the param ' + param + '(' + data + ') is illegal',
            'code': 3
        }
    },
    'not_found': function (param) {
        return {
            'msg': 'cannot find ' + param,
            'code': 4
        };
    }
};



/**
 * 检查参数格式
 */
function checkParam(param) {
    return /^[^\.\\\/]+$/.test(param);
}


//  POST 请求
app.post('/', function (req, res) {
   console.log("主页 POST 请求");
   res.send('Hello POST');
});

app.get('/process_get', function (req, res) {
 
   // 输出 JSON 格式
   var response = {
       "first_name":req.query.first_name,
       "last_name":req.query.last_name
   };
   console.log(response);
   res.end(JSON.stringify(response));
});

/**
 * 获取漫画列表
 */
app.get('/get_file_list', function (req, res) {

    var file_name = req.query.file_dir;
	
    if (!file_name) {
		file_name = ""
    }
	var dir = __dirname + '/public/store/' + file_name
	console.log("dir %s", dir);
    fs.readdir(dir, function (err , files) {
        if (err) {
			console.log("读取目录失败");
			return console.error(err);
        }
		var dir_list = new Array();
        var file_list = new Array();
        var pic_list = new Array();
		files.forEach(function(data) {
			var stats = fs.statSync(dir + "/" + data);
			if (stats.isFile()) {
                var suffixIndex = data.lastIndexOf(".");
                var suffix = data.substring(suffixIndex+1).toUpperCase(); 
                if(suffix!="BMP"&&suffix!="JPG"&&suffix!="JPEG"&&suffix!="PNG"&&suffix!="GIF") {
                    file_list.push(data)
                } else {
                    pic_list.push(data)
                }
			} else if (stats.isDirectory()) {
				dir_list.push(data)
			}
        });  
        console.log("dir_list.length %d", dir_list.length);
        console.log("file_list.length %d", file_list.length);
        console.log("pic_list.length %d", pic_list.length);
        if (dir_list.length == 0) {
            dir_list.sort(function (lhs, rhs) {
                return parseInt(lhs.split('.')[0]) - parseInt(rhs.split('.')[0]);
            });
        }
        if (file_list.length == 0){
            file_list.sort(function (lhs, rhs) {
                return parseInt(lhs.split('.')[0]) - parseInt(rhs.split('.')[0]);
            });
        }
        if (pic_list.length == 0){
            pic_list.sort(function (lhs, rhs) {
                return parseInt(lhs.split('.')[0]) - parseInt(rhs.split('.')[0]);
            });
            console.log("pic_list.length %d", pic_list.length);
        }
        res.jsonp({'dir_list': dir_list, 'file_list': file_list, 'pic_list': pic_list, 'code': 0});
    });
});

var server = app.listen(PORT, HOST, function () {
	console.log("\n应用实例，访问地址为 http://%s:%s\n", HOST, PORT)
});



/*var fs = require("fs");

var data = fs.readFileSync('input.txt');

console.log(data.toString());
console.log("程序执行结束!");
*/
