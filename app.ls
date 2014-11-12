require! {
    fs
    commander
    request
    'node-static'
    http
    url
    \./utils.js
}

file = new node-static.Server \./static
server = http.create-server!

commander.version '0.0.1'
    .option '-p, --port <n>', 'port', 18888
    .option '-H, --host [value]', 'host', '127.0.0.1'
    .parse process.argv

class DyService
    ->
        @handler-list = []

    request: (url, req, resp, cbk) !->
        token = utils.parse-cookie req.headers.cookie .token
        base-params = utils.get-query-params req.url
        url = utils.gen-url url, if token then {auth_token: token} <<< base-params else base-params
        switch req.method.to-upper-case!
            case \POST
                body = ''

                do
                    data <-! req.on \data
                    body += data

                do
                    <-! req.on \end
                    form = utils.query-str-to-obj body
                    req.pipe request.post url, form: form .pipe resp
            case \GET
                req.pipe request.get url .pipe resp

    register-handler: (router, url, method) !->
        self = @
        arr = router
        if typeof! arr is not \Array
            arr.push do
                router: router
                url: url
                method: method

        for item in arr
            switch typeof! item.method
                case \Array
                    method-list = do
                        e <- item.method.map
                        e.to-upper-case!
                case \String
                    method-list = [item.method.to-upper-case!]
                default
                    method-list = [\GET]

            @handler-list.push [
                item.router
                ((item) ->
                    (req, resp) ->
                        self.request item.url, req, resp
                ) item
                method-list
            ]

    route: (req, resp) !->
        self = @
        pathname = url.parse req.url .pathname
        pathname = if pathname.char-at(pathname.length - 1) is '/' then pathname else pathname + '/'
        for item in @handler-list
            re = new RegExp ('^' + item[0]).replace /\//g, '\\/'
            if not pathname.match re
                continue
            if item[2].index-of(req.method) > -1
                item[1] req, resp
            else
                resp.statusCode = 405;
                resp.end 'Method not allowed.'
            return
        resp.statusCode = 404
        resp.end('Not found.')

dy-service = new DyService
handler-list =
    * router: '/api/post/list/by_home/'
      url: 'http://ios_blog.mzread.com/api/v1/blog/blogs/posts.json?follow_recommend=0&guids=gdwoe03ijwaz,5ic3s21bef1c,pz2kjn97f6p5,bgu1174zachb,6rnziw9cxbeb,9exbc514t2qo,196mew405l8p,h5olip5o2xe5,te5sicmon9sf,hix6ukuly98p,t2xrgexfmg90,'
    * router: '/api/post/list/by_blog/'
      url:'http://ios_blog.mzread.com/api/v1/blog/blogs/blog.json'
    * router: '/api/blog/follow/'
      url: 'http://ios_blog.mzread.com/api/v1/blog/follow_blogs/follow_blogs.json'
      method: 'POST'
    * router: '/api/blog/unfollow/'
      url: 'http://ios_blog.mzread.com/api/v1/blog/follow_blogs/unfollow_blogs.json'
      method: 'POST'
    * router: '/api/category/list/'
      url: 'http://ios_blog.mzread.com/api/v1/blog/blog_categories.json'
    * router: '/api/category/detail/'
      url: 'http://ios_blog.mzread.com/api/v1/blog/blog_categories/category.json'
    * router: '/api/login/'
      url: 'http://ios_blog.mzread.com/api/tokens.json'
      method: 'POST'
    * router: '/api/follows/'
      url: 'http://ios_blog.mzread.com/api/v1/blog/follow_blogs.json'
    * router: '/api/register/'
      url: 'http://ios_blog.mzread.com/users.json'
      method: 'POST'
    * router: '/api/blog/list/by_recommend/'
      url: 'http://ios_blog.mzread.com/api/v1/blog/blogs/recommend_blogs.json'
dy-service.register-handler handler-list

do
    req, resp <- server.on \request
    pathname = url.parse req.url .pathname
    pathname = if pathname.char-at(pathname.length - 1) is '/' then pathname else pathname + '/'
    if pathname is \/
        return do
            err, data <- fs.read-file \./index.html
            if err
                resp.statusCode = 502
                return resp.end('Some error.')
            resp.end data.to-string!
    if (pathname.index-of \/css/) * (pathname.index-of \/js/) is 0
        return file.serve req, resp
    dy-service.route req, resp

do
    <- server.listen commander.port, commander.host
    console.log 'Listening %s:%d', commander.host, commander.port
