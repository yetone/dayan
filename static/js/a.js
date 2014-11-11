$(function() {
  var $D = $(document),
      router = new LightHouse({
      }),
      routers = [
        [/^\/blog\/([^\/]*)/, blogHandler],
        [/^\/$/, homeHandler],
        [/^\/category\/list/, categoryListHandler],
        [/^\/category\/([^\/]*)/, categoryHandler],
        [/^\/register/, registerHandler],
        [/^\/login/, loginHandler],
        [/^\/logout/, logoutHandler],
        [/^\/follows/, followsHandler],
        [/^\/recommend\/blogs/, recommendHandler],
      ],
      postListTpl = $('#post-list-tpl').html(),
      postListRender = shani.compile(postListTpl),
      blogHeaderTpl = $('#blog-header-tpl').html(),
      blogHeaderRender = shani.compile(blogHeaderTpl),
      categoryListTpl = $('#category-list-tpl').html(),
      categoryListRender = shani.compile(categoryListTpl),
      blogListTpl = $('#blog-list-tpl').html(),
      blogListRender = shani.compile(blogListTpl),
      loginTpl = $('#login-tpl').html(),
      loginRender = shani.compile(loginTpl),
      registerTpl = $('#register-tpl').html(),
      registerRender= shani.compile(registerTpl),
      meHeaderTpl = $('#me-header-tpl').html(),
      meHeaderRender = shani.compile(meHeaderTpl),
      accountHeaderTpl = $('#account-header-tpl').html(),
      accountHeaderRender = shani.compile(accountHeaderTpl),
      exploreHeaderTpl = $('#explore-header-tpl').html(),
      exploreHeaderRender = shani.compile(exploreHeaderTpl),
      $header = $('#header'),
      $itemListWrap = $('#item-list-wrap'),
      $nextPage = $('#next-page'),
      $nav = $('#nav');

  router.setBefore(function() {
    $header.html('');
    $nextPage.hide();
    loading();
    var token = getCookie('token');
    if (!token || token === 'undefined' && window.location.hash.indexOf('#/register') > -1) {
      window.location.hash = '#/login/';
    }
  });

  function triggerNav(cls) {
    if (cls.charAt(0) !== '.') {
      cls = '.' + cls;
    }
    var $cur = $nav.find(cls);
    $cur.addClass('cur');
    $cur.siblings().removeClass('cur');
  }

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
    $itemListWrap.html('<div class="loading">加载中...</div>');
  }
  function getPostListByHome(cbk) {
    var url = '/api/post/list/by_home/';
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
  function getPostListByBlog(guid, page, cbk) {
    var url = '/api/post/list/by_blog/';
    var data = {
      count: 20,
      guid: guid,
      page: page || 1
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
  function getCategoryList(page, cbk) {
    var url = '/api/category/list/';
    var data = {
      count: 20,
      page: page || 1
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
  function getBlogListByCategory(id, page, cbk) {
    var url = '/api/category/detail/';
    var data = {
      count: 20,
      id: id,
      page: page || 1
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
  function getBlogListByRecommend(page, cbk) {
    var url = '/api/blog/list/by_recommend/';
    var data = {
      count: 20,
      page: page || 1
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
  function getFollows(page, type, cbk) {
    var url = '/api/follows/';
    var data = {
      count: 20,
      page: page || 1,
      follow_type: type || 'Blog'
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
    triggerNav('home');
    getPostListByHome(function(posts) {
      if (router.getHash() !== request.hash) return;
      var html = postListRender({
        posts: posts
      });
      $itemListWrap.html(html);
      $nextPage.show();
    });
  }
  function blogHandler(request, guid) {
    triggerNav('explore');
    $nextPage.data('id', guid);
    console.log('guid: ' + guid);
    getPostListByBlog(guid, request.params.page, function(info) {
      if (router.getHash() !== request.hash) return;
      $header.html(blogHeaderRender(info));
      var html = postListRender({
        posts: info.posts
      });
      $itemListWrap.html(html);
      $nextPage.data('page', request.params.page || 1);
      $nextPage.show();
    });
  }
  function categoryListHandler(request) {
    triggerNav('explore');
    $('.explore-header').length || $header.html(exploreHeaderTpl);
    var $li = $('.explore-cate');
    $li.addClass('cur');
    $li.siblings().removeClass('cur');
    getCategoryList(request.params.page, function(categories) {
      if (router.getHash() !== request.hash) return;
      var html = categoryListRender({
        categories: categories
      });
      $itemListWrap.html(html);
      $nextPage.data('page', request.params.page || 1);
      $nextPage.show();
    });
  }
  function categoryHandler(request, id) {
    triggerNav('explore');
    $nextPage.data('id', id);
    getBlogListByCategory(id, request.params.page, function(blogs) {
      if (router.getHash() !== request.hash) return;
      var html = blogListRender({
        blogs: blogs
      });
      $itemListWrap.html(html);
      $nextPage.data('page', request.params.page || 1);
      $nextPage.show();
    });
  }
  function recommendHandler(request) {
    triggerNav('explore');
    $('.explore-header').length || $header.html(exploreHeaderTpl);
    var $li = $('.explore-star');
    $li.addClass('cur');
    $li.siblings().removeClass('cur');
    getBlogListByRecommend(request.params.page, function(blogs) {
      if (router.getHash() !== request.hash) return;
      var html = blogListRender({
        blogs: blogs
      });
      $itemListWrap.html(html);
      $nextPage.data('page', request.params.page || 1);
      $nextPage.show();
    });
  }
  function followsHandler(request) {
    triggerNav('me');
    var user = JSON.parse(unescape(getCookie('user')));
    var html = meHeaderRender(user);
    $('.me-header').length || $header.html(html);
    var type = request.params.follow_type || 'Blog';
    var $col = $('.me-collect'),
        $src = $('.me-source');
    if (type === 'Blog') {
      $col.removeClass('cur');
      $src.addClass('cur');
    } else {
      $col.addClass('cur');
      $src.removeClass('cur');
    }
    getFollows(request.params.page, type, function(blogs) {
      if (router.getHash() !== request.hash) return;
      var html;
      if (type === 'Blog') {
        html = blogListRender({
          blogs: blogs
        });
      } else {
        html = postListRender({
          posts: blogs
        });
      }
      $itemListWrap.html(html);
      $nextPage.data('page', request.params.page || 1);
      $nextPage.show();
    });
  }
  function registerHandler(request) {
    triggerNav('me');
    $('.account-header').length || $header.html(accountHeaderTpl);
    var $li = $('.account-register');
    $li.addClass('cur');
    $li.siblings().removeClass('cur');
    $itemListWrap.html(registerTpl);
  }
  function loginHandler(request) {
    triggerNav('me');
    $('.account-header').length || $header.html(accountHeaderTpl);
    var $li = $('.account-login');
    $li.addClass('cur');
    $li.siblings().removeClass('cur');
    $itemListWrap.html(loginTpl);
  }
  function logoutHandler(request) {
    triggerNav('me');
    setCookie('token', undefined);
    setCookie('user', undefined);
    window.location.hash = '';
  }
  $D.on('submit', '.register-form', function(e) {
    e.preventDefault();
    var $this = $(this);
    var $btn = $this.find('.btn');
    var tmp = $btn.html();
    var data = {};
    $btn.html('注册中...');
    $this.serializeArray().map(function(item) {
      data[item.name] = item.value;
    });
    $.ajax({
      url: '/api/register/',
      type: 'POST',
      data: data,
      success: function(jsn) {
        if (jsn.errors) {
          for (var key in jsn.errors) {
            if (!jsn.errors.hasOwnProperty(key)) continue;
            $this.find('input[type=' + key + ']').val('').attr('placeholder', jsn.errors[key][0]);
          }
          return;
        }
        $btn.html(tmp);
        setCookie('token', jsn.auth_token);
        setCookie('user', JSON.stringify(jsn));
        window.location.hash = '#/recommend/blogs/';
      }
    });
  });
  $D.on('submit', '.login-form', function(e) {
    e.preventDefault();
    var $this = $(this);
    var $btn = $this.find('.btn');
    var tmp = $btn.html();
    var data = {};
    $btn.html('登录中...');
    $this.serializeArray().map(function(item) {
      data[item.name] = item.value;
    });
    $.ajax({
      url: '/api/login/',
      type: 'POST',
      data: data,
      success: function(jsn) {
        if (jsn.errors) {
          for (var key in jsn.errors) {
            if (!jsn.errors.hasOwnProperty(key)) continue;
            $this.find('input').eq(key | 0).val('').attr('placeholder', jsn.errors[key]);
          }
          return;
        }
        $btn.html(tmp);
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
    var inblog = hash.indexOf('#/blog/') === 0;
    var inCates = hash.indexOf('#/category/list/') === 0;
    var inCate = hash.indexOf('#/category/') === 0 && !inCates;
    var inFollows = hash.indexOf('#/follows/') === 0;
    var inStar = hash.indexOf('#/recommend/blogs/') === 0;
    var page = ($this.data('page') || 1) + 1;
    var cbk = function() {
      $this.removeClass('pending');
      $this.html(tmp);
      if ($this.data('page')) {
        $this.data('page', $this.data('page') + 1);
      }
    }
    var postCbk = function(posts) {
      posts = inblog ? posts.posts : posts;
      var html = postListRender({
        posts: posts
      });
      $itemListWrap.append(html);
      cbk();
    };
    if (inblog) {
      getPostListByBlog($this.data('id'), page, postCbk);
    } else if (inHome) {
      getPostListByHome(postCbk);
    } else if (inCates) {
      getCategoryList(page, function(categories) {
        var html = categoryListRender({
          categories: categories
        });
        $itemListWrap.append(html);
        cbk();
      });
    } else if (inCate) {
      getBlogListByCategory($this.data('id'), page, function(blogs) {
        var html = blogListRender({
          blogs: blogs
        });
        $itemListWrap.append(html);
        cbk();
      });
    } else if (inStar) {
      getBlogListByRecommend(page, function(blogs) {
        var html = blogListRender({
          blogs: blogs
        });
        $itemListWrap.append(html);
        cbk();
      });
    } else if (inFollows) {
      var type = 'Blog';
      if (hash.indexOf('follow_type=Post') >= 0) {
        type = 'Post';
      }
      getFollows(page, type, function(blogs) {
        var html;
        if (type === 'Blog') {
          html = blogListRender({
            blogs: blogs
          });
        } else {
          html = postListRender({
            posts: blogs
          });
        }
        $itemListWrap.append(html);
        cbk();
      });
    }
  });
  $D.on('click', '.post-blog-name', function(e) {
    if ($(this).data('id') === 'undefined') return;
    e.preventDefault();
    window.location.hash = '#/blog/' + $(this).data('id') + '/';
  });
  $D.on('click', '.blog-follow', function(e) {
    e.preventDefault();
    var $this = $(this);
    if ($this.hasClass('pending')) return;
    $this.addClass('pending');
    var isFo = $this.hasClass('followed');
    var promise = $.ajax({
      type: 'POST',
      url: isFo ? '/api/blog/unfollow' : '/api/blog/follow',
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
