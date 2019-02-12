// https://www.gulpjs.com.cn/docs/recipes/minified-and-non-minified/
'use strict';

const gulp = require('gulp');
const rename = require('gulp-rename');
const uglify = require('gulp-uglify');

const DEST = 'lib/';

gulp.task('default', () => {
  // 将你的默认的任务代码放在这
  return gulp.src('lib/plugin.js')
    // 这会输出一个未压缩过的版本
    .pipe(gulp.dest(DEST))
    // 这会输出一个压缩过的并且重命名未 plugin.min.js 的文件
    .pipe(uglify())
    .pipe(rename({ extname: '.min.js' }))
    .pipe(gulp.dest(DEST));
})
