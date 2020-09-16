function onChange(control, oldValue, newValue, isLoading, isTemplate) {
	if (isLoading || newValue === '') {
		return;
	}
	var s = newValue;
	var fixedValue = s.toLowerCase()
	.replace(/[^a-z0-9\-]/gi, '-')
	.replace(/^-|-$/g, '');

	var ga = new GlideAjax("ValidateSourceID");
	ga.addParam('sysparm_name', 'validateTakenID');
	ga.addParam('id', fixedValue);
	ga.addParam('sys_id', g_form.getUniqueValue());
	ga.getXMLAnswer(function(answer) {
		if(answer == 'true') {
			g_form.showFieldMsg("id", "There is already a source with the same id, try another ID.", "error");
		}
		if (fixedValue == newValue) {
			return;	
		}
		g_form.setValue("id", fixedValue);
	});

}