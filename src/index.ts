
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
                      lineReader.eachLine(file, function(line, last) {
                         // console.log(`Line from file: ${line}`);
                          var splitted =line.trim().split(/\s+/);
                       //   console.log("Splitted: " + splitted);
                          let count = splitted.length;
                          if(!line || count ==0){
                              try {
                                  console.log(
                                      " ID: " + pocsag1.id +
                                      " pagerID: " + pocsag1.pagerID +
                                      " msgTime: " + pocsag1.msgTime +
                                      " msgDate: " + pocsag1.msgDate +
                                      " msgEnc: " + pocsag1.msgEnc +
                                      " msgType: " + pocsag1.msgType +
                                      " msgBaud: " + pocsag1.msgBaud +
                                      " msgText: " + pocsag1.msgText);
                                  pocsagRepository.save(pocsag1);
                              } catch (e) {
                                  console.log(e);
                              }
                          } else {
                              if(count < 3){
                                  //pocsag1.msgText += splitted[0];
                              } else {
                                  pocsag1.pagerID = splitted[0];
                                  pocsag1.msgTime = splitted[1];
                                  pocsag1.msgDate = splitted[2];
                                  pocsag1.msgEnc = splitted[3];
                                  pocsag1.msgType= splitted[4];
                                  pocsag1.msgBaud= splitted[5];
                                  let msgt = "";
                                  for(let i = 6; i < count; i++) {
                                      msgt +=  splitted[i];
                                  }
                                  pocsag1.msgText =  msgt;
                              }
                          }
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