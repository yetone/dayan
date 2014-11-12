require! {
    request
    readability
}

get-readable = (url, cbk) ->
    do
        err, response, body <- request url
        if not err and response.statusCode is 200
            result <- readability.parse body, url
            cbk result

module.exports =
    * get-readable: get-readable
