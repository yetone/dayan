var fs = require('fs');
var program = require('commander');
var request = require('request');
var static = require('node-static');
var file = new static.Server('./static');
var http = require('http');
var server = http.createServer();
var url = require('url');
var utils = require('./utils.js');

program
  .version('0.0.1')
  .option('-p, --port <n>', 'port', 18888)
  .option('-H, --host [value]', 'host', '127.0.0.1')
  .parse(process.argv);

var DyService = (function() {
  function DyService(token) {
    this.token = token || '7aNMJLgmvetQJngGwhyy';
  }
  var proto = DyService.prototype;
  proto.setToken = function(token) {
    this.token = token;
  };
  proto.request = function(opt, cbk) {
    var self = this;
    opt = utils.extend({
      method: 'GET'
    }, opt);
    baseParams = opt.req ? utils.getQueryParams(opt.req.url) : {};
    opt.url = utils.genUrl(opt.url, utils.extend({
      auth_token: self.token,
    }, baseParams));
    if (!opt.req || !opt.resp) return request(opt, cbk);
    switch (opt.method.toUpperCase()) {
      case 'POST':
        var body = '';
        opt.req.on('data', function(data) {
          body += data;
        });
        opt.req.on('end', function() {
          var form = utils.queryStrToObj(body);
          opt.req.pipe(request.post(opt.url, {form: form})).pipe(opt.resp);
        });
        break;
      case 'GET':
        opt.req.pipe(request.get(opt.url)).pipe(opt.resp);
        break;
    }
  };
  proto.homeHandler = function(req, resp) {
    var self = this;
    var url = 'http://ios_blog.mzread.com/api/v1/blog/blogs/posts.json?follow_recommend=0&guids=gdwoe03ijwaz,5ic3s21bef1c,pz2kjn97f6p5,bgu1174zachb,6rnziw9cxbeb,9exbc514t2qo,196mew405l8p,h5olip5o2xe5,te5sicmon9sf,hix6ukuly98p,t2xrgexfmg90,';
    self.request({
      url: url,
      req: req,
      resp: resp,
    });
  };
  proto.groupHandler = function(req, resp) {
    var self = this;
    var url = 'http://ios_blog.mzread.com/api/v1/blog/blogs/blog.json';
    self.request({
      url: url,
      req: req,
      resp: resp,
    });
  };
  proto.fo = function(req, resp) {
    var self = this;
    var url = 'http://ios_blog.mzread.com/api/v1/blog/follow_blogs/follow_blogs.json';
    self.request({
      url: url,
      method: 'POST',
      req: req,
      resp: resp,
    });
  };
  proto.unfo = function(req, resp) {
    var self = this;
    var url = 'http://ios_blog.mzread.com/api/v1/blog/follow_blogs/unfollow_blogs.json';
    self.request({
      url: url,
      method: 'POST',
      req: req,
      resp: resp,
    });
  };
  return DyService;
})();

var dyService = new DyService();

function handleAPI(req, resp) {
  var pathname = url.parse(req.url).pathname;
  pathname = pathname.charAt(pathname.length - 1) === '/' ? pathname : pathname + '/';
  switch (pathname) {
    case '/api/home/posts/':
      dyService.homeHandler(req, resp);
      break;
    case '/api/group/posts/':
      dyService.groupHandler(req, resp);
      break;
    case '/api/group/follow/':
      dyService.fo(req, resp);
      break;
    case '/api/group/unfollow/':
      dyService.unfo(req, resp);
      break;
    default:
      resp.statusCode = 404;
      resp.end('not found');
      break;
  }
}

server.on('request', function(req, resp) {
  if (req.url.indexOf('/api/') === 0) {
    return handleAPI(req, resp);
  }
  if (req.url.indexOf('/css') === 0 || req.url.indexOf('/js') === 0) {
    return file.serve(req, resp);
  }
  fs.readFile('./index.html', function(err, data) {
    if (err) {
      resp.statusCode = 502;
      return resp.end('some error');
    }
    resp.end(data.toString());
  });
});

server.listen(program.port, program.host, function() {
  console.log('Listening %s:%d', program.host, program.port);
});
