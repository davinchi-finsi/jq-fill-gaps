// set default source and build directories
const gutil = require("gulp-util");
const program = require('commander');
const path = require("path");
program
    .version('0.0.1')
    .option('-p, --port <n>', 'Port for service',parseInt)
    .option('-P, --production', 'Dist for poroduction')
    .option('-n, --no-sourcemap', 'Don not generate sourcemaps').parse(process.argv);
let config = {
    src:process.cwd()+"/src",
    dist:process.cwd()+"/dist",
    sass:{
        exclude:["bower_components/**/*.scss"]
    },
    usemin:"src/*.html",
    production: program.production,
    bowerAssets:[
        "src/bower_components/**/*.css",
        "src/bower_components/**/*.html",
        "src/bower_components/**/*.{svg,jpg,png,gif}",
        "src/bower_components/**/*.json",
        "src/bower_components/**/*.{otf,ttf,woff,woff2,eot}",
        "!src/bower_components/animate.css/source",
        "!src/bower_components/jquery/src",
        "!src/bower_components/jquery/external",
        "!src/bower_components/**/scss",
        "!src/bower_components/**/less",
        "!src/bower_components/**/test",
        "!src/bower_components/**/LICENSE",
        "!src/bower_components/**/CHANGELOG.md",
        "!src/bower_components/**/README.md",
        "!src/bower_components/**/.gitignore",
        "!src/bower_components/**/.babelrc",
        "!src/bower_components/**/.bower.json",
        "!src/bower_components/**/.eslintignore",
        "!src/bower_components/**/.editorconfig",
        "!src/bower_components/**/.eslintrc",
        "!src/bower_components/**/.composer",
        "!src/bower_components/**/webpack.config.js",
        "!src/bower_components/**/postcss.config.js",
        "!src/bower_components/**/*.js",
        "!src/bower_components/**/bower.json",
        "!src/bower_components/**/package.json",
        "!src/bower_components/animate.css/**",
        "!src/bower_components/**/demo/**",
        "!src/bower_components/**/test"
    ],
    copy:[
        "src/fonts/**/*",
        "src/images/**/*"
    ],
    server:{
        port:program.port || 8081
    },
    imagemin:{
        src:"",
        options:{}
    },
    sourcemap:!(!!program.production || program.noSourcemap)
};
config.imagemin.src = path.join(config.dist,"**/*");
module.exports = config;