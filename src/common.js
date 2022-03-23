
import { useEffect, useMemo, useRef, useState } from 'react';
import { each, find, map, orderBy } from 'lodash-es';
import log from 'loglevel';
import urlJoin from 'url-join';
import * as b64ArrayBuffer from 'base64-arraybuffer';


log.setDefaultLevel('debug');
export { log };



// ----- OPTIONS -----

export const getSyncedOptions = async () => {
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

export const getBookmarkGroups = async bookmarksPath => {

  if (!bookmarksPath) {
    const options = await getSyncedOptions();
    bookmarksPath = options.bookmarksPath;
  }

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



// ----- BOOKMARK ICONS -----

export let _bookmarkIcons = false;


const getBookmarkIcons = async () => {
  if (!_bookmarkIcons) {
    const data = await chrome.storage.local.get('bookmarkIcons');
    _bookmarkIcons = data.bookmarkIcons;
  }
  return _bookmarkIcons;
};


export const getBookmarkIcon = async pageUrl => {
  const { origin } = new URL(pageUrl);

  return (await getBookmarkIcons())[origin];
};


const setBookmarkIcons = async bookmarkIcons => {
  _bookmarkIcons = bookmarkIcons;
  await chrome.storage.local.set({ bookmarkIcons });
};


export const setBookmarkIcon = async (pageUrl, iconUrl) => {
  const { origin } = new URL(pageUrl);
  setBookmarkIcons({
    ...(await getBookmarkIcons()),
    [origin]: iconUrl,
  });
};


export const fetchBookmarkIconDataUrl = async pageUrl => {

  const { origin, hostname } = new URL(pageUrl);

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



