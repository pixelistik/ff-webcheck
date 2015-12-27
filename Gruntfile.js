module.exports = function(grunt) {
    grunt.initConfig({
        mutationTest: {
            options: {
                testFramework: 'mocha',
                mutateProductionCode: true
            },
            target: {
                options: {
                    code: ['js/app.js', 'js/checkresourceconnectivity.js', 'js/ffwebcheck.js', 'js/ipranges.js', 'js/stun.js'],
                    specs: 'test/*.js',
                    mutate: ['js/app.js', 'js/checkresourceconnectivity.js', 'js/ffwebcheck.js', 'js/ipranges.js', 'js/stun.js']
                }
            }
        }
    });

    grunt.loadNpmTasks('grunt-mutation-testing');
};
