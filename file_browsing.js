// var fs = require("fs");
import fs from 'fs';
import resolve from 'path';
// var express = require('express');
import express from 'express';
// var querystring = require('querystring');
import querystring from 'querystring';
import { list, unpack } from 'node-unar';
import sd from 'silly-datetime';
import crypto  from 'crypto';


// var session = require('express-session')

// var SqliteDB = require('./modules/sqlite').SqliteDB;
import SqliteDB from './modules/sqlite.js';


// var func_com = require('./modules/func_com')
import func_com from './modules/func_com.js';
import pkg from 'response'
const { cookie } = pkg;

var HOST = "192.168.31.151"; // 请改成实际的ip地址
// 后面的图片的URL会使用这个变量来构造
var PORT = 9089;
var db_file = "./data/FileB.db";
var app = express();
var favorite_talbe_list = new Array()
var FavoritesList = "FavoritesList"
app.use('/', express.static('public'));

// You're mixing up a warning and an error that have nothing in common from this log. 
// The actual error is you don't have write permissions to the destination folder. 
// If you are running as root, try adding --unsafe-perm

console.log(sd.format(new Date(), 'YYYY-MM-DD HH:mm'));



var sqliteDB = new SqliteDB(db_file)

var createTableSql = "create table if not exists FavoritesList(name KEY NOT NULL);";
console.log(createTableSql)
sqliteDB.createTable(createTableSql);


var createTableSql = "create table if not exists user_table(user_name KEY NOT NULL, password);";
console.log(createTableSql)
sqliteDB.createTable(createTableSql);

// var inquirytFavSql = "insert into user_table (user_name, password) values(?, ?)";
// var tileData = [
//     ["1","1"]
// ];
// sqliteDB.insertData(inquirytFavSql, tileData);


// if 0
// var new_table = "mv"
// // var delFavSql = "delete from " + FavoritesList +  " where name='" + new_table + "'";
// // sqliteDB.executeSql(delFavSql);

// createTableSql = "create table if not exists " + new_table + "(url KEY NOT NULL);";
// console.log(createTableSql)
// sqliteDB.createTable(createTableSql);


// var sql_cmd = "select * from " + FavoritesList +  " where name='" + new_table + "'";
// console.log(sql_cmd)
// sqliteDB.queryData(sql_cmd, function data_Deal(objects) {
//     if (!(objects && objects.length > 0)) {
//         var inquirytFavSql = "insert into " + FavoritesList +  "(name) values(?)";
//         var tileData = [
//             [new_table]
//         ];
//         sqliteDB.insertData(inquirytFavSql, tileData);
//     } else {
//         console.log(objects.length)
//     }
// });
// #endif


// if 0
var sql_cmd = 'select * from ' + FavoritesList;
sqliteDB.queryData(sql_cmd, function data_Deal(objects) {
    if (!objects) {
        return
    }
    console.log(objects.length);
    for (var i = 0; i < objects.length; ++i) {
        var table = objects[i]["name"]
        favorite_talbe_list.push(table)
    }
    console.log(favorite_talbe_list)
});
// endif


var __dirname = process.cwd();
var static_path = __dirname + '/public/store/'
func_com.setPrePath(static_path)

console.log(process.cwd());
console.log(static_path);
console.log(func_com.getDataBase("file"));

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

function checkCooke(req) {
    console.log(req.headers.cookie)

    if (req.headers.cookie == undefined) {
        return false
    } 

    let cookies = req.headers.cookie.split(',')

    if (cookies.length != 3) {
        return false
    }
    let cookie = crypto.createHash('md5').update(cookies[0]+cookies[1]).digest("hex")

    console.log(cookie)
    console.log(cookies[2])

    if (cookie === cookies[2]) {
        return true
    }
    return false
}


