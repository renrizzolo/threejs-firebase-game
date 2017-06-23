module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    uglify: {
    	  options: {
        banner: '/*\n <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> \n*/\n'
      },
      build: {
        src: ['src/js/app.js', 'src/js/*.js' ],
        dest: 'public/js/app.min.js'
      }
    },

   	sass: {
      dist: {
      	files: {
        	'src/css/style.css': 'src/scss/style.scss'
      		}
      }
  	},

    cssmin: {
      options: {
        banner: '/*\n <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> \n*/\n'
      },
      build: {
        files: {
          'public/css/style.min.css': 'src/css/**.css'
        }
      }
    }, 

	browserSync: {
	    dist: {
	        bsFiles: {
	            src : ['public/css/style.min.css', 'public/js/app.min.js','public/index.html', 'public/views/**.html']
	        },
	        options: {
	            proxy: "http://localhost:5000/"
	        }
	    }
	},

    watch: {
      css: {
        files: 'src/scss/*.scss',
        tasks: ['sass', 'cssmin']
      },
       scripts: {
        files: ['src/js/app.js', 'src/js/*.js'],
        tasks: ['uglify']
      }
    },
 
   




  });

  // Load the plugin that provides the "uglify" task.
  grunt.loadNpmTasks('grunt-browser-sync');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-contrib-sass');
 // grunt.loadNpmTasks('grunt-contrib-concat');
//  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-watch');


  grunt.registerTask('default', ['cssmin', 'sass']);


};