function onLoad() {
	var template = g_form.getValue('item_template');

	var isMine = false;
	if (template == htmlTemplate.decode)
		isMine = true;
	if (template == '')
		isMine = true;

	if (!isMine)
		return;

	template = htmlTemplate;

	g_form.setValue('item_template', template);
}

var htmlTemplate = '<h3 class=\"item-title\">{{item.title}}<\/h3>\r\n<ul class=\"primary-content list-inline\">\r\n    <li ng-repeat=\"field in item.primary_fields\">\r\n        <small class=\"text-muted\">{{field.label}}<\/small>\r\n        <p>{{field.display_value}}<\/p>\r\n    <\/li>\r\n<\/ul>\r\n\r\n<ul class=\"secondary-content\" ng-if=\"item.secondary_fields.length > 0\">\r\n    <li ng-repeat=\"field in item.secondary_fields\">\r\n        <small class=\"text-muted\">{{field.label}}<\/small>\r\n        <p>{{field.display_value}}<\/p>\r\n    <\/li>\r\n<\/ul>'