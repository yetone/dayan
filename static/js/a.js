$(function() {
  var $D = $(document),
      routers = [
        [/^\/group\/([^\/]*)/, groupHandler],
        [/^\/$/, homeHandler],
        [/^\/categories/, categoriesHandler],
        [/^\/category\/([^\/]*)/, categoryHandler]
      ],
      postListTpl = $('#post-list-tpl').html(),
      postListRender = shani.compile(postListTpl),
      groupHeaderTpl = $('#group-header-tpl').html(),
      groupHeaderRender = shani.compile(groupHeaderTpl),
      categoriesTpl = $('#categories-tpl').html(),
      categoriesRender = shani.compile(categoriesTpl),
      categoryDetailTpl = $('#category-detail-tpl').html(),
      categoryDetailRender = shani.compile(categoryDetailTpl),
      $header = $('#header'),
      $postList = $('#post-list'),
      $nextPage = $('#next-page');

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
  function homeHandler(request) {
    $header.html('');
    $nextPage.hide();
    loading();
    getHomePosts(function(posts) {
      var html = postListRender({
        posts: posts
      });
      $postList.html(html);
      $nextPage.show();
    });
  }
  function groupHandler(request, guid) {
    $nextPage.data('id', guid);
    $nextPage.hide();
    loading();
    getGroupInfo(guid, request.params.page, function(info) {
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
    $header.html('');
    $nextPage.hide();
    loading();
    getCategories(request.params.page, function(categories) {
      var html = categoriesRender({
        categories: categories
      });
      $postList.html(html);
      $nextPage.data('page', request.params.page || 1);
      $nextPage.show();
    });
  }
  function categoryHandler(request, id) {
    $header.html('');
    $nextPage.data('id', id);
    $nextPage.hide();
    loading();
    getCategoryDetail(id, request.params.page, function(groups) {
      var html = categoryDetailRender({
        groups: groups
      });
      $postList.html(html);
      $nextPage.data('page', request.params.page || 1);
      $nextPage.show();
    });
  }
  $D.on('click', '#next-page', function() {
    var $this = $(this);
    if ($this.hasClass('pending')) return;
    var tmp = $this.html();
    $this.addClass('pending');
    $this.html('加载中...');
    var hash = window.location.hash;
    var inHome = hash === '';
    var inGroup = hash.indexOf('#/group/') === 0;
    var inCates = hash.indexOf('#/categories') === 0;
    var inCate = hash.indexOf('#/category/') === 0;
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
  router(routers);
});
