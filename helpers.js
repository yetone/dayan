// Generated by LiveScript 1.3.1
(function(){
  var request, readability, getReadableContent;
  request = require('request');
  readability = require('readability');
  getReadableContent = function(url, cbk){
    return request(url, function(err, response, body){
      if (!err && response.statusCode === 200) {
        return readability.parse(body, url, function(result){
          return cbk(result);
        });
      }
    });
  };
  module.exports = {
    getReadableContent: getReadableContent
  };
}).call(this);