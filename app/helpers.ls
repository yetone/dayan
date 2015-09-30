require! {
    request
    readability
}

module.exports =
    get-readable-content: (url, cbk) ->
        do
            err, response, body <- request url
            if not err and response.statusCode is 200
                result <- readability.parse body, url
                cbk result

    allow-origin: (req, resp) ->
        headers =
            'Access-Control-Allow-Origin': '*'
            'Access-Control-Allow-Methods': 'POST, GET, PUT, DELETE, OPTIONS'
            'Access-Control-Allow-Credentials': false
            'Access-Control-Max-Age': '86400'
            'Access-Control-Allow-Headers': 'X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept'
        resp.write-head 200 headers
        if req.method is \OPTIONS
            resp.end!
