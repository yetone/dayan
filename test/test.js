var utils = require('../utils.js');
var assert = require('assert');

describe('utils', function() {
  var url = 'sdafsdf?a=b&c=d&eee=fff';
  assert.equal(utils.getQueryParams(url).a, 'b');
  assert.equal(utils.getQueryParams(url).c, 'd');
  assert.equal(utils.getQueryParams(url).eee, 'fff');

  var base = 'www.fuck.you';
  var base0 = 'www.xixi.com?name=ll';
  var params = {a: 'b', c: 'd', 2: 3};
  var params0 = {name: 'b', c: 'd', 2: 3};
  assert.equal('www.fuck.you?2=3&a=b&c=d', utils.genUrl(base, params));
  assert.equal('www.xixi.com?2=3&name=ll&a=b&c=d', utils.genUrl(base0, params));
  assert.equal('www.xixi.com?2=3&name=b&c=d', utils.genUrl(base0, params0));
});
