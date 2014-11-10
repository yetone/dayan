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
    this.handlerList = [];
  }
  var proto = DyService.prototype;
  proto.request = function(opt, cbk) {
    var self = this;
    var token = utils.parseCookie(opt.req.headers.cookie).token;
    opt = utils.extend({
      method: 'GET'
    }, opt);
    baseParams = utils.getQueryParams(opt.req.url);
    opt.url = utils.genUrl(opt.url, token ? utils.extend({
      auth_token: token,
    }, baseParams) : baseParams);
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
  proto.registerHandler = function(router, url, method) {
    var self = this;
    var arr = router;
    if (utils.getType(arr) !== 'Array') {
      arr.push({
        router: router,
        url: url,
        method: method
      });
    }
    var i = 0, l = arr.length, item;
    for (; i < l; i++) {
      item = arr[i];
      self.handlerList.push([item.router, (function(item) {
        return function(req, resp) {
          self.request({
            url: item.url,
            method: item.method ? item.method.toUpperCase() : 'GET',
            req: req,
            resp: resp,
          });
        };
      })(item)]);
    }
  };
  proto.route = function(req, resp) {
    var self = this;
    var pathname = url.parse(req.url).pathname;
    pathname = pathname.charAt(pathname.length - 1) === '/' ? pathname : pathname + '/';
    var i = 0, l = self.handlerList.length, match, item, re;
    for (; i < l; i++) {
      item = self.handlerList[i];
      re = new RegExp(('^' + item[0]).replace(/\//g, '\\/'));
      match = pathname.match(re);
      if (!match) continue;
      item[1](req, resp);
      return;
    }
    resp.statusCode = 404;
    resp.end('not found');
  };
  return DyService;
})();

var dyService = new DyService();
var handlerList = [
  {
    router: '/api/home/posts/',
    url: 'http://ios_blog.mzread.com/api/v1/blog/blogs/posts.json?follow_recommend=0&guids=gdwoe03ijwaz,5ic3s21bef1c,pz2kjn97f6p5,bgu1174zachb,6rnziw9cxbeb,9exbc514t2qo,196mew405l8p,h5olip5o2xe5,te5sicmon9sf,hix6ukuly98p,t2xrgexfmg90,',
  },
  {
    router: '/api/group/posts/',
    url:'http://ios_blog.mzread.com/api/v1/blog/blogs/blog.json',
  },
  {
    router: '/api/group/follow/',
    url: 'http://ios_blog.mzread.com/api/v1/blog/follow_blogs/follow_blogs.json',
    method: 'POST',
  },
  {
    router: '/api/group/unfollow/',
    url: 'http://ios_blog.mzread.com/api/v1/blog/follow_blogs/unfollow_blogs.json',
    method: 'POST',
  },
  {
    router: '/api/categories/',
    url: 'http://ios_blog.mzread.com/api/v1/blog/blog_categories.json',
  },
  {
    router: '/api/category/detail/',
    url: 'http://ios_blog.mzread.com/api/v1/blog/blog_categories/category.json',
  },
  {
    router: '/api/login/',
    url: 'http://ios_blog.mzread.com/api/tokens.json',
    method: 'POST',
  },
  {
    router: '/api/follows/',
    url: 'http://ios_blog.mzread.com/api/v1/blog/follow_blogs.json',
  },
];
dyService.registerHandler(handlerList);

server.on('request', function(req, resp) {
  var pathname = url.parse(req.url).pathname;
  pathname = pathname.charAt(pathname.length - 1) === '/' ? pathname : pathname + '/';
  if (pathname === '/') {
    return fs.readFile('./index.html', function(err, data) {
      if (err) {
        resp.statusCode = 502;
        return resp.end('some error');
      }
      resp.end(data.toString());
    });
  }
  if (pathname.indexOf('/css/') === 0 || pathname.indexOf('/js') === 0) {
    return file.serve(req, resp);
  }
  dyService.route(req, resp);
});

server.listen(program.port, program.host, function() {
  console.log('Listening %s:%d', program.host, program.port);
});
