_return-json = (resp, obj) !->
    resp.write-head 200, do
        'Content-Type': 'application/json;charset=UTF-8'
    json = JSON.stringify obj
    resp.end json

return-json = (resp, data) !->
    _return-json resp, do
        status: \success
        data: data

return-error-json = (resp, message='some error') !->
    _return-json resp, do
        status: \error
        message: message

module.exports = do
    return-json: return-json
    return-error-json: return-error-json
