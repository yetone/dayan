$(function() {
  var $D = $(document),
      url = '/api/posts',
      postListTpl = $('#post-list-tpl').html(),
      postListRender = shani.compile(postListTpl),
      $postList = $('#post-list');
  function _render(data, cbk) {
    data = $.extend({
      count: 20
    }, data);
    var promise = $.ajax({
      type: 'GET',
      url: url,
      data: data
    });
    promise.done(function(jsn) {
      var html = postListRender({
        posts: jsn.data.posts
      });
      $postList.append(html);
      cbk && cbk();
    });
  }
  function render(cbk) {
    var $posts = $('.post-item');
    if (!$posts.length) {
      return _render({}, cbk);
    }
    var beforeTime = $posts.last().data('time');
    _render({
      before_time: beforeTime
    }, cbk);
  }
  $D.on('click', '#next-page', function() {
    var $this = $(this);
    if ($this.hasClass('pending')) return;
    var tmp = $this.html();
    $this.addClass('pending');
    $this.html('加载中...');
    render(function() {
      $this.removeClass('pending');
      $this.html(tmp);
    });
  });
  $('#next-page').trigger('click');
});
