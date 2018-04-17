
var express = require('express');
var app = express();
var bing = require('node-bing-api')({accKey: process.env.API_KEY, rootUri: process.env.ROOT_URI});
var query = require('./schema');
var mongoose = require('mongoose');
var count = 10;
var offset = 0;
let foundImages;


//helpful links https://forum.freecodecamp.org/t/where-to-start-image-search-abstraction-layer/112468 || http://cssgridgarden.com/

app.use(express.static('public'));
app.use(express.urlencoded());
app.use(express.json());
mongoose.connect(process.env.MONGO_URI, err => {err && console.log(err)});


app.get("/", function (request, response) {
  response.sendFile(__dirname + '/views/index.html');
});

app.post('/imagesearch', (req, res) => {
  let search = req.body.searchString;
  queryLog(search);
  imageSearch(search, renderImages);
  function renderImages(){
    res.json(foundImages);
  }
})

app.get('/deleteRecentSearches', (req, res) => {
    mongoose.connection.db.dropCollection("queryobjs", (err, drop) => {
      err ? console.log(err) : console.log('collection dropped');
      res.send('Queries cleared');
    })
})

app.get('/imagesearch/:searchString', (req, res)=> {
  offset = req.query.offset;
  let searchString = req.params.searchString;
  queryLog(searchString);
    imageSearch(searchString, renderImages);
    // res.json({url: foundImages.webSearchUrl , snippet: foundImages.name, thumbnail: foundImages.thumbnailUrl, context: foundImages.hostPageDisplayUrl});
     function renderImages(){
       res.json(foundImages);
     } 
})

app.get('/recentSearches', (req, res) => {
  query.find({}, (err, results) => {
    results.length < 1 ? res.send("no recent searches") : res.json(results);
  })
})

function queryLog(searchString){
  let tempDate = new Date();
  let newQuery = new query({query: searchString, time: tempDate});
  newQuery.save((err, newDatabaseEntry) => err ? console.log(err) : console.log('new query saved to databse'));  
}

function imageSearch(searchString, renderImages){
  bing.images(searchString, {count: count, offset: offset}, function(error, res, body){
    foundImages = body.value;
    makeFinalObject(renderImages);
  });
}

function makeFinalObject(renderImages){
  let imageArr = [];
  foundImages.map(item => {
     imageArr.push({url: item.webSearchUrl, snippet: item.name, thumbnail: item.thumbnailUrl, context: item.hostPageDisplayUrl});
  });
   foundImages = imageArr;
  renderImages();

}

var listener = app.listen(process.env.PORT, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});
