
/*globals chrome */



(function() {

  "use strict";

  console.log('==== i am here too');


  window.bookmarks = chrome.bookmarks;

  window.getBookmarks = function() {
    return chrome.bookmarks;
  };


  chrome.bookmarks.getTree(tree => {
    console.log('==== bookmarks tree:', tree);
  });


})();
