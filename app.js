var fs = require('fs');
var program = require('commander');
var request = require('request');
var static = require('node-static');
var file = new static.Server('./static');
var http = require('http');
var server = http.createServer();
var utils = require('./utils.js');

program
  .version('0.0.1')
  .option('-p, --port <n>', 'port', 18888)
  .option('-H, --host [value]', 'host', '127.0.0.1')
  .parse(process.argv);

function handleAPI(req, resp) {
  var baseUrl = 'http://ios_blog.mzread.com/api/v1/blog/blogs/posts.json?auth_token=r4uGGVkb6oTazGri__9F&follow_recommend=0&guids=gdwoe03ijwaz,5ic3s21bef1c,pz2kjn97f6p5,bgu1174zachb,6rnziw9cxbeb,9exbc514t2qo,196mew405l8p,h5olip5o2xe5,te5sicmon9sf,hix6ukuly98p,t2xrgexfmg90,';
  var params = utils.getQueryParams(req.url);
  var url = utils.genUrl(baseUrl, params);
  req.pipe(request(url)).pipe(resp);
}

server.on('request', function(req, resp) {
  if (req.url.indexOf('/api/posts') === 0) {
    return handleAPI(req, resp);
  }
  if (req.url.indexOf('/css') === 0 || req.url.indexOf('/js') === 0) {
    return file.serve(req, resp);
  }
  fs.readFile('./index.html', function(err, data) {
    if (err) return resp.end(502);
    resp.end(data.toString());
  });
});

server.listen(program.port, program.host, function() {
  console.log('Listening %s:%d', program.host, program.port);
});
