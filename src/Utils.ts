
const fs = require('fs-extra')
export class Utils {

  moveFiles(oldFile, newFile){
    fs.copy(oldFile, newFile)
    .then(() => console.log('success!'))
    .catch(err => console.error(err))

  }
}
