// var fs = require('fs');
import fs from 'fs';


var pre_path="";

function commonCompare (v1, v2) {
    if (v1 === v2) {
        return 0;
    } else {
        return v1 < v2 ? -1 : 1;
    }
}

function SortLikeWin(v1, v2) {
    var a = v1 //.name;
    var b = v2 //.name;
    var reg = /[0-9]+/g;
    var lista = a.match(reg);
    var listb = b.match(reg);
    if (!lista || !listb) {
        return a.localeCompare(b);
    }
    for (var i = 0, minLen = Math.min(lista.length, listb.length); i < minLen; i++) {
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
        } else {
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
            } else {
                //如果数字不等，直接比较数字大小
                return numa - numb;
            }
        }
    }
}


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
        var files = fs.readdirSync(search_dir)
    } catch (e) {
        console.log(e);
        return
    }
    if (files.length != 0) {
        files.forEach(function(data) {
            var stats = null
                //console.log(data)
            try {
                stats = fs.statSync(search_dir + "/" + data);
            } catch (e) {
                return
            }
            // var stats = fs.statSync(search_dir + "/" + data);
            if (stats.isFile()) {
                if (browsing_mode == 'file') {
                    file_list.push(pre_dir + data)
                } else if (browsing_mode == 'picture') {
                    //console.log('find pic')
                    var suffixIndex = data.lastIndexOf(".");
                    var suffix = data.substring(suffixIndex + 1).toUpperCase();
                    if (suffix == "BMP" || suffix == "JPG" || suffix == "JPEG" || suffix == "PNG" || suffix == "GIF") {
                        file_list.push(pre_dir + data)
                    }
                } else if (browsing_mode == 'video') {
                    //console.log('find video')
                    var suffixIndex = data.lastIndexOf(".");
                    var suffix = data.substring(suffixIndex + 1).toUpperCase();
                    if (suffix == "MP4") {
                        file_list.push(pre_dir + data)
                    } else if (suffix == "WEBM") {
                        file_list.push(pre_dir + data)
                    } 
                } else if (browsing_mode == 'audio') {
                    //console.log('find audio')
                    var suffixIndex = data.lastIndexOf(".");
                    var suffix = data.substring(suffixIndex + 1).toUpperCase();
                    if (suffix == "MP3") {
                        file_list.push(pre_dir + data)
                    }
                } else if (browsing_mode == 'cartoon') {
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
                dir_list.sort(function(lhs, rhs) {
                    //按照时间排序
                    /** 
                    return fs.statSync(search_dir + "/" + lhs).mtime.getTime() - fs.statSync(search_dir + "/" + rhs).mtime.getTime()*/
                    //return parseInt(lhs.split('.')[0]) - parseInt(rhs.split('.')[0]);
                    return SortLikeWin(lhs, rhs) //mb_PaiXu(lhs, rhs)
                });
            }

            if (file_list.length != 0) {
                file_list.sort(function(lhs, rhs) {
                    return parseInt(lhs.split('.')[0]) - parseInt(rhs.split('.')[0]);
                });
                //console.log("pic_list.length %d", file_list.length);
            }
        }
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

function Traversing_the_directory(dir, dir_list, file_list, browsing_mode) {
    files = fs.readdirSync(dir)
    console.log("Traversing_the_directory");
    if (files.length != 0) {
        files.forEach(function(data) {
            var stats = fs.statSync(dir + "/" + data);
            if (stats.isFile()) {
                if (browsing_mode == 'file') {
                    file_list.push(data)
                } else if (browsing_mode == 'picture') {
                    console.log('find pic')
                    var suffixIndex = data.lastIndexOf(".");
                    var suffix = data.substring(suffixIndex + 1).toUpperCase();
                    if (suffix == "BMP" || suffix == "JPG" || suffix == "JPEG" || suffix == "PNG" || suffix == "GIF") {
                        file_list.push(data)
                    }
                } else if (browsing_mode == 'video') {
                    console.log('find video')
                    var suffixIndex = data.lastIndexOf(".");
                    var suffix = data.substring(suffixIndex + 1).toUpperCase();
                    if (suffix == "MP4") {
                        file_list.push(data)
                    }
                } else if (browsing_mode == 'audio') {
                    console.log('find audio')
                    var suffixIndex = data.lastIndexOf(".");
                    var suffix = data.substring(suffixIndex + 1).toUpperCase();
                    if (suffix == "MP3") {
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
            dir_list.sort(function(lhs, rhs) {
                //按照时间排序
                return fs.statSync(dir + "/" + lhs).mtime.getTime() - fs.statSync(dir + "/" + rhs).mtime.getTime()
                    //return parseInt(lhs.split('.')[0]) - parseInt(rhs.split('.')[0]);
            });
        }

        if (file_list.length != 0) {
            file_list.sort(function(lhs, rhs) {
                return parseInt(lhs.split('.')[0]) - parseInt(rhs.split('.')[0]);
            });
            console.log("pic_list.length %d", file_list.length);
        }
    };
};



function get_select_dir(old_dir, dirct) {
    console.log("olddir %s", old_dir);
    var index = old_dir.lastIndexOf("\/");
    var parent_dir = old_dir.substring(0, index);
    var sub_dir = old_dir.substring(index + 1, old_dir.length);

    var dir_list = new Array();
    var file_list = new Array();
    var pic_list = new Array();

    var dir = pre_path + parent_dir;
    var cur_dir_idx = 0;

    var Recursive_cnt = 1;
    Recursive_dir(Recursive_cnt, dir, "", -1, dir_list, file_list)

    //Traversing_the_directory(dir, dir_list, file_list, -1);
    for (var i = 0; i < dir_list.length; i++) {
        var name = dir_list[i];
        if (name == sub_dir) {
            cur_dir_idx = i;
            break;
        }
    }

    if (dirct == 'pre') {
        if (cur_dir_idx == 0) {
            sub_dir = parent_dir;
        } else {
            sub_dir = parent_dir + "/" + dir_list[cur_dir_idx - 1];
        }
    } else if (dirct == 'next') {
        if (cur_dir_idx == (dir_list.length - 1)) {
            sub_dir = parent_dir;
        } else {
            sub_dir = parent_dir + "/" + dir_list[cur_dir_idx + 1];
        }
    }
    console.log("find dir %s", sub_dir);
    return sub_dir;
};

function setPrePath(init_path) {
    pre_path = init_path
}

function getDataBase(browsing_mode) {
    var dbname=""
    if (browsing_mode == 'file') {
        dbname = 'favorite_list'
    } else if (browsing_mode == 'picture'){
        dbname = 'favorite_picture'
    } else if (browsing_mode == 'video'){
        dbname = 'favorite_video'
    } else if (browsing_mode == 'music') {
        dbname = 'favorite_music'
    } 
    return dbname;
}

/**规范路径 */
function filePathFix(file_name) {

    // var a = "//jwioq/e/j////f/q//o//efjqo/";
    // while (1) {
    //     var b = a.replace(/\/\//, "/");
    //     if (b == a) {
    //         if (b[0] == "/") {
    //             a = b.substring(1);
    //         }
    //         break;
    //     }
    //     a = b;
    // }
    // console.log(a);

    if (file_name.length == 0) {
        return ''
    }
    /**规范路径 */
    while (1) {
        var b = file_name.replace(/\/\//, "/");
        if (b == file_name) {
            file_name = b;
            break;
        }
        file_name = b;
        console.log(file_name);
    }
    if (file_name[0] == "/") {
        file_name = file_name.substring(1);
    }
    file_name = file_name.replace(/'/g,'"')
    // 下面这种方法只会替换第一个
    // file_name = file_name.replace('"', '\'"')
    return file_name;
}

var func_com = {
    filePathFix : filePathFix,
    setPrePath:setPrePath,
    commonCompare : commonCompare,
    SortLikeWin : SortLikeWin,
    Recursive_dir : Recursive_dir,
    Traversing_the_directory : Traversing_the_directory,
    get_select_dir : get_select_dir,
    getDataBase : getDataBase
};

// module.exports=func_com
export default func_com