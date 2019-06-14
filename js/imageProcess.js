const sharp = require('sharp');
const fs = require('fs').promises;

// console.log(fs);

const inputFolder = 'img/';
const outputFolder = 'public/resources/outputImages/';

// Find out what folders and files are in input folder
fs.readdir(inputFolder)
  .then (function (items) {

    //Cycle throught each item in input folder
    for (let i = 1; i < items.length; i++) {

      //Find out if it folder
      fs.stat(inputFolder + items[i])
        .then (function (stats) {

          //If its folder then go inside and find out if there are any images
          if (stats.isDirectory()) {

            fs.readdir(inputFolder + '/' + items[i] + '/')
            .then (function (images) {

              //recreating folder structure of input folder
              fs.mkdir (outputFolder + items[i] + '/' )
                .then (function() {

                  //convert each file to what do you want
                  for (let j = 0; j < images.length; j++) {

                    let fileName = images[j].slice(0, images[j].length - 4);
                    sharp(inputFolder + '/' + items[i] + '/' + images[j])
                      // .resize(100)
                      .toFile(outputFolder + items[i] + '/' + (j + 1) + '.webp', function (err, info) {

                      })
                  }
                })
                .catch (function (err) {
                  console.log(err);
                })
            })
            .catch (function (err) {
              console.log(err);
            })
          }
        })
        .catch (function (err) {
          console.log(err);
        });
    }
  })
  .catch (function (err) {
    console.log(err);
  });

    // for (let i = 1; i < files.length; i++) {
    //   //strip extension
    //   let fileName = files[i].slice(0, files[i].length-4)
    //   console.log('inputFolder/' + files[i]);
    //   sharp(inputFolder +'/' + files[i])
    //     .resize(100)
    //     .toFile(outputFolder + '/' + [i]+1 + '.webp', function (err, info) {
    //       console.log(info);
    //     })

    // }

// sharp(inputFolder + '/fasady/fasady_01.jpg')
//   // .resize(100)
//   .toFile(outputFolder + 'qq.webp', function (err, info) {
//     // console.log(info);
//   })


// sharp('public/resources/js/image/images/test.jpg')
//   .resize(100)
//   .toFile('public/resources/js/image/images/test.webp', function (err, info) {
//     console.log(info);
//   })

