function test($location, $httpParamSerializer) {
	/* widget controller */
	var c = this;

	c.currentPage = 0;
	c.maxPage = 0;
	c.displayControls = false;
	c.items = [];

	function init() {
		c.selectedSorting = c.data.sortingOptions[0];
		c.searchInput = $location.search().s;
		c.initializedSources = c.data.initializedSources;
		updateData("init", c.selectedSorting, c.currentPage, c.searchInput);
	}


	function updateData(action, sorting, currentPage, searchTerm) {

		var inputs = {
			action: action,
			sorting: sorting,
			searchTerm: searchTerm,
			currentPage: currentPage,
			initializedSources: c.initializedSources
		};

		c.loading = true;
		c.server.get(inputs).then(function (response) {
			var r = response.data;
			console.log(r);
			c.items = c.items.concat(compileResults(r.results, sorting));
			//var displaySources = c.items.reduce(function(acc))
			c.displayControls = true;
			c.loading = false;
		});
	}



	/**
	 * 
	 * @param {arr} data array of objects containing list records
	 * @param {string} orderBy field name to order the array by
	 * @param {boolean} orderAsc should the data be ordered ascending
	 * @param {int} limit how many items are returned after sorting
	 * @returns {arr} limited number of list record after sorting
	 */
	function compileResults(dataArr, sorting) {
		var sortArr = [].concat.apply([], dataArr), // our records come in a nested array so we need to combine those to one
			s = sorting;
		switch (s.type) {
			case 'date':
				dateSort(sortArr, s.sortBy, s.orderAsc);
				break;
			case 'locale':
				localeSort(sortArr, s.sortBy, s.orderAsc);
				break;
			default:
				defaultSort(sortArr, s.sortBy, s.orderAsc);
		}
		return sortArr;
	}



	/**
	 * 
	 * @param {arr} arr array to sort
	 * @param {string} sortBy object property name to sort by
	 */
	function dateSort(arr, sortBy, sortAsc) {
		return arr.sort(function (a, b) {
			var dateA = new Date(a[sortBy]),
				dateB = new Date(b[sortBy]),
				sortVal = dateA - dateB;

			if (!sortAsc) {
				return sortVal * (-1)
			}
			return sortVal;
		});
	}



	/**
	 * 
	 * @param {arr} arr array to sort
	 * @param {string} sortBy object property name to sort by
	 */
	function localeSort(arr, sortBy, sortAsc) {
		return arr.sort(function (a, b) {
			var sortVal = a[sortBy].toLowerCase().localeCompare(b.localeCompare.toLowerCase());
			if (!sortAsc) {
				return sortVal * (-1);
			}
			return sortVal;
		});
	}



	/**
	 * 
	 * @param {arr} arr array to sort
	 * @param {string} sortBy object property name to sort by
	 */
	function defaultSort(arr, sortBy, sortAsc) {
		return arr.sort(function (a, b) {
			if (sortAsc) {
				if (a[sortBy] < b[sortBy]) {
					return -1;
				}
				if (a[sortBy] > b[sortBy]) {
					return 1;
				}
				return 0;
			}

			if (a[sortBy] > b[sortBy]) {
				return -1;
			}
			if (a[sortBy] < b[sortBy]) {
				return 1;
			}
			return 0;
		});
	}



	c.reload = function () {
		if (c.loading) {
			return;
		}
		updateData("loadMore", c.selectedSorting, c.currentPage, c.searchInput);
	};



	// TODO: Move search and sorting to it's own widget??
	c.search = function () {
		// removes s param from url on empty search string
		if (c.searchInput === "") {
			c.searchInput = undefined;
		}

		if (c.searchInput !== c.data.searchTerm) {
			var parms = $location.search();
			parms.s = c.searchInput;
			parms.spa = 1;
			$location.search(parms);
			c.currentPage = 0;
			c.reload();
		}
	};



	c.clearSearch = function () {
		c.searchInput = undefined;
		c.search();
	};



	c.loadMore = function () {
		c.currentPage += 1;
		c.reload();
	};



	c.generateURL = function (urlObj) {
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


	/*
	c.previousPage = function () {
		if (c.currentPage === 0) {
			return;
		}
		c.currentPage -= 1;
		c.reload();
	};

	c.goToPage = function (pageNo) {
		if (c.currentPage === pageNo) {
			return;
		}
		c.currentPage = pageNo;
		c.reload();
	};*/


	init();

}