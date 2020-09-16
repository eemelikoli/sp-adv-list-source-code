var ValidateSourceID = Class.create();
ValidateSourceID.prototype = Object.extendsObject(global.AbstractAjaxProcessor, {
	
	validateTakenID: function() {
		var gr = new GlideRecord('x_207729_adv_list_item_definition');
		gr.addQuery('id', this.getParameter('id'));
		gr.addQuery('sys_id', '!=', this.getParameter('sys_id'));
		gr.query();
		return gr.hasNext()+'';
	},
	type:"ValidateSourceID"
});