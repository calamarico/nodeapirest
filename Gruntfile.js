'use strict';

module.exports = function ( grunt ) {

    // Load grunt tasks automatically
    require( 'load-grunt-tasks' )( grunt );

    // --------------------------------------------------------------------

    /**
     * Collecting files into collections for an easy processing
     * ------------------------------------------
     */
    var jsFiles = [
            '<%= nodeApiRest.mainFolder %>/*.js'
        ];

    // Define the configuration for all the tasks
    grunt.initConfig( {
        // Project Settings
        nodeApiRest: {
            // configurable paths
            mainFolder: '.',
            // For banners (uglify, concat...)
            name: 'TrendMicro Node Api Rest',
            version: '0.0.1'
        },

        // Watches files for changes and runs tasks based on the changed files
        watch: {
            jsFiles: {
                files: jsFiles,
                tasks: [ 'jshint:all' ]
            }
        },

        // Make sure code styles are up to par and there are no obvious mistakes
        jshint: {
            options: {
                jshintrc: '.jshintrc',
                reporter: require( 'jshint-stylish' )
            },
            all: [
                jsFiles
            ]
        }
    } );

    /**
     * Register main build task
     * ------------------------------------------
     */
    //grunt.registerTask( 'build', [] );

    /**
     * Unit tests task
     * ------------------------------------------
     */
};
