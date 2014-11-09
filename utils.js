function getUrl(url) {
  var idx = url.indexOf('?');
  if (idx === -1) return url;
  return url.substr(0, idx);
}
function queryStrToObj(str) {
  var obj = {};
  var pArr = str.split('&');
  pArr.forEach(function(pair) {
    var arr = pair.split('=');
    if (arr.length !== 2) return;
    obj[arr[0]] = arr[1];
  });
  return obj;
}
function objToQueryStr(obj) {
  var acc = [];
  for (var key in obj) {
    if (!obj.hasOwnProperty(key)) continue;
    acc.push(key + '=' + obj[key]);
  }
  return acc.join('&');
}
function getQueryParams(url) {
  var idx = url.lastIndexOf('?');
  if (idx === -1) return {};
  var queryStr = url.substr(idx + 1);
  return queryStrToObj(queryStr);
}
function extend(a, b) {
  for (var key in b) {
    a[key] = b[key];
  }
  return a;
}
function genUrl(base, params) {
  var baseUrl = getUrl(base);
  var baseParams = getQueryParams(base);
  params = extend(baseParams, params);
  return baseUrl + '?' + objToQueryStr(params);
}

module.exports = {
  getUrl: getUrl,
  getQueryParams: getQueryParams,
  genUrl: genUrl,
  extend: extend,
  queryStrToObj: queryStrToObj,
  objToQueryStr: objToQueryStr,
};
