$ = require('jquery');
var NYT_api = {};

NYT_api.get_data = function(start_year, end_year, callback) {
//used to get progress (not done yet)
  var page_limit = 10;
  var searchTerm = "";
  var per_set = 10;
  var page_counter = 0;
  var totalDone = 0;
  // global data used for processSets
  var globalData = [];
  //var start_year = $start_year.val();
  //var end_year = $end_year.val();
  var currentYear = start_year; 
  var api_key = "888faef2859ec5406dc922631b612ac1:9:69878891";

  //$progress.text("Beginning work...");
  return processSets(globalData, searchTerm, start_year, end_year, 
                     currentYear, per_set, page_counter, page_limit, 
                     totalDone, api_key, callback);
};

function fetchForYear(year, term, page, totalDone, api_key) {
  //YYYYMMDD
  var startYearStr = year + "0101";
  var endYearStr = year + "1231";
  console.log('doing year '+year+' with offset '+page);
  
  return $.get("http://api.nytimes.com/svc/search/v2/articlesearch.json", {
          "api-key":api_key,
          sort:"oldest",
          begin_date:startYearStr,
          end_date:endYearStr,
          fq:"headline:(\""+term+"\")",
          page:page,
          fl:"keywords,headline,snippet,pub_date"}, function(res) {
            totalDone++;
  }, "JSON");
}

function fetchForYear(year, page, totalDone, api_key) {
  //YYYYMMDD
  var startYearStr = year + "0101";
  var endYearStr = year + "1231";
  console.log('doing year '+year+' with offset '+page);
  
  return $.get("http://api.nytimes.com/svc/search/v2/articlesearch.json", {
          "api-key":api_key,
          sort:"oldest",
          begin_date:startYearStr,
          end_date:endYearStr,
          page:page,
          fl:"keywords,headline,snippet,pub_date"}, function() {
            totalDone++;
  }, "JSON");
}

function processSets(globalData, searchTerm, start_year, end_year, 
                     currentYear, per_set, page_counter, page_limit,
                     totalDone, api_key, callback){
  var promises = [];
  for(var i=0;i<per_set;i++) {
    page_counter++;

    var result;
    if (typeof searchTerm != "undefined" || searchTerm !== ""){
      result = fetchForYear(currentYear, page_counter, totalDone, api_key);
    }else{
      result = fetchForYear(currentYear, searchTerm, page_counter, 
                            totalDone, api_key);
    }
    promises.push(result);
  }
  $.when.apply($, promises).done(function() {
    console.log('DONE with Set '+promises.length +" total "+totalDone);
    
    //update progress
    var percentage = Math.floor(totalDone/page_limit*100);
    //$progress.text(percentage);
    
    //massage into something simpler
    // handle cases where promises array is 1
    var toAddRaw;
    var docs; 
    if(promises.length === 1) {
      toAddRaw = arguments[0];
      doc = toAddRaw.response.docs[0];
      console.log(docs[0]);
      var headline = doc.headline.main.toLowerCase();
      var words = headline.match(/\S+/g); 
      doc.keywords.forEach(function(keyword){
        globalData.push({
          name: keyword.name,
          value: keyword.value,
          words: words,
          rank: keyword.rank,
          is_major: keyword.is_major,
          article: headline,
          date: doc.pub_date
        });
      });
    } 
    else {
      for(var i=0,len=arguments.length;i<len;i++) {
        toAddRaw = arguments[i][0];
        docs = toAddRaw.response.docs;
        console.log(docs);
        var year = currentYear;
        docs.forEach(function(doc){
          var headline = doc.headline.main.toLowerCase();
          var words = headline.match(/\S+/g); 
          doc.keywords.forEach(function(keyword){
            globalData.push({
              name: keyword.name,
              value: keyword.value,
              words: words,
              rank: keyword.rank,
              is_major: keyword.is_major,
              article: headline,
              date: doc.pub_date
            });
          });
        });
      }
    }
    var ret;
    if(docs.length > 0 && page_counter < page_limit){
      setTimeout(function(){
        ret = processSets(globalData, searchTerm, start_year, end_year, 
                    currentYear, per_set, page_counter, page_limit, 
                    totalDone, api_key, callback);
      }, 900);
    }else {
      currentYear++;
      page_counter = 0;
      if(currentYear <= end_year) {
        setTimeout(function(){
          ret = processSets(globalData, searchTerm, start_year, end_year, 
                      currentYear, per_set, page_counter, page_limit, 
                      totalDone, api_key, callback);
        }, 900);
      }else{
        // callback with the data to be returned
        callback(globalData);
      }
    }
  });
}
module.exports = NYT_api;
