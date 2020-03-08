
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
 *  4:  遍历漫画
 */

function Recursive_dir(Recursive_cnt, search_dir, pre_dir, browsing_mode, dir_list, file_list) {
    if (Recursive_cnt <= 0) {
        return;
    }

    Recursive_cnt = Recursive_cnt - 1;
    if (pre_dir.length != 0) {
        pre_dir = pre_dir + "/"
    }

    files = fs.readdirSync(search_dir)
    if (files.length != 0) { 
        files.forEach(function(data) {
            //console.log(data)
			var stats = fs.statSync(search_dir + "/" + data);
			if (stats.isFile()) {
                if (browsing_mode == 0) {
                    file_list.push(pre_dir + data)
                } else if (browsing_mode == 1) {
                    //console.log('find pic')
                    var suffixIndex = data.lastIndexOf(".");
                    var suffix = data.substring(suffixIndex+1).toUpperCase(); 
                    if(suffix=="BMP"||suffix=="JPG"||suffix=="JPEG"||suffix=="PNG"||suffix=="GIF") {
                        file_list.push(pre_dir + data)
                    }
                } else if (browsing_mode == 2) {
                    //console.log('find video')
                    var suffixIndex = data.lastIndexOf(".");
                    var suffix = data.substring(suffixIndex+1).toUpperCase(); 
                    if(suffix=="MP4") {
                        file_list.push(pre_dir + data)
                    }
                } else if (browsing_mode == 3) {
                    //console.log('find audio')
                    var suffixIndex = data.lastIndexOf(".");
                    var suffix = data.substring(suffixIndex+1).toUpperCase(); 
                    if(suffix=="MP3") {
                        file_list.push(pre_dir + data)
                    }
                } else if (browsing_mode == 4) {
                    //console.log('find cartoon')
                    /*todo*/
                } 
			} else if (stats.isDirectory()) {
                if (Recursive_cnt > 0) {
                    Recursive_dir(Recursive_cnt, search_dir + "/" + data, pre_dir + "/" + data, browsing_mode, dir_list, file_list);
                } else {
                    dir_list.push(pre_dir + data)
                }
			}
        }); 
        //console.log("dir_list.length %d", dir_list.length);
        //console.log("file_list.length %d", file_list.length);
    
        if (pre_dir.length == 0) {
            if (dir_list.length != 0) {
                dir_list.sort(function (lhs, rhs) {
                    //按照时间排序
                    /** 
                    return fs.statSync(search_dir + "/" + lhs).mtime.getTime() - fs.statSync(search_dir + "/" + rhs).mtime.getTime()*/
                    return parseInt(lhs.split('.')[0]) - parseInt(rhs.split('.')[0]);
                });
            }
            
            if (file_list.length != 0){
                file_list.sort(function (lhs, rhs) {
                    return parseInt(lhs.split('.')[0]) - parseInt(rhs.split('.')[0]);
                });
                //console.log("pic_list.length %d", file_list.length);
            }
        }
    }
}

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
    
    var Recursive_cnt = 1;
    Recursive_dir(Recursive_cnt, dir, "", -1, dir_list,file_list)
    
    //Traversing_the_directory(dir, dir_list, file_list, -1);
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
 * 获取收藏的目录
 */
