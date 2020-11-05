var fs = require('fs');
var path = require('path');
const PO = require('pofile');
const excelToJson = require('convert-excel-to-json');


    let filePath = "src/locales/en/messages.po";
    let fileBaseName = path.basename(filePath);
    var outputFile = "lang_en.xlsx";

    let localesDir = "src/locales/";

    function getDirectories(path) {
        return fs.readdirSync(path).filter(function (file) {
            return fs.statSync(path+'/'+file).isDirectory();
        });
    }
    
    let localTypes = getDirectories(localesDir).filter( d => d[0] !== "_" );

    let readableData = fs.readFileSync(filePath, 'utf8');
    let poFormatData = PO.parse(readableData);

    const getElementReferences = key => {
        let element =  poFormatData.items && poFormatData.items.find( item => item.msgid === key);        
        return element && element.references;
    }

    const resultData = excelToJson({
        sourceFile: outputFile,
        columnToKey: {
            '*': '{{columnHeader}}'
        }
    });

    var jsonObj = Object.values(resultData)[0];    

    localTypes && localTypes.forEach( (file, index) => {
        let fileLocation = `${localesDir}${file}/${fileBaseName}`;
        
        var po = new PO();
        let comments= poFormatData.comments;
        let extractedComments= poFormatData.extractedComments;
        let headers= poFormatData.headers;
        let headerOrder= poFormatData.headerOrder;

        let items = [];
        jsonObj && jsonObj.map( item => {  
                                          
            let msgid = item.msgid;
            let msgstr = item[`msgstr_${file}`];
            let msgStrPlural = item[`msgstr_Plural_${file}`];

            if(isPluralKey(item.msgid)){
                let pluralKey = item.msgid.replace("{","").split(",");                                 
                msgstr = `{${pluralKey ? pluralKey[0] : 0}, plural, one {${msgstr}} other {${msgStrPlural}} zero { }}`;
            }
            
            let references = getElementReferences(msgid);
            
            let referencesStr ="";
            references && references.forEach( (ref, i) => {
                return referencesStr += `#: ${ref}${ i < references.length -1 ? "\n" : ""}`
            })
            let itemx= `${referencesStr}\nmsgid "${msgid}"\nmsgstr "${msgstr}"`;
                po.Item = itemx;
                items.push(po.Item);
        })
        
        po.comments=  comments;
        po.extractedComments= extractedComments;
        po.headers= headers;
        po.headerOrder= headerOrder;
        po.items = items;
                    
        po.toString();
        po.save(fileLocation, (err) => err !== null && console.log(err));
    
    });
     

    function isPluralKey( key ) {
        return key.startsWith("{") && key.endsWith("}")
    }