/* global require process Buffer */
var gulp = require('gulp');
var cssnano = require('gulp-cssnano');
var gutil = require('gulp-util');
var uglify = require('gulp-uglify');
var pkg = require('./package.json');

var DIST = './dist',
	SRC = './src',
	NAME = pkg.name,
	DEPLOY = process.env.HOMEDRIVE + process.env.HOMEPATH + '/Documents/Qlik/Sense/Extensions/' + NAME;

gulp.task('qext', function () {
	var qext = {
		name: 'Variable input',
		type: 'visualization',
		description: pkg.description,
		version: pkg.version,
		icon: 'control',
		preview: 'preview.png',
		keywords: 'qlik-sense, visualization',
		author: pkg.author,
		homepage: pkg.homepage,
		license: pkg.license,
		repository: '',
		installer: 'QlikExtensionBundler',
		bundle: {
			id: 'qlik-dashboard-bundle',
			name: 'Dashboard bundle',
			description: 'This is a set of extensions that will facilitate dashboard creation in Qlik Sense: A navigation button, a date picker, a slider, and two different container objects. These can be used in addition to the native objects found under "Charts".\n\nFor limitations and support conditions, see the documentation.'
		},
		dependencies: {
			'qlik-sense': '>=5.5.x'
		}
	};
	if (pkg.contributors) {
		qext.contributors = pkg.contributors;
	}
	var src = require('stream').Readable({
		objectMode: true
	});
	src._read = function () {
		this.push(new gutil.File({
			cwd: '',
			base: '',
			path: NAME + '.qext',
			contents: new Buffer(JSON.stringify(qext, null, 4))
		}));
		this.push(null);
	};
	return src.pipe(gulp.dest(DIST));
});

gulp.task('less', function () {
	var less = require('gulp-less');
	var LessPluginAutoPrefix = require('less-plugin-autoprefix');
	var autoprefix = new LessPluginAutoPrefix({
		browsers: ['last 2 versions']
	});
	return gulp.src(SRC + '/**/*.less')
		.pipe(less({
			plugins: [autoprefix]
		}))
		.pipe(cssnano())
		.pipe(gulp.dest(SRC));
});

gulp.task('clean', function (ready) {
	var del = require('del');
	del.sync([DIST]);
	ready();
});

gulp.task('build',['clean', 'qext', 'less'], function () {
	gulp.src([SRC + '/**/*.css', SRC + '/**/*.png'])
		.pipe(gulp.dest(DIST));
	return gulp.src(SRC + '/**/*.js')
		.pipe(uglify())
		.pipe(gulp.dest(DIST));
});

gulp.task('zip', ['build'], function () {
	var zip = require('gulp-zip');

	return gulp.src(DIST + '/**/*')
		.pipe(zip(`${NAME}_${pkg.version}.zip`))
		.pipe(gulp.dest(DIST));
});

gulp.task('debug', ['clean', 'qext', 'less'], function () {
	return gulp.src([SRC + '/**/*.css', SRC + '/**/*.png', SRC + '/**/*.js', DIST + '/**/*.qext'])
		.pipe(gulp.dest(DEPLOY));
});

gulp.task('deploy', ['build'], function () {
	return gulp.src(DIST + '/**/*')
		.pipe(gulp.dest(DEPLOY));
});

gulp.task('default', ['build']);