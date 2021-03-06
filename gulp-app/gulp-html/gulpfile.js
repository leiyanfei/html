var gulp = require('gulp');
var browserSync = require('browser-sync').create();
var gutil = require('gulp-util');
var wiredep = require('wiredep').stream;
var px2rem = require('gulp-px2rem-plugin');
var concat = require('gulp-concat'); //- 多个文件合并为一个；
var minifyCss = require('gulp-minify-css'); //- 压缩CSS为一行；
var rev = require('gulp-rev'); //- 对文件名加MD5后缀
var revCollector = require('gulp-rev-collector'); //- 路径替换
// var webserver = require('gulp-webserver');

var proxyMiddleware = require('http-proxy-middleware');



var $ = require('gulp-load-plugins')({
    pattern: ['gulp-*', 'del']
});
var fs = require('fs');
var path = require("path");

var _ = require('lodash');
var dest = './dest';

var appList = ['fw']

function errorHandler(title) {
    return function(err) {
        gutil.log(gutil.colors.red('[' + title + ']'), err.toString());
        this.emit('end');
    };
}

function fileList() {
    let file_list = []
    if (appList.length > 0) {
        appList.forEach((item) => {
            let file = './app/**/' + item + '/**/*';
            file_list.push(file)
        })
    } else {
        file_list = ['./app/**/*']
    }
    file_list.push('!./app/**/*.jade', '!./app/**/*.scss', '!./app/**/default.json');
    return file_list;
}

gulp.task('addFile', function() {
    return gulp.src(fileList())
        .pipe(gulp.dest(dest));
});


gulp.task('addFileWatch', function() {
    gulp.watch(fileList(), gulp.series('addFile'))
});

function jadeList() {
    let jade_list = ['./app/*.jade']
    if (appList.length > 0) {
        appList.forEach((item) => {
            let jade = './app/**/' + item + '/**/*.jade';
            jade_list.push(jade)
        })
    } else {
        jade_list = ['./app/**/*.jade']
    }
    return jade_list;
}

gulp.task('jade', function() {
    let jade_list = jadeList().concat(['!./app/**/component-*.jade'])
    return gulp.src(jade_list)
        .pipe($.data(function(file) {
            //json数据目录
            let filepath = path.dirname(file.path) + '/default.json';
            try {
                //json数据目录存在读取目录信息
                fs.statSync(filepath)
                return JSON.parse(fs.readFileSync(filepath))
            } catch (err) {
                //json数据目录不存在自己配置数据
                return {
                    'webtop': './', //m.zz91.com/zt/2019givegood/
                    'shareTitle': '999'
                }
            }
        }))
        .pipe($.jade({ pretty: true }))
        .on('error', errorHandler('jade'))
        .pipe(gulp.dest(dest))
        .pipe(browserSync.reload({ stream: true }));
});

function jsonList() {
    let json_list = []
    if (appList.length > 0) {
        appList.forEach((item) => {
            let jade = './app/**/' + item + '/**/*.json';
            json_list.push(jade)
        })
    } else {
        json_list = ['./app/**/*.json']
    }
    return json_list;
}

gulp.task('jsonWatch', function() {
    gulp.watch(jsonList(), gulp.series('jade'))
});

gulp.task('jadeWatch', function() {
    gulp.watch(jadeList(), gulp.series('jade'))
});

function scssList() {
    let scss_list = []
    if (appList.length > 0) {
        appList.forEach((item) => {
            let scss = './app/**/' + item + '/**/*.scss';
            scss_list.push(scss)
        })
    } else {
        scss_list = ['./app/**/*.scss']
    }
    return scss_list;
}

gulp.task('scss', function() {
    return gulp.src(scssList())
        .pipe($.sass())
        .on('error', errorHandler('sass'))
        .pipe(gulp.dest(dest))
        .pipe(browserSync.reload({ stream: true }));
});

