var fs = require("fs");
var express = require('express');
var querystring = require('querystring');
// var session = require('express-session')

var SqliteDB = require('./modules/sqlite').SqliteDB;
console.log("hew");
var func_com = require('./modules/func_com')

var HOST = "192.168.31.151"; // 请改成实际的ip地址
// 后面的图片的URL会使用这个变量来构造
var PORT = 9089;
var db_file = "./data/FileB.db";
var app = express();
app.use('/', express.static('public'));

// You're mixing up a warning and an error that have nothing in common from this log. 
// The actual error is you don't have write permissions to the destination folder. 
// If you are running as root, try adding --unsafe-perm



var sqliteDB = new SqliteDB(db_file)

var createTableSql = "create table if not exists favorite_list(url KEY NOT NULL);";
console.log(createTableSql)
sqliteDB.createTable(createTableSql);

createFTableSql = "create table if not exists history_list(url KEY NOT NULL);";
console.log(createFTableSql)
sqliteDB.createTable(createFTableSql);

createFTableSql = "create table if not exists favorite_picture(url KEY NOT NULL);";
console.log(createFTableSql)
sqliteDB.createTable(createFTableSql);

createFTableSql = "create table if not exists favorite_video(url KEY NOT NULL);";
console.log(createFTableSql)
sqliteDB.createTable(createFTableSql);

createFTableSql = "create table if not exists favorite_music(url KEY NOT NULL);";
console.log(createFTableSql)
sqliteDB.createTable(createFTableSql);


// var querySql = 'select * from favorite_list';
// sqliteDB.queryData(querySql, dataDeal);
var static_path = __dirname + '/public/store/'
func_com.setPrePath(static_path)


/**
 * 错误提示
 */
