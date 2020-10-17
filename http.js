
var fs = require("fs");
var express = require('express');
var querystring = require('querystring');
var app = express();
var SqliteDB = require('./data/sqlite.js').SqliteDB;
var HOST = "192.168.31.151"; // 请改成实际的ip地址
                        // 后面的图片的URL会使用这个变量来构造
var PORT = 9089;
var db_file = "./data/FileB.db";

var sqliteDB = new SqliteDB(db_file)

var createTableSql = "create table if not exists favorite_list(url KEY NOT NULL);";
console.log(createTableSql)
sqliteDB.createTable(createTableSql);

createFTableSql = "create table if not exists history_list(url KEY NOT NULL);";
console.log(createTableSql)
sqliteDB.createTable(createTableSql);

var querySql = 'select * from favorite_list';
sqliteDB.queryData(querySql, dataDeal);


app.use('/', express.static('public'));
var video_ecursive_cnt = 1;
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
app.post('/login', function (req, res) {
    //post
    var reqBody='';
    // console.log(req)

    // 通过req的data事件监听函数，每当接受到请求体的数据，就累加到post变量
    req.on('data',function (data) {
        reqBody += data;
    });
    // 在end事件触发后，通过querystring.parse将post解析为真正的POST请求格式，然后向客户端返回。
    req.on('end',function () {//用于数据接收完成后再获取
        name = querystring.parse(reqBody).uname
        upwd = querystring.parse(reqBody).upwd
        console.log(name)
        console.log(upwd)

        if (name === "kkk" && upwd === "kkk") {
            res.jsonp({'status': "success", 'url': "/browsing.html"});
            // res.send('400');
            // return
        } else {
            res.jsonp({'status': "error", 'url': "/index.html"});
            // return
        }
        // res.writeHead(200,{'Content-Type':'text/html'});
        //res.write('you have sent a '+req.method+' request\n');
        //res.write('<p>Content-Type:'+req.headers['content-type']+'</p>');

        //    +'<p>Data:your name is '+querystring.parse(reqBody).entry_name+'</p>'
        //    +'<p>Data:your password is  '+ querystring.parse(reqBody).entry_password+'</p>');
        // video_ecursive_cnt = parseInt(reqBody.split("=")[1])
        // console.log("video_ecursive_cnt = " + video_ecursive_cnt)

        // req.session.error = '用户名不存在';
        // res.send(404); 

        // res.jsonp({'status': "success", 'code': 200});
        // res.send('400');
    })
   //res.send('200');
});

//  POST 请求
app.post('/recursive_cnt', function (req, res) {
    //post
    var reqBody='';
    // 通过req的data事件监听函数，每当接受到请求体的数据，就累加到post变量
    req.on('data',function (data) {
        reqBody += data;
    });
    // 在end事件触发后，通过querystring.parse将post解析为真正的POST请求格式，然后向客户端返回。
    req.on('end',function () {//用于数据接收完成后再获取
        video_ecursive_cnt = querystring.parse(reqBody).recursive_cnt
        // video_ecursive_cnt = parseInt(reqBody.split("=")[1])
        console.log("video_ecursive_cnt = " + video_ecursive_cnt)
        res.send('200');
    })
   //res.send('200');
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


function SortLikeWin(v1, v2) {
    var a = v1//.name;
    var b = v2//.name;
    var reg = /[0-9]+/g;
    var lista = a.match(reg);
    var listb = b.match(reg);
    if (!lista || !listb) {
        return a.localeCompare(b);
    }
    for (var i = 0, minLen = Math.min(lista.length, listb.length) ; i < minLen; i++) {
        //数字所在位置序号
        var indexa = a.indexOf(lista[i]);
        var indexb = b.indexOf(listb[i]);
        //数字前面的前缀
        var prefixa = a.substring(0, indexa);
        var prefixb = b.substring(0, indexb);
        //数字的string
        var stra = lista[i];
        var strb = listb[i];
        //数字的值
        var numa = parseInt(stra);
        var numb = parseInt(strb);
        //如果数字的序号不等或前缀不等，属于前缀不同的情况，直接比较
        if (indexa != indexb || prefixa != prefixb) {
            return a.localeCompare(b);
        }
        else {
            //数字的string全等
            if (stra === strb) {
                //如果是最后一个数字，比较数字的后缀
                if (i == minLen - 1) {
                    return a.substring(indexa).localeCompare(b.substring(indexb));
                }
                //如果不是最后一个数字，则循环跳转到下一个数字，并去掉前面相同的部分
                else {
                    a = a.substring(indexa + stra.length);
                    b = b.substring(indexa + stra.length);
                }
            }
                //如果数字的string不全等，但值相等
            else if (numa == numb) {
                //直接比较数字前缀0的个数，多的更小
                return strb.lastIndexOf(numb + '') - stra.lastIndexOf(numa + '');
            }
            else {
                //如果数字不等，直接比较数字大小
                return numa - numb;
            }
        }
    }
}

function commonCompare(v1, v2){
    if(v1 === v2){
       return 0;
      }      
    else{
      return v1<v2?-1:1;
    }
  }    

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
    var file = null
    try {
        files = fs.readdirSync(search_dir)
    } catch(e) {
        return
    }
    if (files.length != 0) { 
        files.forEach(function(data) {
            var stats = null
            //console.log(data)
            try {
                stats = fs.statSync(search_dir + "/" + data);
            } catch(e) {
                return
            }
			// var stats = fs.statSync(search_dir + "/" + data);
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
                    //return parseInt(lhs.split('.')[0]) - parseInt(rhs.split('.')[0]);
                    return SortLikeWin(lhs, rhs)//mb_PaiXu(lhs, rhs)
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
    res.jsonp({'find_dir': new_dir, 'recursive_cnt':video_ecursive_cnt,'code': 0});
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
        Recursive_cnt = video_ecursive_cnt;
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
            res.jsonp({'is_star':0, 'dir_list': dir_list, 'file_list': file_list, 'recursive_cnt':video_ecursive_cnt, 'code': 0});
        } else {
            res.jsonp({'is_star':1, 'dir_list': dir_list, 'file_list': file_list, 'recursive_cnt':video_ecursive_cnt, 'code': 0});
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