const path = require('path');

module.exports = {
    entry: './content_scripts/userScriptTrigger.js',
    devtool:'source-map',
    output: {
        filename: 'issues.js',
        path: path.resolve(__dirname, 'dist')
    }
};