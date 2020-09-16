function onChange(control, oldValue, newValue, isLoading, isTemplate) {
	if (isLoading || newValue === '' || newValue === null) {
		return;
	}
	//regex validation for link URL field
	var re = /(((ftp|http|https):\/\/)|(www\.))([-\w\.\/#$\?=+@&%_:;]+)/gi;
	if (re.test(newValue)) { 
		return;
	}
	g_form.showFieldMsg('link_url', 'Please insert a valid URL','warning');
}