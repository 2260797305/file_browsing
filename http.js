
var fs = require("fs");
var express = require('express');
var app = express();
var SqliteDB = require('./data/sqlite.js').SqliteDB;
var HOST = "192.168.31.111"; // 请改成实际的ip地址
                        // 后面的图片的URL会使用这个变量来构造
var PORT = 8089;
var db_file = "./data/FileB.db";

var sqliteDB = new SqliteDB(db_file)

var createTableSql = "create table if not exists favorite_list(url KEY NOT NULL);";
console.log(createTableSql)
sqliteDB.createTable(createTableSql);

createFTableSql = "create table if not exists history_list(url KEY NOT NULL);";
console.log(createTableSql)
sqliteDB.createTable(createTableSql);
/*
var insertFavSql = "insert into favorite_list(url) values(?)";
var tileData = [["aaaa"], ["bbbb"], ["cccc"], ["dddd"]];
sqliteDB.insertData(insertFavSql, tileData);
*/
var querySql = 'select * from favorite_list';
sqliteDB.queryData(querySql, dataDeal);


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
 * 获取指定章节的url
 * 0: 上一章节
 * 1: 下一章节
 * browsing_mode: 
 * -1： 只遍历目录
 *  0： 遍历文件、目录
 *  1： 遍历图片
 *  2： 遍历视频
 *  3： 遍历音频
 */

function Traversing_the_directory(dir, dir_list, file_list, browsing_mode) {
    files = fs.readdirSync(dir)

    if (files.length != 0) {
        files.forEach(function(data) {
			var stats = fs.statSync(dir + "/" + data);
			if (stats.isFile()) {
                if (browsing_mode == 0) {
                    file_list.push(data)
                } else if (browsing_mode == 1) {
                    console.log('find pic')
                    var suffixIndex = data.lastIndexOf(".");
                    var suffix = data.substring(suffixIndex+1).toUpperCase(); 
                    if(suffix=="BMP"||suffix=="JPG"||suffix=="JPEG"||suffix=="PNG"||suffix=="GIF") {
                        file_list.push(data)
                    }
                } else if (browsing_mode == 2) {
                    console.log('find video')
                    var suffixIndex = data.lastIndexOf(".");
                    var suffix = data.substring(suffixIndex+1).toUpperCase(); 
                    if(suffix=="MP4") {
                        file_list.push(data)
                    }
                } else if (browsing_mode == 3) {
                    console.log('find audio')
                    var suffixIndex = data.lastIndexOf(".");
                    var suffix = data.substring(suffixIndex+1).toUpperCase(); 
                    if(suffix=="MP3") {
                        file_list.push(data)
                    }
                }
			} else if (stats.isDirectory()) {
				dir_list.push(data)
			}
        }); 
        console.log("dir_list.length %d", dir_list.length);
        console.log("file_list.length %d", file_list.length);
    
        
        if (dir_list.length != 0) {
            dir_list.sort(function (lhs, rhs) {
                //按照时间排序
                return fs.statSync(dir + "/" + lhs).mtime.getTime() - fs.statSync(dir + "/" + rhs).mtime.getTime()
                //return parseInt(lhs.split('.')[0]) - parseInt(rhs.split('.')[0]);
            });
        }
        
        if (file_list.length != 0){
            file_list.sort(function (lhs, rhs) {
                return parseInt(lhs.split('.')[0]) - parseInt(rhs.split('.')[0]);
            });
            console.log("pic_list.length %d", file_list.length);
        }
    };
};

function get_select_dir(old_dir, dirct) {
    console.log("olddir %s", old_dir);
    var index = old_dir .lastIndexOf("\/");  
    var parent_dir = old_dir.substring(0, index);
    var sub_dir = old_dir.substring(index+1, old_dir.length);

    var dir_list = new Array();
    var file_list = new Array();
    var pic_list = new Array();

    var dir =  __dirname + '/public/store/' + parent_dir;
    var cur_dir_idx = 0;
    Traversing_the_directory(dir, dir_list, file_list, -1);
    for (var i = 0;  i < dir_list.length; i++) {
        var name = dir_list[i];
        if (name == sub_dir) {
            cur_dir_idx = i;
            break;
        }
    }

    if (dirct == 0) {
        if (cur_dir_idx == 0) {
            sub_dir = parent_dir;
        } else {
            sub_dir = parent_dir + "/" + dir_list[cur_dir_idx - 1];
        }
    } else if (dirct == 1) {
        if (cur_dir_idx == (dir_list.length - 1)) {
            sub_dir = parent_dir;
        } else {
            sub_dir = parent_dir + "/" + dir_list[cur_dir_idx + 1];
        }
    }
    console.log("find dir %s", sub_dir);
    return sub_dir;
};

/**
 * 获取漫画的上一章节
 */
app.get('/get_prev_dir', function (req, res) {
    console.log("获取上一个章节");
    var file_name = req.query.file_dir;
     var new_dir = get_select_dir(file_name, 0);
    res.jsonp({'find_dir': new_dir, 'code': 0});
});


/**
 * 获取漫画的下一章节
 */
app.get('/get_next_dir', function (req, res) {
    var file_name = req.query.file_dir;
    var new_dir = get_select_dir(file_name, 1);
    res.jsonp({'find_dir': new_dir, 'code': 0});
});

/**
 * 获取漫画列表
 */
app.get('/get_file_list', function (req, res) {

    var file_name = req.query.file_dir;
	var browsing_mode = req.query.browsing_mode;
    if (!file_name) {
		file_name = ""
    }
    console.log(browsing_mode)
    if (!browsing_mode) {
        console.log("no mode set????");
        browsing_mode = 0;
    } else {
        console.log("browsing_mode = " + browsing_mode)
    }
	var dir = __dirname + '/public/store/' + file_name
    console.log("dir %s", dir);
    
    var dir_list = new Array();
    var file_list = new Array();
    var pic_list = new Array();
    Traversing_the_directory(dir, dir_list, file_list, browsing_mode);
    console.log("dir_list.length %d", dir_list.length);
    console.log("file_list.length %d", file_list.length);
    res.jsonp({'dir_list': dir_list, 'file_list': file_list, 'code': 0});
});

var server = app.listen(PORT, HOST, function () {
	console.log("\n应用实例，访问地址为 http://%s:%s\n", HOST, PORT)
});



function dataDeal(objects){
    for(var i = 0; i < objects.length; ++i){
        console.log(objects[i]);
    }
}