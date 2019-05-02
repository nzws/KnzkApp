import timeline from '../../page/timeline';
import splitter from '../../utils/splitter';

const onScroll = () => {
  const timelineElement = timeline.getScrollElement();

  if (!knzk.timeline_scrollTop) knzk.timeline_scrollTop = 0;

  if (
    timelineElement.scrollTop &&
    timelineElement.scrollTop > knzk.timeline_scrollTop
  ) {
    timeline.scrolled.enable();
  } else if (knzk.timeline_scrollTop - timelineElement.scrollTop > 5) {
    timeline.scrolled.disable();
  }

  knzk.timeline_scrollTop = timelineElement.scrollTop;
};

const moveStart = (x, y) => {
  knzk.timeline_movestartx = x;
  knzk.timeline_movestarty = y;

  knzk.timeline_moveStarted = true;
};

const windowHeight = window.innerHeight;
const windowWidth = window.innerWidth;

const onMove = (x, y) => {
  if (!knzk.timeline_moveStarted) return;

  const movedXRatio = (x - knzk.timeline_movestartx) / windowWidth;
  const movedYRatio = (y - knzk.timeline_movestarty) / windowHeight;

  if (
    Math.abs(movedXRatio) <= Math.abs(movedYRatio) ||
    Math.abs(movedXRatio) < 0.2 ||
    Math.abs(movedYRatio) > 0.4
  ) {
    return;
  }

  knzk.timeline_moveStarted = false;
  if (knzk.timeline_movestartx / windowWidth > 0.2) {
    movedXRatio > 0 ? timeline.change.prev() : timeline.change.next();
  } else {
    splitter.open();
  }
};

const moveEnd = () => (knzk.timeline_moveStarted = false);

export default () => {
  timeline.getScrollElement().onscroll = onScroll;

  const timelineElement = timeline.scrolled.getElement();

  timelineElement.onmousedown = e => moveStart(e.clientX, e.clientY);
  timelineElement.onmousemove = e => onMove(e.clientX, e.clientY);
  timelineElement.onmouseup = moveEnd;

  timelineElement.ontouchstart = e =>
    moveStart(e.changedTouches[0].pageX, e.changedTouches[0].pageY);
  timelineElement.ontouchmove = e =>
    onMove(e.changedTouches[0].pageX, e.changedTouches[0].pageY);
  timelineElement.ontouchend = moveEnd;
};
