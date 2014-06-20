
/*globals chrome,_ */

(function() {

	var bgPage = chrome.extension.getBackgroundPage();
	var bookmarks = bgPage.getBookmarks();
	var div = document.querySelector('div.bookmarks');


	function printBookmarks() {

		// get the bookmarks bar groups
		bookmarks.getChildren('1', function(groups) {

			// loop through each group
			_(groups).forEach(function(group) {

				console.log("group: " + group.title);

				var groupDiv = document.createElement("div");
				groupDiv.className = "group";
				var title = document.createElement("div");
				title.className= "title";
				title.innerHTML = group.title;
				groupDiv.appendChild(title);
				var ul = document.createElement("ul");
				ul.class="links";
				groupDiv.appendChild(ul);
				div.appendChild(groupDiv);

				bookmarks.getChildren(group.id, function(children){

					_(children).forEach(function(link) {
						console.log("link: " + link.title);
						var li = document.createElement("li");
						li.innerHTML = "<a href='" + link.url + "'><img class='favicon' src='chrome://favicon/" + link.url + "' />" + link.title + "</a>";
						ul.appendChild(li);
					});

				});
			});
		});
	}


	printBookmarks();

})();



