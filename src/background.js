
import { each, includes } from 'lodash-es';

import { parseUrl } from './common';
import {
  fetchImageAsDataUrl,
  getBookmarkGroups,
  setStoredBookmarkIcon,
  // log,
} from './common';


chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.favIconUrl) handleFaviconUpdate(tab);
});


const handleFaviconUpdate = async ({ url, favIconUrl }) => {

  // check if the url origin matches the origin for any bookmarks
  const bookmarkOrigins = [];
  const bookmarkGroups = await getBookmarkGroups();
  each(bookmarkGroups, ({ bookmarks }) => each(bookmarks, bookmark => {
    bookmarkOrigins.push(parseUrl(bookmark.url).origin);
  }));

  const urlOrigin = parseUrl(url).origin;
  if (!includes(bookmarkOrigins, urlOrigin)) return;

  const faviconDataUrl = await fetchImageAsDataUrl(favIconUrl);
  setStoredBookmarkIcon(urlOrigin, faviconDataUrl);
};

