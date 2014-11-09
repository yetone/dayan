$(function() {
  var $D = $(document),
      routers = [
        [/^\/group\/([^\/]*)/, groupHandler],
        [/^\/$/, homeHandler]
      ],
      postListTpl = $('#post-list-tpl').html(),
      postListRender = shani.compile(postListTpl),
      groupHeaderTpl = $('#group-header-tpl').html(),
      groupHeaderRender = shani.compile(groupHeaderTpl),
      $header = $('#header'),
      $postList = $('#post-list'),
      $nextPage = $('#next-page');

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
  function homeHandler(request) {
    $header.html('');
    $nextPage.hide();
    $postList.html('加载中...');
    getHomePosts(function(posts) {
      var html = postListRender({
        posts: posts
      });
      $postList.html(html);
      $nextPage.show();
    });
  }
  function groupHandler(request, guid) {
    $nextPage.data('guid', guid);
    $nextPage.hide();
    $postList.html('加载中...');
    getGroupInfo(guid, request.params.page, function(info) {
      $header.html(groupHeaderRender(info));
      var html = postListRender({
        posts: info.posts
      });
      $postList.html(html);
      $nextPage.data('page', request.params.page);
      $nextPage.show();
    });
  }
  $D.on('click', '#next-page', function() {
    var $this = $(this);
    if ($this.hasClass('pending')) return;
    var tmp = $this.html();
    $this.addClass('pending');
    $this.html('加载中...');
    var inGroup = window.location.hash.indexOf('#/group/') === 0;
    var cbk = function(posts) {
      posts = inGroup ? posts.posts : posts;
      var html = postListRender({
        posts: posts
      });
      $postList.append(html);
      $this.removeClass('pending');
      $this.html(tmp);
    };
    if (inGroup) {
      getGroupInfo($this.data('guid'), ($this.data('page') || 1) + 1, cbk);
    } else {
      getHomePosts(cbk);
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
