const rp = require('request-promise');
const cheerio = require('cheerio');
const fs = require('fs');
const async = require('async')
const Promise = require("promise");
const express = require("express");
const app = express()
//const writeStream = fs.createWriteStream('post.csv')
const ObjectsToCsv = require('objects-to-csv');
const bodyParser = require("body-parser");
const ejs = require("ejs")


var bodyParserencoded = bodyParser.urlencoded({extended:false});
//writeStream.write('Business Name,Link,Phone Number,Address');

const webLink = 'https://www.yellowpages.com'
let data = []

let file_name = './test.csv'
let uri = '';
let start_page 
let end_page
let msg = '' 


app.get('/deleteFile', (req, res) => {
    fs.unlink('test.csv', function (err) {
        //if (err) throw err;
        // if no error, file has been deleted successfully
        //console.log('File deleted!');
        if (err) {
            msg = err
        } else {
            msg = 'File deleted!'
        }
        
    }); 
    res.render('index',{msg});
});

app.get('/download', function(req, res){
    //var file = __dirname + '/upload-folder/dramaticpenguin.MOV';
    res.download(file_name); // Set disposition and send it.
    //res.render('index',{msg});
  });


app.set('view engine', 'ejs');

app.get('/', (req, res) => {
    res.render('index',{msg});
});

app.post("/createFile", bodyParserencoded ,function(req, res){
    var newvalues = {  link : req.body.link,
                        start_page : req.body.start_page,
                        end_page : req.body.end_page,
                    };
                    uri = newvalues.link;
                    start_page = newvalues.start_page;
                    end_page = newvalues.end_page;

                    for(i=start_page ; i <= end_page ; i++){
                        const mainLink = uri.concat(`&page=${i}`)
                    
                        getAllData(mainLink ,()=> {
                            (async() =>{
                                let csv = new ObjectsToCsv(data);
                               
                                // Save to file:
                                await csv.toDisk(`${file_name}`);
                               
                                // Return the CSV file as string:
                                msg = 'file created'
                                res.render('index', {msg});
                              })();
                        })
                    }

                })



function getAllData(mainLink, callback){
    rp(mainLink)
    .then(function(html){

    const $ = cheerio.load(html);

    const promises = []

    $('.result').each((i, el) => {
        const path = $(el).find('.business-name').attr('href');

        const businessName = $(el).find('.business-name').text();
        const phoneNumber = $(el).find('.phones').text();
        const link = webLink.concat(path);

        promises.push(getData(link, businessName ,phoneNumber))
    })
    
    // console.log('promises', promises)
    Promise.all(promises)
        .then(function () {
            //console.log(data)
            callback()
        })
        .catch(function (err) {
            console.log(err)
        });
    })
    .catch(function(err){
        console.log(err)
    });
}

function getData(link, businessName ,phoneNumber) {
    return rp(link)
    .then(function(html){
        let objects = {};
        const $ = cheerio.load(html);
        const fulladdress = $('.address').text();
        const address = fulladdress.split(",");
        let street = ''
        let state = ''
        let zipcode = ''

        for (i=0 ; i < address.length ; i++){
            if(i == 0){
                street = address[i]
            } else if (i == 1){
                state = address[i]
            } else if (i == 2)[
                zipcode = address[i]
            ]
        }

        objects = 
            {
                Business_Name: `${businessName}`,
                Link: `${link}`,
                Phone_Number: `${phoneNumber}`,
                Street: `${street}`,
                State: `${state}`,
                Zip_Code: `${zipcode}`
            }
        //console.log(objects, 'objs')
        
        data.push(objects)

        return Promise.resolve()
    })
    .catch(function(err){
        console.log(err)
        return Promise.reject()
    })
}


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Our app is running on port ${ PORT }`);
});