//  POST 注册
app.post('/register', function(req, res) {
    res.jsonp({ 'status': "error", 'url': "/index.html" });
});


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
        console.log("reqBody: "+ reqBody)
    });
    // 在end事件触发后，通过querystring.parse将post解析为真正的POST请求格式，然后向客户端返回。
    req.on('end', function() { //用于数据接收完成后再获取
            var name = querystring.parse(reqBody).uname
            var upwd = querystring.parse(reqBody).upwd
            console.log("reqBody: "+ reqBody)
            console.log(name)
            console.log(upwd)

            if (name == undefined || upwd == undefined) {
                res.jsonp({ 'status': "error", 'url': "/index.html" });
                res.end()
            } else {
                console.log(name.length)
                console.log(upwd.length)

                var querySql = "select * from user_table where user_name='" + name + "'"
                console.log(querySql)
                sqliteDB.queryData(querySql, function data_Deal(objects) {
                    if (!objects || objects.length == 0) {
                        console.log("没有指定的用户")
                        res.jsonp({ 'status': "error", 'url': "/index.html" });
                        res.end()
                    } else {
                        console.log(objects)
                        console.log(objects.length)
                        console.log(objects[0]["user_name"])
                        console.log(objects[0]["password"])
                        if (name === objects[0]["user_name"] && upwd === objects[0]["password"]) {
                            let now = sd.format(new Date(), 'YYYY-MM-DD HH:mm')
                            var cookie = crypto.createHash('md5').update(name+now).digest("hex")
                            res.setHeader('Set-Cookie',`${name},${now},${cookie}`)
                            console.log("登录成功")
                            res.jsonp({ 'status': "success", 'url': "/browsing.html?file_dir=windows&browsing_mode=file&recursive_cnt=1&loop_mode=dir_order" });
                            res.end()
                        } else {
                            console.log("用户或者是密码错误")
                            res.jsonp({ 'status': "error", 'url': "/index.html" });
                            res.end()
                        }
                    }
                });
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
    if (checkCooke(req) == false) {
        res.jsonp({ 'code': 403});
        return
    }

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
    if (checkCooke(req) == false) {
        res.jsonp({ 'code': 403});
        return
    }
    var file_name = req.query.file_dir;
    var start_list = new Array()
    var talbe_list = new Array()

    if (file_name.length == 0 || file_name == "/") {
        favorite_talbe_list.forEach(function(data){
            start_list.push(0)
        })
        res.jsonp({'favorite_talbe_list':favorite_talbe_list, 'is_star': start_list, 'code': 0 });
        return;
    }

    file_name = func_com.filePathFix(file_name);
    console.log("判断的收藏路径: " + file_name);
    if (file_name.startsWith(".tmp"))  {
        // 解压目录，不需要判断；
        favorite_talbe_list.forEach(function(data){
            start_list.push(0)
        })
        res.jsonp({'favorite_talbe_list':favorite_talbe_list, 'is_star': start_list, 'code': 0 });
        return;
    }

    favorite_talbe_list.forEach(function(data) {
        var querySql = "select * from " + data + " where url='" + file_name + "'";
        console.log(querySql)
        sqliteDB.queryData(querySql, function data_Deal(objects) {
            console.log(objects)
            talbe_list.push(data)
            if (!objects || objects.length == 0) {
                /**not start */
                start_list.push(0)
            } else {
                start_list.push(1)
            }

            console.log(start_list.length)
            
            if (start_list.length == favorite_talbe_list.length) {
                
                // start_list.forEach(function(data, index, arr) {
                //     arr[index] = {favorite_talbe_list[idx] : arr[index]}
                //     // data = data['b']
                // })
                // start_list.push(favorite_talbe_list[0])
                // console.log(favorite_talbe_list[0])
                // console.log(start_list)
                console.log("return")
                res.jsonp({'favorite_talbe_list':talbe_list, 'is_star': start_list, 'code': 0 });
                return
            }
        });
    });
});


/**
 * 获取收藏夹的列表
 */
app.get('/get_favorite_list', function(req, res) {
    if (checkCooke(req) == false) {
        res.jsonp({ 'code': 403});
        return
    }
    console.log("获取收藏的路径");

    var querySql = 'select * from ' + FavoritesList;
    var Favorites_list = new Array()

    console.log(querySql);
    sqliteDB.queryData(querySql, function data_Deal(objects) {
        if (!objects) {
            res.jsonp({'code': 0 });
            return
        }
        console.log(objects.length);
        for (var i = 0; i < objects.length; ++i) {
            var table = objects[i]["name"]
            Favorites_list.push(table)
        }
        res.jsonp({ 'Favorites_list': Favorites_list, 'code': 0 });
    });
});

/**
 * 获取收藏夹的内容
 */
 app.get('/get_favorite_content', function(req, res) {
    if (checkCooke(req) == false) {
        res.jsonp({ 'code': 403});
        return
    }
    console.log("获取收藏的路径");
    var Favorites_name = req.query.Favorites_name;
    var browsing_mode = req.query.browsing_mode;

    if (Favorites_name == '') {
        res.jsonp({'code': -1 });
        return
    }
    var querySql = 'select * from ' + Favorites_name;
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
            var url = objects[i]["url"]
            url = url.replace('"', "'")
            var complete_url = static_path + url
            console.log(complete_url);
            try {
                var stats = fs.statSync(complete_url)
                if (browsing_mode == 'file' && stats.isDirectory()) {
                    dir_list.push(url)
                } else if (stats.isFile()) {
                    if (browsing_mode == 'video') {
                    console.log('find video')
                    var suffixIndex = url.lastIndexOf(".");
                    var suffix = url.substring(suffixIndex + 1).toUpperCase();
                        if (suffix == "MP4") {
                            file_list.push(url)
                        }
                    } else {        
                        console.log(url);
                        file_list.push(url)
                    }
                } else {
                    console.log(url + " 文件不存在");
                }
                // else if (browsing_mode != 'file' && stats.isDirectory()) {
                //     var delFavSql = "delete from " + dbname +  " where url='" + url + "'";
                //     sqliteDB.executeSql(delFavSql);
                // }
            } catch (e) {
                console.log(e);
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
 * 添加收藏夹
 */
app.get('/set_favorite_list', function(req, res) {
    if (checkCooke(req) == false) {
        res.jsonp({ 'code': 403});
        return
    }
    var Favorites_name = req.query.Favorites_name;
    console.log("获添加的收藏夹: " + Favorites_name);
    if (Favorites_name.length == 0) {
        res.jsonp({ 'code': 0 });
    }

    var querySql = "select * from " + FavoritesList +  " where name='" + Favorites_name + "'";
    console.log(querySql)
    sqliteDB.queryData(querySql, function data_Deal(objects) {
        console.log(objects.length)
        if (objects.length == 0) {
            var inquirytFavSql = "insert into " + FavoritesList +  "(name) values(?)";
            var tileData = [
                [Favorites_name]
            ];
            sqliteDB.insertData(inquirytFavSql, tileData);
            favorite_talbe_list.push(Favorites_name)
            res.jsonp({ 'code': 0 });
        } else {
            res.jsonp({ 'code': -1 });
        }
    });
});


/**
 * 添加收藏夹里面的内容
 */
 app.get('/set_favorite_content', function(req, res) {
    if (checkCooke(req) == false) {
        res.jsonp({ 'code': 403});
        return
    }
    var file_name = req.query.file_dir;
    var Favorites_name = req.query.Favorites_name;
    console.log("获添加的收藏路径: " + file_name);
    if (file_name.length == 0 || file_name == "/") {
        res.jsonp({ 'code': 0 });
    }

    file_name = func_com.filePathFix(file_name);
    

    var querySql = "select * from " + Favorites_name +  " where url='" + file_name + "'";
    console.log(querySql)
    sqliteDB.queryData(querySql, function data_Deal(objects) {
        console.log(objects.length)
        if (objects.length == 0) {
            var inquirytFavSql = "insert into " + Favorites_name +  "(url) values(?)";
            var tileData = [
                [file_name]
            ];
            console.log(inquirytFavSql)
            sqliteDB.insertData(inquirytFavSql, tileData);
            res.jsonp({ 'code': 0 });
        } else {
            res.jsonp({ 'code': -1 });
        }
    });
});


/**
 * 删除收藏夹
 */
app.get('/del_favorite_list', function(req, res) {
    if (checkCooke(req) == false) {
        res.jsonp({ 'code': 403});
        return
    }
    var Favorites_name = req.query.Favorites_name;

    if (file_name.Favorites_name == 0) {
        res.jsonp({ 'code': 0 });
    }
    // console.log("是否有代理：" + req.headers['x-forwarded-for'])
    // console.log("客户端 IP： " + req.connection.remoteAddress)
    // console.log("客户端 socket： " + req.socket.remoteAddress)

    console.log("删除的收藏路径: " + Favorites_name);
    var delFavSql = "delete from " + FavoritesList +  " where name='" + Favorites_name + "'";
    sqliteDB.executeSql(delFavSql);
    res.jsonp({ 'code': 0 });
});


/**
 * 删除收藏内容
 */
 app.get('/del_favorite_content', function(req, res) {
    if (checkCooke(req) == false) {
        res.jsonp({ 'code': 403});
        return
    }
    var file_name = req.query.file_dir;
    var Favorites_name = req.query.Favorites_name;

    if (file_name.length == 0 || file_name == "/") {
        res.jsonp({ 'code': 0 });
    }

    file_name = func_com.filePathFix(file_name);
    // console.log("是否有代理：" + req.headers['x-forwarded-for'])
    // console.log("客户端 IP： " + req.connection.remoteAddress)
    // console.log("客户端 socket： " + req.socket.remoteAddress)

    console.log("删除的收藏路径: " + file_name);
    var delFavSql = "delete from " + Favorites_name +  " where url='" + file_name + "'";
    sqliteDB.executeSql(delFavSql);
    res.jsonp({ 'code': 0 });
});




// 删除文件

app.get('/delete_file', function(req, res) {
    if (checkCooke(req) == false) {
        res.jsonp({ 'code': 403});
        return
    }
    var dir = req.query.file_dir;

    if (dir.length == 0 || dir == "/") {
        res.jsonp({ 'code': 0 });
        return;
    }
    dir = static_path + dir
    console.log("需要删除的路径: " + dir);

    try {
        var stats = fs.statSync(dir)
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
    if (checkCooke(req) == false) {
        res.jsonp({ 'code': 403});
        return
    }
    console.log("获取上一个章节");
    var file_name = req.query.file_dir;
    var new_dir = func_com.get_select_dir(file_name, 'pre');
    res.jsonp({ 'find_dir': new_dir, 'code': 0 });
});


/**
 * 获取漫画的下一章节
 */
app.get('/get_next_dir', function(req, res) {
    if (checkCooke(req) == false) {
        res.jsonp({ 'code': 403});
        return
    }
    var file_name = req.query.file_dir;
    var new_dir = func_com.get_select_dir(file_name, 'next');
    console.log("获取下一个章节");
    res.jsonp({ 'find_dir': new_dir, 'code': 0 });
});


/**
 * 获取漫画列表
 */
app.get('/get_file_list', function(req, res) {
    if (checkCooke(req) == false) {
        res.jsonp({ 'code': 403});
        return
    }

    var file_name = req.query.file_dir;
    var recursive_cnt = req.query.recursive_cnt
    var browsing_mode = req.query.browsing_mode;

    console.log(req.headers.cookie)

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
    console.log("Recursive_cnt " + Recursive_cnt);
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

    res.jsonp({'dir_list': dir_list, 'file_list': file_list, 'code': 0});
});


/**
 * 添加收藏目录
 */
app.get('/compressing_dir', function(req, res) {

    if (checkCooke(req) == false) {
        res.jsonp({ 'code': 403});
        return
    }

    console.log("compressing_dir");
    var file_name = req.query.file_dir;
    var browsing_mode = req.query.browsing_mode;
    var passwd = req.query.passwd;
    console.log("需要解压的文件: " + file_name);
    if (file_name.length == 0 || file_name == "/") {
        res.jsonp({ 'code': 0 });
    }

    var old_file_name = func_com.filePathFix(file_name);
    file_name = static_path + old_file_name
    var target_dir = "./public/store/.tmp/" + old_file_name
    // 判断是否已经解压过了，如果是，则不需要重复解压；

    try {
        var files = fs.readdirSync(target_dir)
        console.log(target_dir + " 存在");
        if (files.length != 0) {
            old_file_name = ".tmp/" + old_file_name
            res.jsonp({'target': old_file_name, 'code': 0 });
            return;
        }
    } catch (e) {
        console.log(target_dir + " 不存在");
    }

    console.log(file_name + " to " + target_dir);
    unpack(file_name, target_dir)
    .progress((eachFle) => {
        console.log(eachFle);
        console.log("-------------------");
    })
    .then((results) => {
        let type = results.type;
        let fileList = results.files;
        let outputDirectory = results.directory;
        console.log("type= " + type);
        console.log("fileList= " + fileList);
        console.log("outputDirectory = " + outputDirectory);
        old_file_name = ".tmp/" + old_file_name
        res.jsonp({'target': old_file_name, 'code': 0 });
    })
    .catch((anyError) => {
        console.log(anyError);
        res.jsonp({ 'code': -1 });
    });
});




var server = app.listen(PORT, HOST, function() {
    console.log("\n应用实例，访问地址为 http://%s:%s\n", HOST, PORT)
});


function dataDeal(objects) {
    for (var i = 0; i < objects.length; ++i) {
        console.log(objects[i]);
    }
}