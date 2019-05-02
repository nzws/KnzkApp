import kit from '../components/kanzakit';

export default {
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
