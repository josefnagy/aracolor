const sharp = require('sharp');
const fs = require('fs').promises;
const chalk = require('chalk');

const inputFolder = 'img/';
const outputFolder = 'public/resources/img/ref/';
const outputExtension = '.jpg';

let inputImgFolderSize = 0;
let outputImgFolderSize = 0;

function roundUp(num, precision) {
  precision = Math.pow(10, precision);
  return Math.ceil(num * precision) / precision;
}


// Clean up outputFolder
fs.readdir(outputFolder)
  .then( function (items) {
    // console.log(items);

    if (items.length > 1) {
      // console.log('.'.charCodeAt(0));
      items.forEach(function (folder) {
        if (folder.charCodeAt(0) !== 46) {
          // console.log(folder);
          fs.readdir(outputFolder + folder + '/')
            .then(function (image) {

              image.forEach(function (i) {
                let path = outputFolder + folder + '/' + i;
                fs.unlink(path, function (error) {
                  console.log(err);
                });
                // console.log(path);
              })
            })
            .then (function () {
              // console.log(folder);
              fs.rmdir(outputFolder + folder);
            })
        }
      })
    }
  })
  .then (function () {
    // When cleanup is finished
    // Find out what folders and files are in input folder
    fs.readdir(inputFolder)
      .then(function (items) {

        //Cycle throught each item in input folder
        for (let i = 1; i < items.length; i++) {

          //Find out if it folder
          fs.stat(inputFolder + items[i])
            .then(function (stats) {

              //If its folder then go inside and find out if there are any images
              if (stats.isDirectory()) {

                fs.readdir(inputFolder + '/' + items[i] + '/')
                  .then(function (images) {

                    //recreating folder structure of input folder
                    fs.mkdir(outputFolder + items[i] + '/')
                      .then(function () {
                        // console.log('Creating folder..' + outputFolder + items[i] + '/');

                        //convert each file to what do you want
                        for (let j = 0; j < images.length; j++) {

                          fs.stat(inputFolder + '/' + items[i] + '/' + images[j])
                            .then(function (imgStat) {
                              // console.log(inputFolder + '/' + items[i] + '/' + images[j]);
                              // console.log(inputFolder + '/' + items[i] + '/' + images[j]);
                              // console.log(imgStat.size);
                              inputImgFolderSize += (imgStat.size / 1000000.0);
                            })
                            .catch(function (err) {
                              console.log(err);
                            });

                          let fileName = images[j].slice(0, images[j].length - 4);
                          sharp(inputFolder + '/' + items[i] + '/' + images[j])
                            // .resize(100)
                            .rotate()
                            .toFile(outputFolder + items[i] + '/' + (j + 1) + outputExtension, function (err, info) {
                              if (err) throw err;
                              // console.log('Creating image ' + chalk.green.inverse((j + 1) + outputExtension) + ', size... ' +  chalk.green(roundUp (info.size / 1000, 0)) + ' KB');
                              outputImgFolderSize += (info.size / 1000000);
                              if (j === images.length - 1) {
                                console.log('    ' + items[i] + ' before: ' + chalk.green.inverse(roundUp(inputImgFolderSize, 2)) + ' MB');
                                console.log('    ' + items[i] + ' after : ' + chalk.green.inverse(roundUp(outputImgFolderSize, 2)) + ' MB');
                                console.log(chalk.blue('----------------------------------'));
                              }
                            })
                        }
                      })
                      .catch(function (err) {
                        console.log(err);
                      })
                  })
                  .catch(function (err) {
                    console.log(err);
                  })
              }
            })
            .catch(function (err) {
              console.log(err);
            });
        }
      })

  .catch(function (err) {
    console.log(err);
  });

    // fs.rmdir();
})
