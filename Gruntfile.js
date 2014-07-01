module.exports = function (grunt) {

	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		sass: {
			build: {
				options: {
					banner: '/*! gruntTest <%= grunt.template.today("yyyy-mm-dd") %> */\n'
				},
				files: [
					{'Resources/Public/CSS/app.css': 'Resources/Private/SCSS/app.scss'}
					/*{
						expand: true,
						cwd: 'Resources/Private/Contrib/foundation/scss',
						src: ['*.scss'],
						dest: 'Resources/Public/CSS/',
						ext: '.css'
					}*/
				]
			}
		},
		watch: {
			css: {
				files: 'Resources/Private/SCSS/**/*.scss',
				tasks: ['sass'],
				options: {
					//Needs <script src="//localhost:35729/livereload.js"></script> inside the HTML that should be reloaded
					livereload: true
				}
			},
			javascript: {
				files: [
					'Resources/Public/JavaScript/**/*.js',
					'!Resources/Public/JavaScript/**/*.min.js'
				],
				tasks: ['uglify:build']
			}
		},
		uglify: {
			options: {
				banner: '/*! gruntTest <%= grunt.template.today("yyyy-mm-dd") %> */\n',
				//report: 'gzip',
				preserveComments: false,
				sourceMap: 'Resources/Public/JavaScript/source-map.js'
			},
			build: {
				files: {
					'Resources/Public/JavaScript/application.min.js': ['Resources/Public/JavaScript/application.js'],
					'Resources/Public/JavaScript/libs.min.js': [ 'Resources/Private/Contrib/jquery/jquery.js', 'Resources/Private/Contrib/angular/angular.js']
				}
			}
		},
		bower: {
			options: {
				targetDir: 'Resources/Private/Contrib',
				cleanTargetDir: true,
				verbose: true
			},
			install: {
				//just run 'grunt bower:install' and you'll see files from your Bower packages in lib directory
			}
		}
	});

	// Load the plugins
	grunt.loadNpmTasks('grunt-contrib-sass');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-bower-task');

	// Default task.
	grunt.registerTask('build', ['bower:install']);
	grunt.registerTask('default', ['sass', 'uglify']);

};
