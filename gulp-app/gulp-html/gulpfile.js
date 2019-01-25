var gulp = require('gulp');
var browserSync = require('browser-sync').create();
var gutil = require('gulp-util');
var wiredep = require('wiredep').stream;
var $ = require('gulp-load-plugins')({
  pattern: ['gulp-*', 'del']
});
var _ = require('lodash');
var dest = './dest';

var appList = ['pig-give-good']

function errorHandler(title) {
  return function (err) {
    gutil.log(gutil.colors.red('[' + title + ']'), err.toString());
    this.emit('end');
  };
}

function fileList(){
  let file_list = []
  if(appList.length>0){
    appList.forEach((item)=>{
      let file = './app/**/'+ item+'/**/*';
      file_list.push(file)
    })
  }else{
    file_list = ['./app/**/*']
  }
  file_list.push('!./app/**/*.jade','!./app/**/*.scss');
  return file_list;
}

gulp.task('addFile', function() {
  return gulp.src(fileList())
  .pipe(gulp.dest(dest));
});


gulp.task('addFileWatch', function() {
  gulp.watch(fileList()).on('all',function(event,path){
    if(event=='add'||event=='change'){
      let path_ = './'+path.replace('\\', '/');
      return gulp.src([path_])
      .pipe(gulp.dest(dest));
    }
  });
});

function jadeList(){
  let jade_list = ['./app/*.jade']
  if(appList.length>0){
    appList.forEach((item)=>{
      let jade = './app/**/'+ item+'/**/*.jade';
      jade_list.push(jade)
    })
  }else{
    jade_list = ['./app/**/*.jade']
  }
  return jade_list;
}

gulp.task('jade', function() {
  let jade_list = jadeList().concat(['!./app/**/component-*.jade'])
  return gulp.src(jade_list)
      .pipe($.data(function(file) {
          return { 
            'webtop': '//m.zz91.com/zt/2019givegood/',
            'shareTitle':'万元现金红包大派送，快来和我一起抢红包'
           }
        }))
      .pipe($.jade({pretty : true}))
      .on('error', errorHandler('jade'))
      .pipe(gulp.dest(dest))
      .pipe(browserSync.reload({stream: true}));
});

gulp.task('jadeWatch', function() {
  gulp.watch(jadeList(),gulp.series('jade'))
});

function scssList(){
  let scss_list = []
  if(appList.length>0){
    appList.forEach((item)=>{
      let scss = './app/**/'+ item+'/**/*.scss';
      scss_list.push(scss)
    })
  }else{
    scss_list = ['./app/**/*.scss']
  }
  return scss_list;
}

gulp.task('scss', function() {
  return gulp.src(scssList())
        .pipe($.sass())
        .on('error', errorHandler('sass'))
        .pipe(gulp.dest(dest))
        .pipe(browserSync.reload({stream: true}));
});

gulp.task('scssWatch', function() {
  gulp.watch(scssList(),gulp.series('scss'))
    
});

gulp.task('autopref',function() {
  return gulp.src(dest+'/**/*.css')
        .pipe($.autoprefixer({
            browsers: ['last 5 versions', 'Android >= 4.0'],
            cascade: true, //是否美化属性值 默认：true 像这样：
            remove:true //是否去掉不必要的前缀 默认：true 
        }))
        .on('error', errorHandler('autopref'))
        .pipe(gulp.dest(dest));
});

gulp.task('autoprefWadth',function() {
  gulp.watch('./dest/**/*.css').on('all',function(event,path){
    if(event=='add'||event=='change'){
      let path_ = './'+path.replace('\\', '/');
      return gulp.src(path_)
        .pipe($.autoprefixer({
            browsers: ['last 5 versions', 'Android >= 4.0'],
            cascade: true, //是否美化属性值 默认：true 像这样：
            remove:true //是否去掉不必要的前缀 默认：true 
        }))
        .on('error', errorHandler('autopref'))
        .pipe(gulp.dest(dest));
    }
  })
})

function cleanList(){
  let clean_list = []
  if(appList.length>0){
    appList.forEach((item)=>{
      let clean = dest+'/**/'+ item;
      clean_list.push(clean)
    })
  }else{
    clean_list = [dest]
  }
  return clean_list;
}

gulp.task('clean', function() {
  return $.del(cleanList());
});

gulp.task('serve',function() {
  browserSync.init({
      startPath : '/',
      server : {
        baseDir : './dest'
      }
    });
  }
);

gulp.task("build",gulp.series('clean','addFile','jade','scss','autopref'))

gulp.task("default",gulp.series('build',gulp.parallel('scssWatch',
                                                      'jadeWatch',
                                                      'addFileWatch',
                                                      'autoprefWadth','serve')))

