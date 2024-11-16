
import * as b64ArrayBuffer from 'base64-arraybuffer';
import { each, find, map, orderBy } from 'lodash-es';
import log from 'loglevel';
import { useEffect, useMemo, useRef, useState } from 'react';
import urlJoin from 'url-join';


log.setDefaultLevel('debug');
export { log };



// ----- OPTIONS -----

const getStoredOptions = async () => {
  const { options } = await chrome.storage.sync.get('options');
  return options;
};


const setStoredOptions = async options => chrome.storage.sync.set({ options });


export const useOptions = () => {

  const [options, setOptions] = useState();

  const setOption = (key, val) => setOptions(options => ({ ...options, [key]: val }));

  useEffect(() => {
    (async () => {
      const syncedOptions = await getStoredOptions();
      setOptions(options => ({ ...syncedOptions, ...options }));
    })();
  }, []);

  useEffect(() => {
    if (!options) return;
    setStoredOptions(options);
  }, [options]);

  return useMemo(() => ({ options, setOptions, setOption }), [options]);
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



// ----- BOOKMARK ICONS -----

const getStoredBookmarkIcons = async () => {
  const data = await chrome.storage.local.get('bookmarkIcons');
  return data.bookmarkIcons;
};


const setStoredBookmarkIcons = async bookmarkIcons => {
  await chrome.storage.local.set({ bookmarkIcons });
};


export const setStoredBookmarkIcon = async (pageUrl, iconUrl) => {
  const { origin } = parseUrl(pageUrl);
  setStoredBookmarkIcons({
    ...(await getStoredBookmarkIcons()),
    [origin]: iconUrl,
  });
};


export const useBookmarkIcons = () => {

  const [bookmarkIcons, setBookmarkIcons] = useState();

  const getBookmarkIcon = pageUrl => {
    const { origin } = parseUrl(pageUrl);
    return bookmarkIcons?.[origin];
  };

  const setBookmarkIcon = (pageUrl, iconUrl) => {
    const { origin } = parseUrl(pageUrl);
    setBookmarkIcons(bookmarkIcons => ({
      ...bookmarkIcons,
      [origin]: iconUrl,
    }));
  };

  useEffect(() => {
    (async () => {
      const storedBookmarkIcons = await getStoredBookmarkIcons();
      setBookmarkIcons(storedBookmarkIcons);
    })();
  }, []);

  useEffect(() => {
    setStoredBookmarkIcons(bookmarkIcons);
  }, [bookmarkIcons]);

  return useMemo(() => ({
    bookmarkIcons,
    getBookmarkIcon,
    setBookmarkIcon,
  }), [bookmarkIcons]);
};


export const fetchBookmarkIconDataUrl = async pageUrl => {

  const { origin, hostname } = parseUrl(pageUrl);

  if (!origin || !hostname) return;

  const getRootDomain = domain => domain.split('.').slice(-2).join('.');

  const iconUrl = (
    await fetchImageAsDataUrl(await fetchFaviconUrl(origin)) ||
    await fetchImageAsDataUrl(urlJoin(origin, '/favicon.ico')) ||
    await fetchImageAsDataUrl(urlJoin(origin.replace(hostname, 'www.' + getRootDomain(hostname)), '/favicon.ico')) ||
    await fetchImageAsDataUrl(urlJoin(origin.replace(hostname, getRootDomain(hostname)), '/favicon.ico'))
  );

  return iconUrl;
};



// ----- FAVICON + IMAGE UTILS ----

const fetchFaviconUrl = async pageUrl => {

  if (!pageUrl) return;

  try {
    const response = await fetch(pageUrl);
    const redirectUrl = response.redirected && response.url;
    // if (redirectUrl) log.debug(`=== this is a redirect:\n${pageUrl}\n${redirectUrl}`);
    if (response.status >= 400) return;
    const body = await response.text();
    const faviconLinkElemMatches = body.match(/<link [^>]*?rel="icon"[^>]*?\/?>/ig);
    if (faviconLinkElemMatches) {
      const faviconLinks = orderBy(
        map(faviconLinkElemMatches, fle => ({
          url: fle.match(/href="(.+?)"/i)?.[1],
          sizes: fle.match(/sizes="(.+?)"/i)?.[1],
        })),
        ({ sizes }) => {
          const sizeMatch = sizes?.match(/^(\d+)x(\d+)/);
          if (sizeMatch) return Math.abs(63 - Number(sizeMatch[1]));
          return 99999;
        },
        'asc',
      );
      const iconPageUrl = redirectUrl || pageUrl;
      let url = faviconLinks[0].url;
      if (url.startsWith('/')) {
        const { origin } = parseUrl(iconPageUrl);
        url = urlJoin(origin, url);
      }
      else if (!url.match(/^[\w.+_-]+:/i)) {
        const { origin, pathname } = parseUrl(iconPageUrl);
        url = urlJoin(origin, pathname.replace(/\/[^/]*$/, ''), url);
      }
      return url;
    }
  }
  catch (err) {
    log.error('Error fetching favicon for url:', pageUrl);
    console.error(err); // eslint-disable-line no-console
  }
};


export const fetchImageAsDataUrl = async imageUrl => {
  if (!imageUrl) return;
  try {
    const response = await fetch(imageUrl);
    if (response.status >= 400) return;
    const contentType = response.headers.get('content-type');
    if (!contentType?.startsWith('image')) return;
    const arrayBuffer = await response.arrayBuffer();
    const base64Data = b64ArrayBuffer.encode(arrayBuffer);
    if (!base64Data) return;
    const dataUrl = `data:${contentType};base64,${base64Data}`;
    return dataUrl;
  }
  catch (err) {
    log.error('Error fetching image as data URL:', imageUrl);
    console.error(err); // eslint-disable-line no-console
  }
};


// ----- MISC -----

export const useIsMounted = () => {
  const isMounted = useRef(false);
  useEffect(() => {
    isMounted.current = true;
    return () => isMounted.current = false;
  }, []);
  return isMounted;
};


export const parseUrl = url => {
  try {
    return new URL(url);
  }
  catch {
    // eslint-disable-next-line no-console
    console.log('Unable to parse URL:', url);
    return {};
  }
};

