(function () {
  // CONSTANTS
  var LIST_SOURCE_TABLE = "x_207729_adv_list_item_definition",
    CONFIG_FIELDS = [
      "active",
      "table",
      "id",
      "title_field",
      "primary_fields",
      "secondary_fields",
      "meta_fields",
      "filter",
      "item_icon",
      "item_template",
      "type",
      "link_url",
      "link_parameters",
      "page"
    ],
    SORTING_OPTIONS = [{
      'id': 1,
      'field': 'title',
      'display': gs.getMessage('title_AZ'),
      'orderAsc': true,
      'type': 'string'
    }, {
      'id': 2,
      'field': 'title',
      'display': gs.getMessage('title_ZA'),
      'orderAsc': false,
      'type': 'locale'
    }, {
      'id': 3,
      'field': 'sys_created_on',
      'display': gs.getMessage('Newest'),
      'orderAsc': false,
      'type': 'date'
    }, {
      'id': 4,
      'field': 'sys_created_on',
      'display': gs.getMessage('Oldest'),
      'orderAsc': true,
      'type': 'date'
    }, {
      'id': 5,
      'field': 'sys_updated_on',
      'display': gs.getMessage('Latest modified'),
      'orderAsc': false
    }, {
      'id': 6,
      'field': 'sys_updated_on',
      'display': gs.getMessage('Oldest modified'),
      'orderAsc': true,
      'type': 'date'
    }];

  var initializedSources = [],
    pageSize = 12;
  data.sortingOptions = SORTING_OPTIONS;


  // in order to keep the options beyond initial load we need to pass them to data object
  if (options) {
    data.options = options;
  }

  // making the widget async
  if (!input) {
    //initialize the table instances on the first load so template can be cached
    initializedSources = initializeListSources(options.list_sources, LIST_SOURCE_TABLE, CONFIG_FIELDS);
    data.initializedSources = initializedSources;
    return;
  }

  // set options from input
  if (input.options) {
    options = input.options;
  }

  var grOptions = {
    orderBy: input.sorting.field,
    orderAsc: input.orderAsc,
    pageStart: input.currentPage * pageSize,
    pageEnd: input.currentPage * pageSize + pageSize,
    searchTerm: input.searchTerm
  };
  initializedSources = input.initializedSources;



  //TODO: add action to empty set cache to empty when jumping to specific page of results
  // TODO: make result caching work when pagination goes towards beginning
  if (input.action === 'init') {
    load(grOptions);
  }

  if (input.action === 'loadMore') {
    load(grOptions);
  }

  function load(o, sourceList) {
    if (!initializedSources) {
      errorMsgProvider('configuration');
      return;
    }

    data.initializedSources = initializedSources;
    var recordSourceArr = initializedSources.map(function (source, index, sources) {
      if (o.orderBy === 'title') {
        o.orderBy = source.title_field;
      }
      var query = generateGliderecord(source.table, source.filter, o);
      sources[index].totalResults = parseInt(getNoRecords(source.table, query.getEncodedQuery()));
      return getRecords(query, source);
    });
    data.results = recordSourceArr;
  }
})();



function initializeListSources(listSources, listSourceTable, configurationFields) {
  if (listSources.length === 0) {
    errorMsgProvider('configuration');
    return;
  }
  var sources = listSources.split(",");

  // TODO: should listTemplates be handled in its own function?
  data.listTemplates = {};
  var sourceConfigs = sources.map(function (source) {
    var sourceGr = new GlideRecord(listSourceTable);
    sourceGr.get(source);
    if (!sourceGr.isValidRecord() || sourceGr.getValue('active') === '0') {
      errorMsgProvider("table");
      return;
    }
    var t = {};
    for (var i = 0, j = configurationFields.length; i < j; i++) {
      t[configurationFields[i]] = sourceGr.getValue(configurationFields[i]);
    }
    data.listTemplates["sp-template-" + t.id + ".html"] = $sp.translateTemplate(t.item_template); //using undocumented ServiceNow function to generate the list templates dynamically from record data
    return t;
  });
  return sourceConfigs;
}



