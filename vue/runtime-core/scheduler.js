let queue = [];
let isFlushing = false;

export function queueJob(job) {
  if (!queue.includes(job)) {
    queue.push(job);
    queueFlush();
  }
}

function queueFlush() {
  if (!isFlushing) {
    isFlushing = true;
    Promise.resolve().then(() => {
      flushJobs();
      isFlushing = false;
    });
  }
}

function flushJobs() {
  // 排序保证先刷下父亲再刷下子组件
  queue.sort((a, b) => a.id - b.id);
  queue.forEach((job) => job());
  queue.length = 0;
}
