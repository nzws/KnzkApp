import adapter from '../adapter/index';
import kit from '../components/kanzakit';

function onLoad(data, columnName) {
  if (!knzk.posts) knzk.posts = [];
  const updateIndex = knzk.posts.findIndex((post => data.id === post.id));
  if (updateIndex !== -1) {
    data.knzkapp = {};
    data.knzkapp[`show_${columnName}`] = true;

    const insertIndex = knzk.posts.findIndex((post => (new Date(data.created_at)).getTime() >= (new Date(post.created_at)).getTime()));
    knzk.posts.splice(insertIndex, 0, data);
  } else {
    data.knzkapp = knzk.posts[updateIndex].knzkapp;
    data.knzkapp[`show_${columnName}`] = true;

    knzk.posts[updateIndex] = data;
  }

  updateTimeline();
}

function updateTimeline() {
  const timelines = knzk.account.config.timelines ? knzk.account.config.timelines : adapter[knzk.account.service].config.default_timeline;
  const timeline = timelines[knzk.timeline_column_id];

  const able_new = knzk.timeline_scrollTop < 30;
  if (able_new) {
    knzk.timeline_need_post_num = 20;
  }

  let i = 0, html = '', posts = [];
  knzk.posts.forEach(post => {
    if (i > knzk.timeline_need_post_num) {
      return;
    }

    if (post.knzkapp[`show_${timeline}`] && (able_new || knzk.timeline_last_timestamp >= (new Date(post.created_at)).getTime())) {
      // todo: 表示するやつをここにおく

      posts.push(post);
      i++;
    }
  });

  if (i <= knzk.timeline_need_post_num) {
    // 足りない
    adapter[knzk.account.service].timeline.load(timeline, onLoad, {
      max_id: posts[posts.length - 1].id
    });
  }

  knzk.timeline_last_timestamp = (new Date(posts[0].created_at)).getTime();
  kit.elemId('timeline').innerHTML = html;
}

export default {
  load(columnId = knzk.timeline_column_id ? knzk.timeline_column_id : 0, isForce = false) {
    knzk.timeline_column_id = columnId;
    let timelines = knzk.account.config.timelines ? knzk.account.config.timelines : adapter[knzk.account.service].config.default_timeline;

    if (knzk.timeline_already_started || knzk.conf.timeline_no_multi_connect) {
      timelines = [timelines[columnId]];
    }

    if (knzk.conf.timeline_no_multi_connect || isForce) {
      this.close();
    }

    if (!knzk.timeline_already_started || knzk.conf.timeline_no_multi_connect || isForce) {
      timelines.forEach(timeline => adapter[knzk.account.service].timeline.load(timeline, onLoad));
    }

    updateTimeline();
    knzk.timeline_already_started = true;
  },
  close() {
    if (!knzk.timelineWs) return;
    knzk.timelineWs.forEach(ws => ws.readyState <= 1 ? ws.close() : null);
  },
  getScrollElement: () => kit.elem('.page__timeline .page__content')[0],
  scroll(amount, type = 'set') {
    amount = parseInt(amount);

    switch (type) {
      case 'set':
        return (this.getScrollElement().scrollTop = amount);
      case 'add':
        return (this.getScrollElement().scrollTop += amount);
      default:
        return false;
    }
  },
  change: {
    prev() {
      const timeline = kit.elemId('timeline');

      timeline.classList.add('prev');
      setTimeout(() => {
        timeline.innerHTML = '';
        timeline.classList.remove('prev');
      }, 160);
    },
    next() {
      const timeline = kit.elemId('timeline');

      timeline.classList.add('next');
      setTimeout(() => {
        timeline.innerHTML = '';
        timeline.classList.remove('next');
      }, 160);
    }
  },
  scrolled: {
    getElement: () => kit.elem('.page__timeline')[0],
    enable() {
      this.getElement().classList.add('scrolled');
    },
    disable() {
      this.getElement().classList.remove('scrolled');
    }
  },
  postBox: {
    open() {
      kit.elem('.bottom')[0].classList.remove('collapsed');
      kit.elemId('post').rows = 3;
    },
    close(isForce = false) {
      const postBox = kit.elemId('post');
      if (postBox.value && !isForce) return;

      kit.elem('.bottom')[0].classList.add('collapsed');
      postBox.rows = 1;
    }
  }
};
