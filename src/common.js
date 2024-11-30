
import { debounce, each, find, map } from 'lodash-es';
import { useEffect, useState } from 'react';


// ----- LOGGING -----

const { log: debug, info, warn, error } = console;
export const log = { debug, info, warn, error };



// ----- OPTIONS -----

export const getStoredOptions = async () => (await chrome.storage.sync.get()).options;
export const setStoredOptions = debounce(options => chrome.storage.sync.set({ options }), 1000);

export const useOptions = () => {

  const [options, setOptions] = useState();
  const setOption = (key, val) => setOptions(options => ({ ...options, [key]: val }));

  useEffect(() => {
    getStoredOptions().then(storedOptions => setOptions(storedOptions));
  }, []);

  useEffect(() => {
    if (!options) return;
    setStoredOptions(options);
  }, [options]);

  return { options, setOptions, setOption };
};



// ----- BOOKMARKS -----

export const getBookmarkGroups = async bookmarksPath => {

  if (!bookmarksPath) {
    const options = await getStoredOptions();
    bookmarksPath = options.bookmarksPath;
  }

  const bookmarksTree = await chrome.bookmarks.getTree();

  const pathElems = bookmarksPath.split('/');
  let pathNode = bookmarksTree[0];

  each(pathElems, pathElem => {
    const parentPathNode = pathNode;
    pathNode = find(pathNode?.children, { title: pathElem });
    if (!pathNode) {
      log.info('Unable to find bookmarks path node:', pathElem);
      log.info('Path nodes:', parentPathNode?.children);
      return false;
    }
  });

  if (!pathNode) return;

  const bookmarkGroups = map(pathNode.children, group => ({
    title: group.title,
    bookmarks: map(group.children, bookmark => ({
      title: bookmark.title,
      url: bookmark.url,
    })),
  }));

  return bookmarkGroups;
};


export const useBookmarkGroups = bookmarksPath => {

  const [bookmarkGroups, setBookmarkGroups] = useState();

  useEffect(() => {
    (async () => {
      if (bookmarksPath) setBookmarkGroups(await getBookmarkGroups(bookmarksPath));
    })();
  }, [bookmarksPath]);

  return bookmarkGroups;
};

