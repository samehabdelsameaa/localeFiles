const fs = require('fs');
const PO = require('pofile');
const path = require('path');

    let localesDir = "src/locales/";

    function getDirectories(path) {
        return fs.readdirSync(path).filter(function (file) {
            return fs.statSync(path+'/'+file).isDirectory();
        });
    }
    
    let localTypes = getDirectories(localesDir).filter( d => d[0] !== "_" );
    
    let filePath = "src/locales/en/messages.po";

    var outputFile = "lang_en.csv";

    let readableData = fs.readFileSync(filePath, 'utf8');
    let poFormatData = PO.parse(readableData);
    parseContent(poFormatData);

    function parseContent(poFormatData) {
        let filecontents = poFormatData.items;
    
        const fields = ['msgid', 'msgid_plural', 'msgstr', 'msgstr_plural', "plural_key", "default_value"];
        fields.splice(3,0, ...localTypes);
        
        let headerStr = "";
        fields.forEach( field => {
            return headerStr += `"${field}",`
        });
        
        let csvFileFormat = "";
        filecontents && filecontents.map(item => {   
            let msgId = item.msgid,
                msgIdPlural = item.msgid_plural,
                msgStr = item.msgstr,
                pluralMsgid =  item.msgid;

            if(msgId.startsWith("{")) {
                let newStr = msgId.replace(/{|}/gi,"").split(",");
                var pluralStrKey = newStr[0];
                let pluralStr = newStr[2].split(" ");
                var pluralStrDefaultValue = pluralStr[7] || "";
                
                msgId = pluralStr[2];
                msgIdPlural = pluralStr[4] !== null ? pluralStr[4] : '';
            }
            return csvFileFormat += `${msgId},\
             ${msgIdPlural === null ? '' : msgIdPlural},\
             ${msgStr},\
             ${" "},\
             ${pluralStrKey !== undefined ? pluralStrKey : ""},\
            ${pluralStrDefaultValue !== undefined ? pluralStrDefaultValue : ""} \n`;
        })
        
        let csvFileFormat2 = headerStr+ "\n" + csvFileFormat;

        fs.writeFile(outputFile, csvFileFormat2, 'utf8', function (err) {
            if (err) {
            console.log('Some error occured');
            } else{
            console.log('saved successfully!');
            }
        });
    }
