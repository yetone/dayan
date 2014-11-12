// Generated by LiveScript 1.3.1
(function(){
  var fs, commander, request, nodeStatic, http, url, utils, libs, helpers, file, server, DyService, dyService, handlerList, toString$ = {}.toString;
  fs = require('fs');
  commander = require('commander');
  request = require('request');
  nodeStatic = require('node-static');
  http = require('http');
  url = require('url');
  utils = require('./utils');
  libs = require('./libs');
  helpers = require('./helpers');
  file = new nodeStatic.Server('./static');
  server = http.createServer();
  commander.version('0.0.1').option('-p, --port <n>', 'port', 18888).option('-H, --host [value]', 'host', '127.0.0.1').parse(process.argv);
  DyService = (function(){
    DyService.displayName = 'DyService';
    var prototype = DyService.prototype, constructor = DyService;
    function DyService(){
      this.handlerList = [];
    }
    prototype.request = function(url, req, resp, cbk){
      var token, baseParams, body;
      token = utils.parseCookie(req.headers.cookie).token;
      baseParams = utils.getQueryParams(req.url);
      url = utils.genUrl(url, token ? import$({
        auth_token: token
      }, baseParams) : baseParams);
      switch (req.method.toUpperCase()) {
      case 'POST':
        body = '';
        req.on('data', function(data){
          body += data;
        });
        req.on('end', function(){
          var body, form;
          body = decodeURIComponent(body);
          form = utils.queryStrToObj(body);
          req.pipe(request.post(url, {
            form: form
          })).pipe(resp);
        });
        break;
      case 'GET':
        req.pipe(request.get(url)).pipe(resp);
      }
    };
    prototype.registerHandler = function(router, url, method, handler){
      var self, arr, i$, len$, item, methodList;
      self = this;
      arr = router;
      if (toString$.call(arr).slice(8, -1) !== 'Array') {
        arr.push({
          router: router,
          url: url,
          method: method,
          handler: handler
        });
      }
      for (i$ = 0, len$ = arr.length; i$ < len$; ++i$) {
        item = arr[i$];
        switch (toString$.call(item.method).slice(8, -1)) {
        case 'Array':
          methodList = item.method.map(fn$);
          break;
        case 'String':
          methodList = [item.method.toUpperCase()];
          break;
        default:
          methodList = ['GET'];
        }
        this.handlerList.push([item.router, item.handler || fn1$(item), methodList]);
      }
      function fn$(e){
        return e.toUpperCase();
      }
      function fn1$(item){
        return function(req, resp){
          return self.request(item.url, req, resp);
        };
      }
    };
    prototype.route = function(req, resp){
      var self, pathname, i$, ref$, len$, item, re, m, args;
      self = this;
      pathname = url.parse(req.url).pathname;
      pathname = pathname.charAt(pathname.length - 1) === '/'
        ? pathname
        : pathname + '/';
      for (i$ = 0, len$ = (ref$ = this.handlerList).length; i$ < len$; ++i$) {
        item = ref$[i$];
        re = new RegExp(('^' + item[0]).replace(/\//g, '\\/'));
        m = pathname.match(re);
        if (!m) {
          continue;
        }
        args = [req, resp];
        [].push.apply(args, m.slice(1));
        if (item[2].indexOf(req.method) > -1) {
          item[1].apply(this, args);
        } else {
          resp.statusCode = 405;
          resp.end('Method not allowed.');
        }
        return;
      }
      resp.statusCode = 404;
      resp.end('Not found.');
    };
    return DyService;
  }());
  dyService = new DyService;
  handlerList = [
    {
      router: '/api/post/list/by_home/',
      url: 'http://ios_blog.mzread.com/api/v1/blog/blogs/posts.json?follow_recommend=0&guids=gdwoe03ijwaz,5ic3s21bef1c,pz2kjn97f6p5,bgu1174zachb,6rnziw9cxbeb,9exbc514t2qo,196mew405l8p,h5olip5o2xe5,te5sicmon9sf,hix6ukuly98p,t2xrgexfmg90,'
    }, {
      router: '/api/post/list/by_blog/',
      url: 'http://ios_blog.mzread.com/api/v1/blog/blogs/blog.json'
    }, {
      router: '/api/blog/follow/',
      url: 'http://ios_blog.mzread.com/api/v1/blog/follow_blogs/follow_blogs.json',
      method: 'POST'
    }, {
      router: '/api/blog/unfollow/',
      url: 'http://ios_blog.mzread.com/api/v1/blog/follow_blogs/unfollow_blogs.json',
      method: 'POST'
    }, {
      router: '/api/category/list/',
      url: 'http://ios_blog.mzread.com/api/v1/blog/blog_categories.json'
    }, {
      router: '/api/category/detail/',
      url: 'http://ios_blog.mzread.com/api/v1/blog/blog_categories/category.json'
    }, {
      router: '/api/login/',
      url: 'http://ios_blog.mzread.com/api/tokens.json',
      method: 'POST'
    }, {
      router: '/api/follows/',
      url: 'http://ios_blog.mzread.com/api/v1/blog/follow_blogs.json'
    }, {
      router: '/api/register/',
      url: 'http://ios_blog.mzread.com/users.json',
      method: 'POST'
    }, {
      router: '/api/blog/list/by_recommend/',
      url: 'http://ios_blog.mzread.com/api/v1/blog/blogs/recommend_blogs.json'
    }, {
      router: '/api/post/detail/',
      handler: function(req, resp){
        var url;
        url = utils.getQueryParams(req.url).url;
        if (!url) {
          return libs.returnErrorJson(resp, '缺少 url 参数');
        }
        url = decodeURIComponent(url);
        return helpers.getReadableContent(url, function(content){
          return libs.returnJson(resp, {
            title: content.title,
            content: content.content,
            url: url
          });
        });
      }
    }
  ];
  dyService.registerHandler(handlerList);
  server.on('request', function(req, resp){
    var pathname;
    pathname = url.parse(req.url).pathname;
    pathname = pathname.charAt(pathname.length - 1) === '/'
      ? pathname
      : pathname + '/';
    if (pathname === '/') {
      return fs.readFile('./index.html', function(err, data){
        if (err) {
          resp.statusCode = 502;
          return resp.end('Some error.');
        }
        return resp.end(data.toString());
      });
    }
    if (pathname.indexOf('/css/') * pathname.indexOf('/js/') === 0) {
      return file.serve(req, resp);
    }
    return dyService.route(req, resp);
  });
  server.listen(commander.port, commander.host, function(){
    return console.log('Listening %s:%d', commander.host, commander.port);
  });
  function import$(obj, src){
    var own = {}.hasOwnProperty;
    for (var key in src) if (own.call(src, key)) obj[key] = src[key];
    return obj;
  }
}).call(this);
