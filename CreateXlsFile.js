const fs = require('fs');
const PO = require('pofile');
var excel = require('excel4node');
const recursive = require("recursive-readdir");

  var options = {
    sheetFormat: {
      defaultColWidth: 40,
      defaultRowHeight: 25,
    },
  };

  var workbook = new excel.Workbook();
  var worksheet = workbook.addWorksheet('Sheet 1', options);

  let localesDir = "src/locales/";
  let sourceDir = `${localesDir}/_build/src`;

  function getDirectories(path) {
      return fs.readdirSync(path).filter(function (file) {
          return fs.statSync(path+'/'+file).isDirectory();
      });
  }
  
  let localTypes = getDirectories(localesDir).filter( d => (d[0] !== "_") && d !== "en" );
  
  let filePath = "src/locales/en/messages.po";

  var outputFile = "lang_en.xlsx";
  
  let readableData = fs.readFileSync(filePath, 'utf8');
  let poFormatData = PO.parse(readableData);
  parseContent(poFormatData);

  function parseContent(poFormatData) {
      let filecontents = poFormatData.items;
  
      const fields = ['msgid', 'msgid_plural', 'msgstr_en', 'msgstr_Plural_en'];

      var localTypesPluralStr = [];
      for(let n=0; n < localTypes.length; n++) {
        let subArr = [`msgstr_${localTypes[n]}`, `msgstr_Plural_${localTypes[n]}`];
        localTypesPluralStr = [...localTypesPluralStr, ...subArr];
      }
      
      // let localTypesPluralStr = localTypes.map( g => `msgstr_Plural_${g}`);
      fields.splice(4,0, ...localTypesPluralStr);
      
      fields && fields.forEach( (cellName, index) => {
        worksheet.cell(1,index+1).string(cellName).style({
          font: {
            size: 16,
          },
          alignment: {
            horizontal: 'center',
            indent: 3,
          },
          fill: {
            type: "pattern",
            patternType: "gray125",
            bgColor: "#95DFDC"
          }
        });
      });

      recursive(sourceDir, function (err, files) {
        let keysObj = [];
    
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
                            return keysObj[key] = currentValue.defaults;
                        }
                });
            })
        }else{
            console.log('Unknown Error', err);
        }

        filecontents && filecontents.map((item,index) => {   
          
            let msgId = item.msgid,
                msgIdPlural = item.msgid_plural,
                msgStr_en = keysObj[item.msgid],
                msgStr_plural_en = "";

                if(msgId.startsWith("{")) {
                  let newStr = msgId.replace(/{|}/gi,"").split(",");
                  let pluralStr = newStr[2].split(" ");
                  msgStr_en = pluralStr[2];
                  msgStr_plural_en = pluralStr[4] !== null ? pluralStr[4] : '';              
                }

                let newItem = [msgId, msgIdPlural, msgStr_en, msgStr_plural_en];
                let fakeArray = localTypes.map( r => "" );
                newItem.splice(4,0, ...fakeArray, ...fakeArray);
    
              for(let j =0; j < fields.length; j++) {
                  worksheet.cell(index+2,j+1).string(newItem[j]);                  
              }
          });

          worksheet.row(1).freeze();
          worksheet.row(2).hide();
          worksheet.column(1).hide();
          worksheet.column(2).hide();

          workbook.write(outputFile);

      });
     
    function isPluralKey( key ) {
        return key.startsWith("{") && key.endsWith("}")
    }
 
      
  }

 


