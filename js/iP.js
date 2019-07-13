const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const inputFolder = "img";
const outputFolder = "public/resources/img/ref";

const fileExtension = 'jpg';


let rmdir = dirPath => {
  let files;

  const outputFolderExists = fs.existsSync(outputFolder);
  if (!outputFolderExists) {
    return;
  }

  files = fs.readdirSync(dirPath)
  if (files.length) {
    files.forEach( fileName => {
      let filePath = path.join(dirPath, fileName);

      stat = fs.statSync(filePath);
      if (stat && stat.isDirectory()) {
        rmdir(filePath);
      } else {
        fs.unlinkSync(filePath);
      }
    })
  }
  fs.rmdirSync(dirPath);
}

let convert = (dirPath, outputP = outputFolder) => {
  let files;
  let counter = 0;

  // check if output folder exists
  const outputFolderExists = fs.existsSync(outputFolder);
  if (!outputFolderExists) {
    fs.mkdirSync(outputFolder);
  }

  files = fs.readdirSync(dirPath);
  if (files.length) {
    files.forEach (fileName => {
      let filePath = path.join(dirPath, fileName);


      stat = fs.statSync(filePath);

      if (stat && stat.isDirectory()) {

        let outputPath = filePath.replace(inputFolder, outputFolder);

        fs.mkdirSync(outputPath);
        convert(filePath, outputPath);

      } else {

        const notSysFolder = fileName.charCodeAt(0) !== 46;
        if (notSysFolder) {
          counter += 1;
          let thumbs = outputP + '/thumbs';
          if (!fs.existsSync(thumbs)) {
            fs.mkdirSync(thumbs);
          }
          createImg( filePath, outputP, counter);
          createImgThumb( filePath, thumbs, counter);

        }
      }
    })
  }
}

let createImg = ( filePath, outputP, counter) => {
  sharp(filePath)
  .rotate()
  .toFile(`${outputP}/${counter}.${fileExtension}`, (err, info) => {
    if (err) throw err;
  })
}

let createImgThumb = ( filePath, outputP, counter) => {
  sharp(filePath)
  .rotate()
  .resize(480)
  .toFile(`${outputP}/${counter}.${fileExtension}`, (err, info) => {
    if (err) throw err;
  })
}


rmdir(outputFolder);
convert(inputFolder);
