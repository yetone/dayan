function getUrl(url) {
  var idx = url.indexOf('?');
  if (idx === -1) return url;
  return url.substr(0, idx);
}
function getQueryParams(url) {
  var obj = {};
  var idx = url.lastIndexOf('?');
  if (idx === -1) return obj;
  var queryStr = url.substr(idx + 1);
  var pArr = queryStr.split('&');
  pArr.forEach(function(pair) {
    var arr = pair.split('=');
    if (arr.length !== 2) return;
    obj[arr[0]] = arr[1];
  });
  return obj;
}
function extend(a, b) {
  var obj = {};
  for (var key in a) {
    obj[key] = a[key];
  }
  for (var key in b) {
    obj[key] = b[key];
  }
  return obj;
}
function genUrl(base, params) {
  var baseUrl = getUrl(base);
  var baseParams = getQueryParams(base);
  var acc = [];
  params = extend(baseParams, params);
  for (var key in params) {
    if (!params.hasOwnProperty(key)) continue;
    acc.push(key + '=' + params[key]);
  }
  return baseUrl + '?' + acc.join('&');
}

module.exports = {
  getUrl: getUrl,
  getQueryParams: getQueryParams,
  genUrl: genUrl,
};
