
import "reflect-metadata";
import * as fs from 'fs';
import {createConnection, Repository} from "typeorm";
import {Pocsag} from "./entity/pocsag";
import {Utils} from "./Utils";
const utils = new Utils();

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
    pocsag1.msgText = "Hoax,test-rows";
    let pocsagRepository = connection.getRepository(Pocsag);
    await pocsagRepository.save(pocsag1);
    console.log('Catalog has been saved'+'\n');
    await readFile("./",pocsagRepository);


}).catch(error => console.log(error));

async function readFile(filename: string, pocsagRepository: Repository<Pocsag>) {
    try {

        // ✅ Read contents of directory
        fs.readdir(filename, (err, files) => {
            if (err)
                console.log(err);
            else {
                console.log("\nCurrent directory filenames:");
                const lineReader = require('line-reader');

                files.forEach(file => {
                  if(fs.lstatSync(file).isFile() && file.includes(".log"))  {
                      let pocsag1 = new Pocsag();
                      let message = "";
                      lineReader.eachLine(file, function(line, last) {
                          let splited =line.trim().split(/\s+/);
                          let count = splited.length;
                          if(!line || count ==0){
                              try {
                                  pocsag1.msgText =  message;
                                  console.log(
                                      " pagerID: " + pocsag1.pagerID +
                                      " msgTime: " + pocsag1.msgTime +
                                      " msgDate: " + pocsag1.msgDate +
                                      " msgEnc: "  + pocsag1.msgEnc +
                                      " msgType: " + pocsag1.msgType +
                                      " msgBaud: " + pocsag1.msgBaud +
                                      " msgText: " + pocsag1.msgText);
                                  message ="";
                                 pocsagRepository.save(pocsag1);
                                  pocsag1 = new Pocsag();
                              } catch (e) {
                                  console.log(e);
                              }
                          } else {
                              if(count < 6){
                                  message += splited[0];
                                  pocsag1.msgText += splited[0];
                              } else if (!isNaN(+splited[0])&& !isNaN(splited[5])) {
                                  pocsag1.pagerID = splited[0];
                                  pocsag1.msgTime = splited[1];
                                  pocsag1.msgDate = splited[2];
                                  pocsag1.msgEnc = splited[3];
                                  pocsag1.msgType= splited[4];
                                  pocsag1.msgBaud= splited[5];

                                  for(let i = 6; i < count; i++) {
                                      message +=  splited[i];
                                  }

                              }
                          }
                          if(last) {
                              console.log('Last line printed.');
                              const used = process.memoryUsage().heapUsed / 1024 / 1024;
                              console.log(`The script uses approximately ${Math.round(used * 100) / 100} MB`);
                          }
                      });
                      utils.moveFiles(file,"./arkiv/" + file);
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