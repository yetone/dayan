$(function() {
  var $D = $(document),
      router = new LightHouse({
      }),
      routers = [
        [/^\/group\/([^\/]*)/, groupHandler],
        [/^\/$/, homeHandler],
        [/^\/categories/, categoriesHandler],
        [/^\/category\/([^\/]*)/, categoryHandler],
        [/^\/login/, loginHandler],
        [/^\/logout/, logoutHandler],
        [/^\/follows/, followsHandler],
      ],
      postListTpl = $('#post-list-tpl').html(),
      postListRender = shani.compile(postListTpl),
      groupHeaderTpl = $('#group-header-tpl').html(),
      groupHeaderRender = shani.compile(groupHeaderTpl),
      categoriesTpl = $('#categories-tpl').html(),
      categoriesRender = shani.compile(categoriesTpl),
      categoryDetailTpl = $('#category-detail-tpl').html(),
      categoryDetailRender = shani.compile(categoryDetailTpl),
      loginTpl = $('#login-tpl').html(),
      loginRender = shani.compile(loginTpl),
      $header = $('#header'),
      $postList = $('#post-list'),
      $nextPage = $('#next-page');

  router.setBefore(function() {
    $header.html('');
    $nextPage.hide();
    loading();
    var token = getCookie('token');
    if (!token || token === 'undefined') {
      window.location.hash = '#/login/';
    }
  });

  function getType(obj) {
    Object.prototype.toString.call(obj).slice(8, -1);
  }
  function getCookie(key) {
    var cookie = parseCookie(window.document.cookie);
    return cookie[key];
  }
  function _setCookie(name, value, days) {
    days = days || 30;
    var exdate = new Date();
    exdate.setDate(exdate.getDate() + days);
    window.document.cookie = name + "=" + escape(value) + "; expires=" + exdate.toGMTString();
  }
  function setCookie() {
    var args = [].slice.call(arguments);
    if (args.length < 1) return;
    var obj = args[0];
    if (getType(obj) !== 'Object') {
      obj = {};
      for (var i = 0, l = args.length; i < l; i++) {
        obj[args[i]] = args[++i];
      }
    }
    var cookie = parseCookie(window.document.cookie);
    for (var key in obj) {
      if (!obj.hasOwnProperty(key)) continue;
      cookie[key] = obj[key];
    }
    for (var key in cookie) {
      if (!cookie.hasOwnProperty(key)) continue;
      _setCookie(key, cookie[key]);
    }
  }
  function parseCookie(str) {
    var s, k, v, slst, kvlst,
        res = {};
    if (typeof str !== 'string') return res;
    slst = str.split(';');
    for (var i = 0, l = slst.length; i < l; i++) {
      s = slst[i];
      kvlst = s.split('=');
      k = kvlst[0].trim();
      v = kvlst[1];
      res[k] = v;
    }
    return res;
  }
  function loading() {
    $postList.html('<div class="loading">加载中...</div>');
  }
  function getHomePosts(cbk) {
    var url = '/api/home/posts/';
    var beforeTime = $('.post-item').last().data('time');
    data = {
      count: 20,
      before_time: beforeTime
    };
    var promise = $.ajax({
      type: 'GET',
      url: url,
      data: data
    });
    promise.done(function(jsn) {
      cbk && cbk(jsn.data.posts);
    });
  }
  function getGroupInfo(guid, page, cbk) {
    var url = '/api/group/posts/';
    var data = {
      count: 20,
      guid: guid,
      page: page
    };
    var promise = $.ajax({
      type: 'GET',
      url: url,
      data: data
    });
    promise.done(function(jsn) {
      cbk && cbk(jsn.data.blog_info);
    });
  }
  function getCategories(page, cbk) {
    var url = '/api/categories/';
    var data = {
      count: 20,
      page: page
    };
    var promise = $.ajax({
      type: 'GET',
      url: url,
      data: data
    });
    promise.done(function(jsn) {
      cbk && cbk(jsn.data.categories);
    });
  }
  function getCategoryDetail(id, page, cbk) {
    var url = '/api/category/detail/';
    var data = {
      count: 20,
      id: id,
      page: page
    };
    var promise = $.ajax({
      type: 'GET',
      url: url,
      data: data
    });
    promise.done(function(jsn) {
      cbk && cbk(jsn.data.blogs);
    });
  }
  function getFollows(page, cbk) {
    var url = '/api/follows/';
    var data = {
      count: 20,
      page: page,
      follow_type: 'Blog'
    };
    var promise = $.ajax({
      type: 'GET',
      url: url,
      data: data
    });
    promise.done(function(jsn) {
      cbk && cbk(jsn.data.follows);
    });
  }
  function homeHandler(request) {
    getHomePosts(function(posts) {
      if (router.getHash() !== request.hash) return;
      var html = postListRender({
        posts: posts
      });
      $postList.html(html);
      $nextPage.show();
    });
  }
  function groupHandler(request, guid) {
    $nextPage.data('id', guid);
    getGroupInfo(guid, request.params.page, function(info) {
      if (router.getHash() !== request.hash) return;
      $header.html(groupHeaderRender(info));
      var html = postListRender({
        posts: info.posts
      });
      $postList.html(html);
      $nextPage.data('page', request.params.page || 1);
      $nextPage.show();
    });
  }
  function categoriesHandler(request) {
    getCategories(request.params.page, function(categories) {
      if (router.getHash() !== request.hash) return;
      var html = categoriesRender({
        categories: categories
      });
      $postList.html(html);
      $nextPage.data('page', request.params.page || 1);
      $nextPage.show();
    });
  }
  function categoryHandler(request, id) {
    $nextPage.data('id', id);
    getCategoryDetail(id, request.params.page, function(groups) {
      if (router.getHash() !== request.hash) return;
      var html = categoryDetailRender({
        groups: groups
      });
      $postList.html(html);
      $nextPage.data('page', request.params.page || 1);
      $nextPage.show();
    });
  }
  function followsHandler(request) {
    getFollows(request.params.page, function(groups) {
      if (router.getHash() !== request.hash) return;
      var html = categoryDetailRender({
        groups: groups
      });
      $postList.html(html);
      $nextPage.data('page', request.params.page || 1);
      $nextPage.show();
    });
  }
  function loginHandler(request) {
    $postList.html(loginTpl);
  }
  function logoutHandler(request) {
    setCookie('token', undefined);
    setCookie('user', undefined);
    window.location.hash = '';
  }
  $D.on('click', '.login', function() {
    var $this = $(this);
    var $form = $this.parents('form');
    var data = {};
    $form.serializeArray().map(function(item) {
      data[item.name] = item.value;
    });
    $.ajax({
      url: '/api/login/',
      type: 'POST',
      data: data,
      success: function(jsn) {
        if (!jsn.token) return;
        setCookie('token', jsn.token);
        setCookie('user', JSON.stringify(jsn.user));
        window.location.hash = '';
      }
    });
  });
  $D.on('click', '#next-page', function() {
    var $this = $(this);
    if ($this.hasClass('pending')) return;
    var tmp = $this.html();
    $this.addClass('pending');
    $this.html('加载中...');
    var hash = window.location.hash;
    var inHome = hash === '' || hash === '#/';
    var inGroup = hash.indexOf('#/group/') === 0;
    var inCates = hash.indexOf('#/categories') === 0;
    var inCate = hash.indexOf('#/category/') === 0;
    var inFollows = hash.indexOf('#/follows') === 0;
    var page = ($this.data('page') || 1) + 1;
    var cbk = function() {
      $this.removeClass('pending');
      $this.html(tmp);
      if ($this.data('page')) {
        $this.data('page', $this.data('page') + 1);
      }
    }
    var postCbk = function(posts) {
      posts = inGroup ? posts.posts : posts;
      var html = postListRender({
        posts: posts
      });
      $postList.append(html);
      cbk();
    };
    if (inGroup) {
      getGroupInfo($this.data('id'), page, postCbk);
    } else if (inHome) {
      getHomePosts(postCbk);
    } else if (inCates) {
      getCategories(page, function(categories) {
        var html = categoriesRender({
          categories: categories
        });
        $postList.append(html);
        cbk();
      });
    } else if (inCate) {
      getCategoryDetail($this.data('id'), page, function(groups) {
        var html = categoryDetailRender({
          groups: groups
        });
        $postList.append(html);
        cbk();
      });
    } else if (inFollows) {
      getFollows(page, function(groups) {
        var html = categoryDetailRender({
          groups: groups
        });
        $postList.append(html);
        cbk();
      });
    }
  });
  $D.on('click', '.blog-name', function(e) {
    e.preventDefault();
    window.location.hash = '#/group/' + $(this).data('id') + '/';
  });
  $D.on('click', '.group-follow', function(e) {
    e.preventDefault();
    var $this = $(this);
    if ($this.hasClass('pending')) return;
    $this.addClass('pending');
    var isFo = $this.hasClass('followed');
    var promise = $.ajax({
      type: 'POST',
      url: isFo ? '/api/group/unfollow' : '/api/group/follow',
      data: {
        guids: $this.data('id')
      }
    });
    promise.done(function(jsn) {
      if (!jsn.success) return;
      $this.removeClass('pending');
      if (isFo) {
        $this.removeClass('followed').html('订阅');
      } else {
        $this.addClass('followed').html('取消订阅');
      }
    });
  });
  router.route(routers);
});
