const fs = require('fs');
const recursive = require("recursive-readdir");

let localesDir = "src/locales";
let sourceDir = `${localesDir}/_build/src`;

function isPluralKey( key ) {
    return key.startsWith("{") && key.endsWith("}")
}

function ReadKeysFromJsonFile() {
    recursive(sourceDir, function (err, files) {
        let newObject = {};
        if(files){
            files.forEach( file => {
              let localesData = fs.readFileSync(file, 'utf8');
              let parsedDate = JSON.parse(localesData);
              parsedDate && 
                Object.keys(parsedDate).forEach( key => {
                        let currentValue = parsedDate[key];
                        if((typeof currentValue["defaults"] == "undefined" || currentValue["defaults"] === null) && !isPluralKey(key) ){
                            console.log("catched error for default value in ", currentValue["origin"] );
                        }else{
                            return newObject[key] = currentValue.defaults;
                        }
                });
            })
        }else{
            console.log('Unknown Error', err);
        }
        console.log(newObject);
    });
}

ReadKeysFromJsonFile();

