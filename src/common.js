
import { each, find, map, orderBy } from 'lodash-es';
import log from 'loglevel';
import urlJoin from 'url-join';


log.setDefaultLevel('debug');
export { log };


const _state = {};


const getBookmarksTree = async () => new Promise(resolve => chrome.bookmarks.getTree(resolve));


export const getBookmarksTreeNode = async bookmarksPath => {
  const bookmarksTree = await getBookmarksTree();

  const pathElems = bookmarksPath.split('/');
  let pathNode = bookmarksTree[0];
  each(pathElems, pathElem => {
    pathNode = find(pathNode?.children, { title: pathElem });
    if (!pathNode) {
      log.warn('Unable to find boomarks path node:', pathElem);
      return false;
    }
  });
  return pathNode;
};


export const getBookmarkIcons = () => {
  if (!_state.bookmarkIcons) _state.bookmarkIcons = JSON.parse(window.localStorage.getItem('bookmarkIcons') || '{}');
  return _state.bookmarkIcons;
};


const setBookmarkIcons = bookmarkIcons => {
  _state.bookmarkIcons = bookmarkIcons;
  window.localStorage.setItem('bookmarkIcons', JSON.stringify(bookmarkIcons));
};


export const setBookmarkIcon = (origin, url) => {
  setBookmarkIcons({ ..._state.bookmarkIcons, [origin]: url });
};


const arrayBufferToBase64 = buffer => {
  const bytes = [].slice.call(new Uint8Array(buffer));
  let binary = '';
  bytes.forEach((b) => binary += String.fromCharCode(b));
  return window.btoa(binary);
};


export const fetchImageAsDataUrl = async url => {
  if (!url) return;
  try {
    const response = await fetch(url);
    if (response.status >= 400) return;
    const contentType = response.headers.get('content-type');
    if (!contentType?.startsWith('image')) return;
    const arrayBuffer = await response.arrayBuffer();
    const dataUrl = `data:${contentType};base64,${arrayBufferToBase64(arrayBuffer)}`;
    return dataUrl;
  }
  catch (err) {
    log.error('Error fetching image data URL:', url);
    console.error(err); // eslint-disable-line no-console
  }
};


export const fetchPageFaviconUrl = async pageUrl => {
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

