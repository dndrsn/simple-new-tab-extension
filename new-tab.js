
/*globals chrome */

(function() {

	var bgPage = chrome.extension.getBackgroundPage();
	var bookmarks = bgPage.getBookmarks();
	var ul = document.querySelector('ul.bookmarks');


	function printBookmarks(bookmarks) {

		var html = '';

	  bookmarks.forEach(function(bookmark) {
			html += "<li><a href='" + bookmark.url + "'><img class='favicon' src='chrome://favicon/" + bookmark.url + "' />" + bookmark.title + "</a></li>";
	  });

	  ul.innerHTML = html;

	}


	bookmarks.getChildren('1', function(bookmarks) {
	  printBookmarks(bookmarks);
	});

})();



