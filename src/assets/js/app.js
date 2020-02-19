require('../css/app.less');

// require jQuery normally
const $ = require('jquery');

// create global $ and jQuery variables
global.$ = global.jQuery = $;

console.log('Webpack Encore Done');