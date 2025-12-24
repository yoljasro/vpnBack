// utils/wgMutex.js

let locked = false;
const queue = [];

export const withWgLock = async (fn) => {
  return new Promise((resolve, reject) => {
    queue.push({ fn, resolve, reject });
    processQueue();
  });
};

const processQueue = async () => {
  if (locked) return;
  if (queue.length === 0) return;

  locked = true;
  const { fn, resolve, reject } = queue.shift();

  try {
    const result = await fn();
    resolve(result);
  } catch (err) {
    reject(err);
  } finally {
    locked = false;
    processQueue();
  }
};
