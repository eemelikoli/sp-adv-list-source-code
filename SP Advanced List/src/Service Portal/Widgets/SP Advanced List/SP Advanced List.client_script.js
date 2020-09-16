function advancedListController($location, $httpParamSerializer, sortService) {
	/* widget controller */
	var c = this;

	c.sort = function () {
		if (c.loading) {
			return;
		}
		addURLParms({sortBy:c.currentSort.id}, false);
		initializeList({
			sorting: c.currentSort,
			searchTerm: c.searchTerm
		});
	};



	// TODO: Move search and sorting to it's own widget?
	c.search = function (clearInput) {
		if (clearInput) {
			c.searchInput = undefined;
		}
		if (c.searchInput !== c.searchTerm) {
			c.searchTerm = c.searchInput;
			addURLParms({search:c.searchTerm}, false);
			initializeList({
				sorting: c.currentSort,
				searchTerm: c.searchTerm
			});
		}
	};


	c.loadMore = function () {
		if (c.loading) {
			return;
		}
		c.currentPage += 1;
		loadMore({
			sorting: c.currentSort,
			currentPage: c.currentPage,
			searchTerm: c.searchTerm
		});
	};


	c.generateLink = function (urlObj) {
		console.log(urlObj);
		var url = "",
			serializedParams = $httpParamSerializer(urlObj.parms);

		if (urlObj.type === 'url') {
			url = urlObj.base_url;
		}

		if (serializedParams.length > 0) {
			url += ((url.indexOf('?') === -1) ? '?' : '&') + serializedParams;
		}
		return url;
	};



	function addURLParms(parms, refreshPage) {
		var newParms = $location.search();
		Object.keys(parms).forEach(function(key)  {
			newParms[key] = parms[key];
		});
		newParms.spa = (refreshPage) ? null : 1;
		$location.search(newParms);
	}

	
	function initializeList(inputs) {
		var i = inputs;
		i.initializedSources = c.initializedSources;
		i.currentPage = 0;
		i.action = 'load';
		c.loading = true;
		c.server.get(inputs).then(function (response) {
			var r = response.data,
				compiledResults = compileResults(r.results, i.sorting);
			formList(compiledResults, r.pageSize, false);
			c.displayControls = true;
		});
	}



	function loadMore(inputs) {
		var i = inputs;
		i.initializedSources = c.initializedSources;
		i.action = 'load';
		c.loading = true;
		c.server.get(i).then(function (response) {
			var r = response.data;
			// when we move to another page and we have cached items, push them to results array
			if (c.cache.length > 0) {
				r.results.push(c.cache);
				c.cache = [];
			}
			var compiledResults = compileResults(r.results, i.sorting);
			formList(compiledResults, r.pageSize, true);
		});
	}



	function formList(results, pageSize, addItems) {
		if (results.length < pageSize) {
			c.noMoreResults = true;
		}
		if (results.length > pageSize) {
			c.cache = results.slice(pageSize);
		}
		c.items = (addItems) ? c.items.concat(results.slice(0, pageSize)) : results.slice(0, pageSize);
		c.noResults = c.items.length === 0;
		c.loading = false;
	}



	function compileResults(dataArr, sorting) {
		var sortArr = [].concat.apply([], dataArr), // our records come in a nested array so we need to combine those to one single array
			s = sorting;
		switch (s.type) {
			case 'date':
				c.sortService.dateSort(sortArr, s.field, s.orderAsc);
				break;
			case 'locale':
				c.sortService.localeSort(sortArr, s.field, s.orderAsc);
				break;
			default:
				c.sortService.defaultSort(sortArr, s.field, s.orderAsc);
		}
		return sortArr;
	}


	function init() {
		c.initializedSources = c.data.initializedSources;
		c.sortService = sortService;
		c.currentPage = 0;
		//check if URL already has sorting or search defined
		var parms = $location.search();
		c.currentSort = (parms && parms.sortBy) ? c.data.sortOptions[parms.sortBy-1] : c.data.sortOptions[0];
		c.searchTerm = (parms && parms.search) ? parms.search : "";
		c.searchInput = c.searchTerm; // display actual searchTerm in the input field

		c.displayControls = false; // hide controls before the list has loaded
		initializeList({
			sorting: c.currentSort,
			searchTerm: c.searchTerm
		});
	}

	init();

}