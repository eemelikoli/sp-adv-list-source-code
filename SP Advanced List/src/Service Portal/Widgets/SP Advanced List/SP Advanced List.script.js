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
      "link_fields",
      "filter",
      "item_icon",
      "item_template",
      "type",
      "link_url",
      "link_parameters",
      "page"
    ],
    // TODO?: Move search and sorting logic to it's own widget
    SORT_OPTIONS = [{
        id: 1,
        field: "title",
        display: gs.getMessage("title_AZ"),
        orderAsc: true,
        type: "locale"
      },
      {
        id: 2,
        field: "title",
        display: gs.getMessage("title_ZA"),
        orderAsc: false,
        type: "locale"
      },
      {
        id: 3,
        field: "sys_created_on",
        display: gs.getMessage("Newest"),
        orderAsc: false,
        type: "date"
      },
      {
        id: 4,
        field: "sys_created_on",
        display: gs.getMessage("Oldest"),
        orderAsc: true,
        type: "date"
      }
    ];

  var initializedSources = [],
    pageSize = 10; // TODO: allow page size to be set in instanse options
  data.sortOptions = SORT_OPTIONS;

  // in order to keep the options beyond initial load we need to pass them to data object
  if (options) {
    data.options = options;
  }

  // making the widget async
  if (!input) {
    //initialize the table instances on the first load so templates can be cached
    initializedSources = initializeListSources(
      options.list_sources,
      LIST_SOURCE_TABLE,
      CONFIG_FIELDS
    );
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
    searchTerm: input.searchTerm,
    initializedSources: input.initializedSources,
  };

  if (input.action === "load") {
    load(grOptions);
  }




  function load(opt) {
    var sources = opt.initializedSources.filter(function(source){
      return source !== null && source !== undefined;
    });

    if (!sources) {
      errorMsgProvider("configuration");
      return;
    }

    var sourceQueries = sources.map(function (source) {
      if (opt.orderBy === "title") {
        opt.orderBy = source.title_field;
      }
      var tempGr = generateGliderecord(source.table, source.filter, opt);
      return {
        source: source,
        glideRecord: tempGr,
        noRecords: tempGr.getRowCount()
      };
    });

    // clean null and 0 result queries
    var validQueries = sourceQueries.filter(function (query) {
      return query.glideRecord !== null && query.noRecords > 0;
    });

    //fetch available records from valid queries
    var results = validQueries.map(function (query) {
      return getRecords(query.glideRecord, query.source);
    });

    data.results = results;
    data.souceQueries = sourceQueries;
    data.initializedSources = opt.initializedSources;
    data.searchTerm = opt.searchTerm;
    data.pageSize = pageSize;
  }
})();



function initializeListSources(
  listSources,
  listSourceTable,
  configurationFields
) {
  if (listSources.length === 0) {
    errorMsgProvider("configuration");
    return;
  }
  var sources = listSources.split(",");
  data.listTemplates = {};
  var sourceConfigs = sources.map(function (source) {
    var sourceGr = new GlideRecord(listSourceTable);
    sourceGr.get(source);
    if (!sourceGr.isValidRecord() || sourceGr.getValue("active") === "0") {
      errorMsgProvider("table");
      return;
    }
    var t = {};
    for (var i = 0, j = configurationFields.length; i < j; i++) {
      t[configurationFields[i]] = sourceGr.getValue(configurationFields[i]);
    }
    data.listTemplates["sp-template-" + t.id + ".html"] = $sp.translateTemplate(
      t.item_template
    ); //using undocumented ServiceNow function to generate the list templates from record data

    if (t.type === 'page') {
      var pageGr = new GlideRecord("sp_page");
      pageGr.get(t.page);
      t.pageID = pageGr.getValue("id");
    }

    return t;
  });
  return sourceConfigs;
}



function generateGliderecord(table, filter, o) {
  var query = new GlideRecordSecure(table);

  if (!query.isValid()) {
    errorMsgProvider("table", table, $sp.getValue("title"));
    return;
  }

  if (filter) {
    query.addEncodedQuery(filter);
  }

  if (o.searchTerm) {
    //query.addQuery("123TEXTQUERY321", o.searchTerm);
    query.addQuery('IR_AND_OR_QUERY', o.searchTerm);
  }
  if (
    o.orderAsc === true ?
    query.orderBy(o.orderBy) :
    query.orderByDesc(o.orderBy)
  );

  if (o) {
    query.chooseWindow(o.pageStart, o.pageEnd);
  }

  query.query();
  return query;
}



function getRecords(query, source) {
  var records = [],
    t = source;

  while (query.next()) {
    if (!query.canRead()) {
      continue;
    }
    var record = {},
      title = {};
    $sp.getRecordDisplayValues(title, query, t.title_field);
    record = {
      sys_id: query.getValue("sys_id"), //get sys_id for every record
      table: t.table, //add table for every record
      sys_created_on: query.getValue("sys_created_on"), // sorting
      sys_updated_on: query.getValue("sys_updated_on"), // sorting
      sys_class_name: query.getDisplayValue("sys_class_name"), // display below icon
      title: title[Object.keys(title)[0]],
      source_id: t.id,
      icon: t.item_icon, //form FontAwesome icon name for the record
      templateID: "sp-template-" + t.id + ".html", // form the record template name
      primary_fields: {},
      secondary_fields: {},
      link_fields: {},
    };

    //we need to use $sp.getRecord* to access dot-walked fields in scoped application
    $sp.getRecordElements(record.primary_fields, query, t.primary_fields);
    $sp.getRecordElements(record.secondary_fields, query, t.secondary_fields);
    $sp.getRecordElements(record.link_fields, query, t.link_fields);

    record.url = generateURL(record, {
      type: t.type,
      page: t.page,
      pageID: t.pageID,
      base_url: t.link_url,
      parms: t.link_parameters,
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
    parms: {},
  };

  // TODO: Move the page query to be done when list sources are initialized to reduce the number of queries
  if (urlObj.type === "page") {
    url.parms.id = urlObj.pageID;
  }

  for (var key in parms) {
    if (parms.hasOwnProperty(key)) {
      var parm = parms[key],
        type = parm.split('.')[0],
        field = parm.split('.')[1],
        value = "";

      if (type === 'record') {
        value = record[field];
      }
      if (type === 'field') {
        value = record.link_fields[field];
      }
      if (value === "") {
        value = parm;
      }
      url.parms[key] = value.toLowerCase();
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
    case "configuration":
      data.errorMessages.push(
        "Table configuration is not available for this widget. Please contact your system administrator."
      );
      break;
    case "table":
      data.errorMessages.push(
        "One of tables provided for widget is not valid."
      );
      gs.warn(
        "The table ({0}) provided for widget ({1}) is not valid.",
        arg1,
        arg2
      );
      break;
    case "table_access":
      data.errorMessages.push(
        "Cannot display items from one of the defined tables due to access right restrictions. " + arg1 + " " + arg2
      );
      break;
    default:
      data.errorMessages.push(
        "An error occurred, please try again later. If the problem persists contact your system administrator."
      );
  }
}
