function onSubmit() {
	g_form.hideFieldMsg('id');
	g_form.removeDecoration('id');
	if (g_scratchpad.isFormValid) {
		return true;
	}
	var actionName = g_form.getActionName();
	var ga = new GlideAjax("ValidateSourceID");
		ga.addParam('sysparm_name', 'validateTakenID');
		ga.addParam('id', g_form.getValue('id'));
		ga.addParam('sys_id', g_form.getUniqueValue());
		ga.getXMLAnswer(function (answer) {
			if (answer === 'false') { // false means ID does not exist yet
				g_scratchpad.isFormValid = true;
				g_form.submit(actionName);
			} else {
				g_form.showFieldMsg('id', 'ID must be unique, the provided ID already exists', 'error');
				g_form.addDecoration('id', 'icon-alert', 'ID must be unique, the provided ID already exists', 'red');
			}
		});
	return false;
}