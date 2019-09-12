'use strict';

const fs = require('fs');
const yaml = require('./js-yaml.min');

class YamlFileReader {
    static read(filePath) {
        try {
            const fileContent = fs.readFileSync(filePath, 'utf8');
            
            return yaml.safeLoad(fileContent);
        } catch (ex) {
            console.error(ex);
            return '';
        }
    }
}

module.exports = YamlFileReader;
