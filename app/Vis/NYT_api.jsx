$ = require('jquery');
S = require('string');
var stoplist = ["the", "for", "in", "year", "years", "but", "of", "new",
                "to", "at", "a", "on", "from", "as", "every", "say", 
                "that", "make", "de", "two", "up", "with", "no", "is", 
                "may", "more", "before", "an", "by", "get", "best", 
                "back", "it", "can", "are", "says", "how", "time", "times",
                "again", "top", "when", "week", "and", "day", "cut", 
                "wait", "since", "what", "least", "part", "have", "start",
                "win", "be", "talks", "out", "into", "big", "talks", 
                "found", "over", "after", "your", "first", "high", 
                "keep", "their", "some", "open", "ends", "was", "its", 
                "notice:", "end", "ahead", "this", "will", "help", "away",
                "little", "another", "or", "not", "around", "you", 
                "look", "has", "where", "about", "listings", "those", 
                "still", "case", "us", "all", "against", "man", "tour",
                "off", "team", "group", "paid", "past", "test", "down", 
                "reach", "wins", "raises", "4", "early", "take", "set",
                "response", "won't", "should", "2", "seek", "rise", 
                "oct.", "calls", "charged", "his", "charged", "deal", 
                "report", "finally", "posts", "hong", "behind"
                ];

var NYT_api = {};
NYT_api.get_data = function(year, cur_month, page_limit, callback) {
//used to get progress (not done yet)
  var searchTerm = "";
  var per_set = 10;
  var page_counter = 0;
  var totalDone = 0;
  // global data used for processSets
  var globalData = [];
  var api_key = "1ca882140f11fee967a0d3a79b348f93:6:69878891";

  //$progress.text("Beginning work...");
  return processSets(globalData, cur_month, year, per_set, page_counter, 
                     page_limit, totalDone, api_key, callback);
};

function fetchForMonth(year, month, page, totalDone, api_key) {
  //YYYYMMDD
  var month_str;
  if(month < 10) month_str = "0"+month; else month_str = month.toString();
  var startYearStr = year + month_str+"01";
  var endYearStr = year + month_str+"30";
  console.log('doing year '+year+'and month '+month+' with offset '+page);
  
  return $.get("http://api.nytimes.com/svc/search/v2/articlesearch.json", {
          "api-key":api_key,
          sort:"newest",
          begin_date:startYearStr,
          end_date:endYearStr,
          page:page,
          fl:"keywords,headline,snippet,pub_date,news_desk"}, function() {
            totalDone++;
  }, "JSON");
}

function processSets(globalData, cur_month, 
                     year, per_set, page_counter, page_limit,
                     totalDone, api_key, callback){
  var promises = [];
  for(var i=0;i<per_set;i++) {
    page_counter++;

    var result = fetchForMonth(year, cur_month, page_counter, totalDone, 
                             api_key);
    promises.push(result);
  }
  $.when.apply($, promises).done(function() {
    console.log('DONE with Set '+promises.length +" total "+totalDone);
    
    //update progress
    var percentage = Math.floor(totalDone/page_limit*100);
    //$progress.text(percentage);
    
    //massage into something simpler
    // handle cases where promises array is 1
    var docs; 
    for(var i=0,len=arguments.length;i<len;i++) {
      toAddRaw = (promises.length !== 1) ? arguments[i][0]: arguments[0];
      docs = toAddRaw.response.docs;
      console.log(docs);
      docs.forEach(function(doc){
        if(doc.headline.main !== undefined){
          var headline_lc = doc.headline.main.toLowerCase();
          var headline_uc = doc.headline.main;
        // TODO: trim words
          var words = headline_lc.match(/\S+/g); 
          words.forEach(function(word){
            if (stoplist.indexOf(word) == -1){
              globalData.push({
                text: word,
                headline: headline_uc,
                doc: doc,
                pub_date: doc.pub_date,
                keywords: doc.keywords,
                news_desk: doc.news_desk
              });
            }
          });
        }
      });
    }
    var ret;
    if(docs.length > 0 && page_counter < page_limit){
      setTimeout(function(){
        console.log("FIRST");
        ret = processSets(globalData, cur_month, 
                    year, per_set, page_counter, page_limit, 
                    totalDone, api_key, callback);
      }, 900);
    }else {
        // callback with the data to be returned
      callback(globalData);
    }
  });
}
module.exports = NYT_api;