var ErrorHelper = {
    'internal_error': function() {
        return {
            'msg': 'something wrong with server',
            'code': 1
        };
    },
    'missing_param': function(param) {
        return {
            'msg': 'missing param: ' + param,
            'code': 2
        };
    },
    'error_param': function(param, data) {
        return {
            'msg': 'the param ' + param + '(' + data + ') is illegal',
            'code': 3
        }
    },
    'not_found': function(param) {
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
app.post('/login', function(req, res) {
    //post
    var reqBody = '';
    // console.log(req)
    console.log("是否有代理：" + req.headers['x-forwarded-for'])
    console.log("客户端 IP： " + req.connection.remoteAddress)
    console.log("客户端 socket： " + req.socket.remoteAddress)

    // 通过req的data事件监听函数，每当接受到请求体的数据，就累加到post变量
    req.on('data', function(data) {
        reqBody += data;
    });
    // 在end事件触发后，通过querystring.parse将post解析为真正的POST请求格式，然后向客户端返回。
    req.on('end', function() { //用于数据接收完成后再获取
            name = querystring.parse(reqBody).uname
            upwd = querystring.parse(reqBody).upwd
            console.log(name)
            console.log(upwd)

            if (name === "kkk" && upwd === "kkk") {
                res.jsonp({ 'status': "success", 'url': "/browsing.html?file_dir=windows&browsing_mode=file&recursive_cnt=1" });
                // res.send('400');
                // return
            } else {
                res.jsonp({ 'status': "error", 'url': "/index.html" });
                // return
            }

        })
        //res.send('200');
});

//  POST 请求, 弃用
app.post('/recursive_cnt', function(req, res) {
    //post
    var reqBody = '';
    // 通过req的data事件监听函数，每当接受到请求体的数据，就累加到post变量
    req.on('data', function(data) {
        reqBody += data;
    });
    // 在end事件触发后，通过querystring.parse将post解析为真正的POST请求格式，然后向客户端返回。
    req.on('end', function() { //用于数据接收完成后再获取
            recursive_cnt = querystring.parse(reqBody).recursive_cnt
                // recursive_cnt = parseInt(reqBody.split("=")[1])
            console.log("recursive_cnt = " + recursive_cnt)
            res.send('200');
        })
});

app.get('/process_get', function(req, res) {

    // 输出 JSON 格式
    var response = {
        "first_name": req.query.first_name,
        "last_name": req.query.last_name
    };
    console.log(response);
    res.end(JSON.stringify(response));
});


// 判断是否被收藏
app.get('/is_start_file', function(req, res) {
    var file_name = req.query.file_dir;
    var browsing_mode = req.query.browsing_mode;

    if (file_name.length == 0 || file_name == "/") {
        res.jsonp({ 'code': -1 });
    }
    var dbname = func_com.getDataBase(browsing_mode);
    if (dbname == '') {
        res.jsonp({'code': -1 });
        return
    }
    file_name = func_com.filePathFix(file_name);
    console.log("判断的收藏路径: " + file_name);

    var querySql = "select * from " + dbname +  " where url='" + file_name + "'";
    console.log(querySql)
    sqliteDB.queryData(querySql, function data_Deal(objects) {
        console.log(objects.length)
        if (objects.length == 0) {
            res.jsonp({ 'code': -1 });
        } else {
            res.jsonp({ 'code': 0 });
        }
    });
});


/**
 * 获取收藏的目录
 */
app.get('/get_favorite_list', function(req, res) {
    console.log("获取收藏的路径");
    var browsing_mode = req.query.browsing_mode;

    var dbname = func_com.getDataBase(browsing_mode);
    if (dbname == '') {
        res.jsonp({'code': -1 });
        return
    }
    var querySql = 'select * from ' + dbname;
    var dir_list = new Array()
    var file_list = new Array()

    console.log(querySql);
    sqliteDB.queryData(querySql, function data_Deal(objects) {
        if (!objects) {
            res.jsonp({'code': 0 });
            return
        }
        console.log(objects.length);
        for (var i = 0; i < objects.length; ++i) {
            url = objects[i]["url"]
            url = url.replace('"', "'")
            complete_url = static_path + url
            console.log(complete_url);
            try {
                stats = fs.statSync(complete_url)
                if (browsing_mode == 'file' && stats.isDirectory()) {
                    dir_list.push(url)
                } else if (stats.isFile()) {
                    console.log(url);
                    file_list.push(url)
                } else {
                    console.log(url + " 文件不存在");
                }
                // else if (browsing_mode != 'file' && stats.isDirectory()) {
                //     var delFavSql = "delete from " + dbname +  " where url='" + url + "'";
                //     sqliteDB.executeSql(delFavSql);
                // }
            } catch (e) {
                console.log(url + " 文件不存在, 从数据库");
                // var delFavSql = "delete from " + dbname +  " where url='" + url + "'";
                // sqliteDB.executeSql(delFavSql);
                // console.log(e);
                continue;
            }
        }
        res.jsonp({ 'dir_list': dir_list, 'file_list': file_list, 'code': 0 });
    });
});


/**
 * 添加收藏目录
 */
app.get('/set_favorite_list', function(req, res) {
    var file_name = req.query.file_dir;
    var browsing_mode = req.query.browsing_mode;
    console.log("获添加的收藏路径: " + file_name);
    if (file_name.length == 0 || file_name == "/") {
        res.jsonp({ 'code': 0 });
    }
    var dbname = func_com.getDataBase(browsing_mode);
    if (dbname == '') {
        res.jsonp({'code': 0 });
        return
    }

    file_name = func_com.filePathFix(file_name);
    

    var querySql = "select * from " + dbname +  " where url='" + file_name + "'";
    console.log(querySql)
    sqliteDB.queryData(querySql, function data_Deal(objects) {
        console.log(objects.length)
        if (objects.length == 0) {
            var inquirytFavSql = "insert into " + dbname +  "(url) values(?)";
            var tileData = [
                [file_name]
            ];
            sqliteDB.insertData(inquirytFavSql, tileData);
            res.jsonp({ 'code': 0 });
        } else {
            res.jsonp({ 'code': -1 });
        }
    });
});

/**
 * 删除收藏目录
 */
app.get('/del_favorite_list', function(req, res) {
    var file_name = req.query.file_dir;
    var browsing_mode = req.query.browsing_mode;

    if (file_name.length == 0 || file_name == "/") {
        res.jsonp({ 'code': 0 });
    }
    var dbname = func_com.getDataBase(browsing_mode);
    if (dbname == '') {
        res.jsonp({'code': 0 });
        return
    }

    file_name = func_com.filePathFix(file_name);
    // console.log("是否有代理：" + req.headers['x-forwarded-for'])
    // console.log("客户端 IP： " + req.connection.remoteAddress)
    // console.log("客户端 socket： " + req.socket.remoteAddress)

    console.log("删除的收藏路径: " + file_name);
    var delFavSql = "delete from " + dbname +  " where url='" + file_name + "'";
    sqliteDB.executeSql(delFavSql);
    res.jsonp({ 'code': 0 });
});


// 删除文件

app.get('/delete_file', function(req, res) {
    var dir = req.query.file_dir;

    if (dir.length == 0 || dir == "/") {
        res.jsonp({ 'code': 0 });
        return;
    }
    dir = static_path + dir
    console.log("需要删除的路径: " + dir);

    try {
        stats = fs.statSync(dir)
        if (stats.isFile()) {
            fs.rename(dir, dir+".removefile", function(err) {
                if (err) {
                    console.log("重命名失败")
                    res.jsonp({ 'code': -1 });
                } else {
                    res.jsonp({ 'code': 0 });
                }
            });
        } else {
            res.jsonp({ 'code': -1 , 'reson':'选择的不是文件'});
        }
    } catch (e) {
        res.jsonp({ 'code': -1 , 'reson':'文件读取错误'});
    }
});


/**
 * 获取漫画的上一章节
 */
app.get('/get_prev_dir', function(req, res) {
    console.log("获取上一个章节");
    var file_name = req.query.file_dir;
    var new_dir = func_com.get_select_dir(file_name, 'pre');
    res.jsonp({ 'find_dir': new_dir, 'code': 0 });
});


/**
 * 获取漫画的下一章节
 */
app.get('/get_next_dir', function(req, res) {
    var file_name = req.query.file_dir;
    var new_dir = func_com.get_select_dir(file_name, 'next');
    console.log("获取下一个章节");
    res.jsonp({ 'find_dir': new_dir, 'code': 0 });
});


/**
 * 获取漫画列表
 */
app.get('/get_file_list', function(req, res) {
    var file_name = req.query.file_dir;
    var recursive_cnt = req.query.recursive_cnt
    var browsing_mode = req.query.browsing_mode;
    if (!file_name) {
        file_name = ""
    }
    if (!recursive_cnt) {
        recursive_cnt = 1
    }
    console.log(browsing_mode)
    if (!browsing_mode) {
        console.log("no mode set????");
        browsing_mode = 'file';
    } else {
        console.log("browsing_mode = " + browsing_mode)
    }
    var dir = static_path + file_name
    console.log("dir %s", dir);

    var dir_list = new Array();
    var file_list = new Array();
    var pic_list = new Array();
    var Recursive_cnt = 1;
    if (browsing_mode == 'picture' || browsing_mode == 'video') {
        Recursive_cnt = recursive_cnt;
    }
    func_com.Recursive_dir(Recursive_cnt, dir, "", browsing_mode, dir_list, file_list)
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
            res.jsonp({ 'is_star': 0, 'dir_list': dir_list, 'file_list': file_list, 'code': 0 });
        } else {
            res.jsonp({ 'is_star': 1, 'dir_list': dir_list, 'file_list': file_list, 'code': 0 });
        }
    });
    //res.jsonp({'dir_list': dir_list, 'file_list': file_list, 'code': 0});
});

var server = app.listen(PORT, HOST, function() {
    console.log("\n应用实例，访问地址为 http://%s:%s\n", HOST, PORT)
});


function dataDeal(objects) {
    for (var i = 0; i < objects.length; ++i) {
        console.log(objects[i]);
    }
}