/**
 * 
 * @param {string} table name of the table where the query is constructed
 * @param {string} filter filter to be applied 
 * @param {string} orderBy field name to order the query
 * @param {boolean} orderAsc ascending (true) or descencing (false, default) ordering
 * @param {int} limit how many records should be returned from the query
 * @returns {glideRecord obj} queried gliderecord object
 */
function generateGliderecord(table, filter, o) {
  var query = new GlideRecord(table);
  if (!query.isValid()) {
    errorMsgProvider('table', table, $sp.getValue('title'));
    return;
  }

  if (filter) {
    query.addEncodedQuery(filter);
  } 

  if (o.searchTerm) {
    query.addQuery('123TEXTQUERY321', o.searchTerm);
    //query.addQuery('IR_AND_OR_QUERY', searchTerm);
  }
  if (o.orderAsc === true ? query.orderBy(o.orderBy) : query.orderByDesc(o.orderBy));

  //gs.addInfoMessage((o.pageStart && o.pageEnd));
  if (o) {
    query.chooseWindow(o.pageStart, o.pageEnd);
  }

  query.query();
  return query;
}



function getNoRecords(table, encodedQuery) {
  var noRecords = 0,
    count = new GlideAggregate(table);
  count.addEncodedQuery(encodedQuery);
  count.addAggregate('COUNT');
  count.query();

  if (count.next()) {
    noRecords = count.getAggregate('COUNT');
  }
  return noRecords;
}




function getRecords(query, source) {
  var records = [],
    t = source;

  while (query.next()) {
    var record = {},
      title = {};
      $sp.getRecordDisplayValues(title, query, t.title_field);

    record = {
      sys_id: query.getValue('sys_id'), //get sys_id for every record
      sys_created_on: query.getValue('sys_created_on'), // sorting
      sys_updated_on: query.getValue('sys_updated_on'), // sorting
      sys_class_name: query.getDisplayValue('sys_class_name'),
      title: title[Object.keys(title)[0]],
      source: t.id,
      icon: t.item_icon, //form FontAwesome icon name for the record
      templateID: "sp-template-" + t.id + ".html", // form the record template name
      primary_fields: {},
      secondary_fields: {},
      meta_fields: {}
    };

    //we need to use $sp.getRecord* to access dot-walked fields in scoped application
    $sp.getRecordElements(record.primary_fields, query, t.primary_fields);
    $sp.getRecordElements(record.secondary_fields, query, t.secondary_fields);
    $sp.getRecordElements(record.meta_fields, query, t.meta_fields);

    record.url = generateURL(record, {
      'type': t.type,
      'page': t.page,
      'base_url': t.link_url,
      "parms": t.link_parameters
    });
    records.push(record);
  }
  return records;
}



function generateURL(record, urlObj) {
  var parms = JSON.parse(urlObj.parms);
  var url = {
    type: urlObj.type,
    base_url: urlObj.base_url || "",
    parms: {}
  };

  if (urlObj.type === 'page') {
    var pageGr = new GlideRecord('sp_page');
    pageGr.get(urlObj.page);
    url.parms.id = pageGr.getValue('id');
  }

  for (var p in parms) {
    // check if the property/key is defined in the object itself, not in parent
    if (parms.hasOwnProperty(p)) {
      var meta = record.meta_fields[p] || record.meta_fields[parms[p]] || null; //check meta_fields for the url property
      if (meta) {
        meta = meta.value;
      }
      url.parms[p] = meta || record[p] || parms[p] || null; //setting the param value, first check meta_fields for the value, then record values and param values
    }
  }
  return url;
}



/**
 * 
 * @param {string} errorType possible errors "configuration" or "table"
 * @param {string} arg1 table name to be added to the error message
 * @param {string} arg2 widget identifier for error message
 */
function errorMsgProvider(errorType, arg1, arg2) {
  data.error = true;
  data.errorMessages = [];
  switch (errorType) {
    case 'configuration':
      data.errorMessages.push("Table configuration is not available for this widget. Please contact your system administrator.");
      break;
    case 'table':
      data.errorMessages.push("One of tables provided for widget is not valid.");
      gs.warn("The table ({0}) provided for widget ({1}) is not valid.", arg1, arg2);
      break;
    default:
      data.errorMessages.push("An error occurred, please try again later. If the problem persists contact your system administrator.");
  }
}