function sortService () {

	return {
		defaultSort: function defaultSort(arr, sortBy, sortAsc) {
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
		},

		localeSort: function localeSort(arr, sortBy, sortAsc) {
			return arr.sort(function (a, b) {
				var sortVal = a[sortBy].toLowerCase().localeCompare(b[sortBy].toLowerCase());
				if (!sortAsc) {
					return sortVal * (-1);
				}
				return sortVal;
			});
		},

		dateSort: function dateSort(arr, sortBy, sortAsc) {
			return arr.sort(function (a, b) {
				var dateA = new Date(a[sortBy]),
					dateB = new Date(b[sortBy]),
					sortVal = dateA - dateB;

				if (!sortAsc) {
					return sortVal * (-1);
				}
				return sortVal;
			});
		}
	};

}