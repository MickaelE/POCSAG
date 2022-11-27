
import "reflect-metadata";
import * as fs from 'fs';
import {createConnection, Repository} from "typeorm";
import {Pocsag} from "./entity/pocsag";
import * as path from "path";

createConnection({
    type: "mysql",
    host: "localhost",
    port: 3306,
    username: "jc",
    password: "snudefar",
    database: "Pocsag",
    entities: [
        __dirname + "/entity/*.ts"
    ],
    synchronize: true,
    logging: false
}).then(async connection => {
    let pocsag1 = new Pocsag();
    pocsag1.msgBaud=1200;
    pocsag1.pagerID = 333444;
    pocsag1.msgTime = "16:50:00";
    pocsag1.msgDate = "2022-10-10";
    pocsag1.msgType ="ALFA";
    pocsag1.msgEnc="POLSAG-1";
    pocsag1.msgText = "Hoax,testrows";
    let pocsagRepository = connection.getRepository(Pocsag);
    await pocsagRepository.save(pocsag1);
    console.log('Catalog has been saved'+'\n');
    await readFile("./",pocsagRepository);
    let [all_Catalogs, CatalogsCount] = await pocsagRepository.findAndCount();


}).catch(error => console.log(error));

async function readFile(filename: string, pocsagRepository: Repository<Pocsag>) {
    try {
        let pocsag1 = new Pocsag();
        // ✅ Read contents of directory
        fs.readdir(filename, (err, files) => {
            if (err)
                console.log(err);
            else {
                console.log("\nCurrent directory filenames:");
                const lineReader = require('line-reader');

                files.forEach(file => {
                  if(fs.lstatSync(file).isFile() && file.includes(".log"))  {
                      lineReader.eachLine(file, function(line, last) {
                          console.log(`Line from file: ${line}`);
                          var splitted =line.split(" ", 50);
                          console.log("Splitted: " + splitted);
                          pocsag1.id = splitted[0];
                          pocsag1.msgTime = splitted[1];
                          pocsag1.msgDate = splitted[2];
                          pocsag1.msgEnc = splitted[3];
                          pocsag1.msgType= splitted[4];
                          pocsag1.msgBaud= splitted[5];
                          pocsag1.msgText= splitted[6];
                          if(pocsag1.id.toString() == ""){
                              pocsag1.msgText=splitted[2]
                          }
                          if(!line){
                              console.log("Text: " + pocsag1.id  +
                                  " Text: " + pocsag1.msgTime +
                                  " Text: " + pocsag1.msgDate +
                                  " Text: " + pocsag1.msgEnc  +
                                  " Text: " + pocsag1.msgType +
                                  " Text: " + pocsag1.msgBaud +
                                  " Text: " + pocsag1.msgText);
                             // pocsagRepository.save(pocsag1);
                          }
                          console.log(" Text: " +pocsag1.msgText)
                          if(last) {
                              console.log('Last line printed.');
                              const used = process.memoryUsage().heapUsed / 1024 / 1024;
                              console.log(`The script uses approximately ${Math.round(used * 100) / 100} MB`);
                          }
                      });
                  } else {
                      console.log(file);
                  }

                })
            }
        })
    } catch (err) {
        console.log('error is: ', err);
    }

}