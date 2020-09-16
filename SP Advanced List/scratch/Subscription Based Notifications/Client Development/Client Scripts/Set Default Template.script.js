function onLoad() {
	var objView = g_form.getElement('sysparm_view');
	if (!objView)
		return;
	var strView = objView.getAttribute('value'); 

	if (g_form.isNewRecord() && strView != "push_notification" && !g_form.getValue("template") &&
			   g_scratchpad.defaultEmailTemplateSysId)
		 g_form.setValue("template", g_scratchpad.defaultEmailTemplateSysId);
}