app.get('/get_favorite_list', function (req, res) {
    console.log("获取收藏的路径");
    var dir_list = new Array()
    var file_list = new Array()

    var a = "//jwioq/e/j////f/q//o//efjqo/";
    while (1) {
        var b = a.replace(/\/\//, "/");
        if (b == a) {
            if (b[0] == "/") {
                a = b.substring(1);
            }
            break;
        }
        a = b;
    }
    console.log(a);

    var querySql = 'select * from favorite_list';
    sqliteDB.queryData(querySql, function data_Deal(objects) {
        for(var i = 0; i < objects.length; ++i){
            //console.log(objects[i]);
            dir_list.push(objects[i]["url"])
        }
        console.log(dir_list.length)
    
        //dir_list.push("windows/miku/f/download")
        res.jsonp({'dir_list': dir_list, 'file_list': file_list, 'code': 0});
    });
});


function dir_is_start(file_name) {
    /**规范路径 */
    while (1) {
        var b = file_name.replace(/\/\//, "/");
        if (b == file_name) {
            file_name = b;
            break;
        }
    }
    if (file_name[0] == "/") {
        file_name = file_name.substring(1);
    }

    var querySql = "select * from favorite_list where url='" + file_name + "'";
    console.log(querySql)
    sqliteDB.queryData(querySql, function data_Deal(objects) {
        console.log(objects.length)
        if (objects.length == 0) {
            return 0;
        } else {
            return 1;
        }
    });
}

/**
 * 添加收藏目录
 */
app.get('/set_favorite_list', function (req, res) {
    var file_name = req.query.file_dir;
 
    if (file_name.length == 0 || file_name == "/") {
        res.jsonp({'code': 0});
    }
    console.log("获添加的收藏路径: " + file_name);
    /**规范路径 */
    while (1) {
        var b = file_name.replace(/\/\//, "/");
        if (b == file_name) {
            file_name = b;
            break;
        }
    }
    if (file_name[0] == "/") {
        file_name = file_name.substring(1);
    }
    console.log("获添加的收藏路径: " + file_name);

    var querySql = "select * from favorite_list where url='" + file_name + "'";
    console.log(querySql)
    sqliteDB.queryData(querySql, function data_Deal(objects) {
        console.log(objects.length)
        if (objects.length == 0) {
            var inquirytFavSql = "insert into favorite_list(url) values(?)";
            var tileData = [[file_name]];
            sqliteDB.insertData(inquirytFavSql, tileData);
            res.jsonp({'code': 0});
        } else {
            res.jsonp({'code': -1});
        }
    });


});

/**
 * 删除收藏目录
 */
app.get('/del_favorite_list', function (req, res) {
    var file_name = req.query.file_dir;
 
    if (file_name.length == 0) {
        file_name = "/"
    }
    console.log("删除的收藏路径: " + file_name);
    /**规范路径 */
    while (1) {
        var b = file_name.replace(/\/\//, "/");
        if (b == file_name) {
            file_name = b;
            break;
        }
    }
    if (file_name[0] == "/") {
        file_name = file_name.substring(1);
    }
    console.log("删除的收藏路径: " + file_name);
    var delFavSql = "delete from favorite_list where url='" + file_name + "'";
    //var tileData = [[file_name]];
    sqliteDB.executeSql(delFavSql);
    res.jsonp({'code': 0});
});

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
    var Recursive_cnt = 1;
    if (browsing_mode == 2) {
        Recursive_cnt = 3;
    }
    Recursive_dir(Recursive_cnt, dir, "", browsing_mode, dir_list, file_list)
    //Traversing_the_directory(dir, dir_list, file_list, browsing_mode);
    console.log("dir_list.length %d", dir_list.length);
    console.log("file_list.length %d", file_list.length);

    /**规范路径 */
    while (1) {
        var b = file_name.replace(/\/\//, "/");
        if (b == file_name) {
            file_name = b;
            break;
        }
    }
    if (file_name[0] == "/") {
        file_name = file_name.substring(1);
    }
    var querySql = "select * from favorite_list where url='" + file_name + "'";
    console.log(querySql)
    sqliteDB.queryData(querySql, function data_Deal(objects) {
        console.log(objects.length)
        if (objects.length == 0) {
            /**not start */
            res.jsonp({'is_star':0, 'dir_list': dir_list, 'file_list': file_list, 'code': 0});
        } else {
            res.jsonp({'is_star':1, 'dir_list': dir_list, 'file_list': file_list, 'code': 0});
        }
    });
    //res.jsonp({'dir_list': dir_list, 'file_list': file_list, 'code': 0});
});

var server = app.listen(PORT, HOST, function () {
	console.log("\n应用实例，访问地址为 http://%s:%s\n", HOST, PORT)
});



function dataDeal(objects){
    for(var i = 0; i < objects.length; ++i){
        console.log(objects[i]);
    }
}