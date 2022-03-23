
import { useEffect, useMemo, useRef, useState } from 'react';
import { each, find, map, orderBy } from 'lodash-es';
import log from 'loglevel';
import urlJoin from 'url-join';


log.setDefaultLevel('debug');
export { log };



// ----- OPTIONS -----

const getSyncedOptions = async () => {
  const { options } = await chrome.storage.sync.get('options');
  return options;
};


const setSyncedOptions = async options => chrome.storage.sync.set({ options });


export const useOptions = () => {

  const [options, setOptions] = useState();

  const setOption = (key, val) => setOptions(options => ({ ...options, [key]: val }));

  useEffect(async () => {
    const syncedOptions = await getSyncedOptions();
    setOptions(options => ({ ...syncedOptions, ...options }));
  }, []);

  useEffect(() => {
    if (!options) return;
    setSyncedOptions(options);
  }, [options]);

  return useMemo(() => ({ options, setOptions, setOption }), [options]);
};



// ----- BOOKMARKS -----

const getBookmarkGroups = async bookmarksPath => {

  const bookmarksTree = await chrome.bookmarks.getTree();

  const pathElems = bookmarksPath.split('/');
  let pathNode = bookmarksTree[0];
  each(pathElems, pathElem => {
    pathNode = find(pathNode?.children, { title: pathElem });
    if (!pathNode) {
      log.warn('Unable to find boomarks path node:', pathElem);
      return false;
    }
  });

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

  useEffect(async () => {
    if (bookmarksPath) setBookmarkGroups(await getBookmarkGroups(bookmarksPath));
  }, [bookmarksPath]);

  return bookmarkGroups;
};


let _bookmarkIcons;


const getBookmarkIcons = () => {
  if (!_bookmarkIcons) _bookmarkIcons = JSON.parse(window.localStorage.getItem('bookmarkIcons') || '{}');
  return _bookmarkIcons;
};


export const getBookmarkIcon = pageUrl => {
  const { origin } = new URL(pageUrl);
  return getBookmarkIcons()[origin];
};


const setBookmarkIcons = bookmarkIcons => {
  _bookmarkIcons = bookmarkIcons;
  window.localStorage.setItem('bookmarkIcons', JSON.stringify(bookmarkIcons));
};


export const setBookmarkIcon = (pageUrl, iconUrl) => {
  const { origin } = new URL(pageUrl);
  setBookmarkIcons({
    ..._bookmarkIcons,
    [origin]: iconUrl,
  });
};


const fetchImageAsDataUrl = async imageUrl => {
  if (!imageUrl) return;
  try {
    const response = await fetch(imageUrl);
    if (response.status >= 400) return;
    const contentType = response.headers.get('content-type');
    if (!contentType?.startsWith('image')) return;
    const arrayBuffer = await response.arrayBuffer();
    const dataUrl = `data:${contentType};base64,${arrayBufferToBase64(arrayBuffer)}`;
    return dataUrl;
  }
  catch (err) {
    log.error('Error fetching image as data URL:', imageUrl);
    console.error(err); // eslint-disable-line no-console
  }
};


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
        const { origin } = new URL(iconPageUrl);
        url = urlJoin(origin, url);
      }
      else if (!url.match(/^[\w.+_-]+:/i)) {
        const { origin, pathname } = new URL(iconPageUrl);
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


export const getBookmarkIconDataUrl = async pageUrl => {

  const { origin, hostname } = new URL(pageUrl);

  const bookmarkIcons = getBookmarkIcons();
  const cachedIconUrl = bookmarkIcons[origin];

  if (cachedIconUrl) return cachedIconUrl;

  const getRootDomain = domain => domain.split('.').slice(-2).join('.');

  const iconUrl = (
    await fetchImageAsDataUrl(await fetchFaviconUrl(origin)) ||
    await fetchImageAsDataUrl(urlJoin(origin, '/favicon.ico')) ||
    await fetchImageAsDataUrl(urlJoin(origin.replace(hostname, 'www.' + getRootDomain(hostname)), '/favicon.ico')) ||
    await fetchImageAsDataUrl(urlJoin(origin.replace(hostname, getRootDomain(hostname)), '/favicon.ico'))
  );

  return iconUrl;
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



// ----- UTILS ----

const arrayBufferToBase64 = buffer => {
  const bytes = [].slice.call(new Uint8Array(buffer));
  let binary = '';
  bytes.forEach((b) => binary += String.fromCharCode(b));
  return window.btoa(binary);
};