gulp.task('autopref', function() {
    return gulp.src(dest + '/**/*.css')
        .pipe($.autoprefixer({
            browsers: ['last 5 versions', 'Android >= 4.0'],
            cascade: true, //是否美化属性值 默认：true 像这样：
            remove: true //是否去掉不必要的前缀 默认：true 
        }))
        .on('error', errorHandler('autopref'))
        .pipe(gulp.dest(dest));
});

gulp.task('scssWatch', function() {
    gulp.watch(scssList(), gulp.series('scss', 'autopref', 'px2remPlugin'))
});


gulp.task('px2remPlugin', function() {
    return gulp.src(dest + '/' + appList[0] + '/css/index.css')
        // .pipe(px2rem())
        .pipe(px2rem({ 'width_design': 750, 'valid_num': 6, 'pieces': 10, 'ignore_px': [1], 'ignore_selector': ['body'] }))
        .pipe(gulp.dest(dest + '/' + appList[0] + '/css/'));
});

// gulp.task('autoprefWadth',function() {
//   gulp.watch('./dest/**/*.css',gulp.series('autopref'))
// })

gulp.task('concat', function() { //- 创建一个名为 concat 的 task   
    return gulp.src(dest + '/' + appList[0] + '/css/*.css')
        //- 需要处理的css文件，放到一个字符串数组里
        //.pipe(concat('wrap.min.css'))               //- 合并后的文件名
        .pipe(minifyCss()) //- 压缩处理成一行
        .pipe(rev()) //- 文件名加MD5后缀
        .pipe(gulp.dest(dest + '/' + appList[0] + '/css/')) //- 输出文件本地
        .pipe(rev.manifest()) //- 生成一个rev-manifest.json
        .pipe(gulp.dest('./rev')); //- 将 rev-manifest.json 保存到 rev 目录内
});

gulp.task('rev', function() {
    return gulp.src(['./rev/*.json', dest + '/' + appList[0] + '/**/*.html'])
        //- 读取 rev-manifest.json 文件以及需要进行css名替换的文件

    .pipe(revCollector())
        //- 执行文件内css名的替换

    .pipe(gulp.dest(dest + '/' + appList[0] + '/'));
    //- 替换后的文件输出的目录
});

function cleanList() {
    let clean_list = []
    if (appList.length > 0) {
        appList.forEach((item) => {
            let clean = dest + '/**/' + item;
            clean_list.push(clean)
        })
    } else {
        clean_list = [dest]
    }
    return clean_list;
}

gulp.task('clean', function() {
    return $.del(cleanList());
});


var middleware = proxyMiddleware('/zt', {
    target: 'https://m.zz91.com',
    changeOrigin: true,
    pathRewrite: {
        '^/zt': '/zt'
    },
    logLevel: 'debug'
});

var middleware2 = proxyMiddleware('/api', {
    target: 'http://101.37.14.79:818',
    changeOrigin: true,
    pathRewrite: {
        '^/api': ''
    },
    logLevel: 'debug'
});


gulp.task('serve', function() {
    browserSync.init({
        startPath: '/',
        server: {
            baseDir: './dest',
            middleware: [middleware, middleware2]
        }
    });
});



// gulp.task('webserver', function () {
//   gulp.src('./')
//     .pipe(webserver({
//       host: 'localhost',
//       port: 3000,
//       livereload: true,
//       open: './dest/',
//       directoryListing: {
//         enable: true,
//         path: './'
//       },
//       proxies: [
//         {
//             source: '/zt', target: 'https://m.zz91.com/zt',
//         },
//       ]
//     }))
// });

gulp.task("build", gulp.series('clean',
    'addFile',
    'jade',
    'scss',
    'autopref',
    'px2remPlugin',
    'concat',
    'rev'))

gulp.task("default", gulp.series('build', gulp.parallel('scssWatch',
    'jsonWatch',
    'jadeWatch',
    'addFileWatch',
    'serve')))