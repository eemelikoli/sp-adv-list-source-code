function onLoad() {
	setScript();
	setFacetScript();
	setHTML();
}

function setScript() {
	var script = g_form.getValue('data_fetch_script');

	var isMine = false;
	if (script == scriptTemplate.replace(/\r/g, ""))
		isMine = true;
	if (script == '')
		isMine = true;

	if (!isMine)
		return;

	script = scriptTemplate;

	g_form.setValue('data_fetch_script', script);
}

function setFacetScript() {
	var script = g_form.getValue('facet_generation_script');

	var isMine = false;
	if (script == scriptTemplate.replace(/\r/g, ""))
		isMine = true;
	if (script == '')
		isMine = true;

	if (!isMine)
		return;

	script = facetScriptTemplate;

	g_form.setValue('facet_generation_script', script);
}

function setHTML() {
	var template = g_form.getValue('search_page_template');

	var isMine = false;
	if (template == htmlTemplate.replace(/\r/g, ""))
		isMine = true;
	if (template == '')
		isMine = true;

	if (!isMine)
		return;

	template = htmlTemplate;

	g_form.setValue('search_page_template', template);
}

// if this scriptTemplate variable is changed, the same variable in the Scripted Change Warning client script must be changed to match
var scriptTemplate = "(function(query) {\r\n  var results = [];\r\n  /* Calculate your results here. */\r\n  \r\n  return results;\r\n})(query);";

var facetScriptTemplate = "(function(query, facetService, searchResults) {\r\n	/* Calculate your facets here using facetService */\r\n	/* var stateFacet = facetService.createFacet('State', 'state'); */\r\n	/* stateFacet.addFacetItem('Facet Item Label', '123'); */\r\n\r\n})(query, facetService, searchResults);";

var htmlTemplate = '<div>\r\n  <a href="?id=form&amp;sys_id={{item.sys_id}}&amp;table={{item.table}}" class="h4 text-primary m-b-sm block">\r\n    <span ng-bind-html="highlight(item.primary, data.q)"></span>\r\n  </a>\r\n  <span class="text-muted" ng-repeat="f in item.fields">\r\n    <span class="m-l-xs m-r-xs" ng-if="!$first"> &middot; </span>\r\n    {{f.label}}: <span ng-bind-html="highlight(f.display_value, data.q)"></span>\r\n  </span>\r\n</div>';