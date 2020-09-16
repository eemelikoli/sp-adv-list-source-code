function onSubmit() {

	// clearing all messages set by other validation scripts
	g_form.hideFieldMsg('link_url');
	g_form.removeDecoration('link_url');

		//validate URL
		var url = g_form.getValue('link_url'),
			type = g_form.getValue('type');

		if (url === null || url === "" || type !== 'url') {
			return true;
		}
		//regex validation for link URL field
		var re = /(((ftp|http|https):\/\/)|(www\.))([-\w\.\/#$\?=+@&%_:;]+)/gi;
		if (re.test(url)) {
			return true;
		}
		g_form.showFieldMsg('link_url','Provided URL is not valid.', 'error');
		g_form.addDecoration('link_url', 'icon-alert', 'URL is not valid.', 'red');
		return false;
}