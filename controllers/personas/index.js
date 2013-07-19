var PersonasController = Composer.Controller.extend({
	elements: {
		'div.personas-list': 'personas_list'
	},

	events: {
		'click .button.add': 'add_persona',
		'click a.add': 'add_persona',
		'click a[href=#edit]': 'edit_persona',
		'click a[href=#delete]': 'delete_persona'
	},

	collection: null,
	list_controller: null,

	init: function()
	{
		if(!this.collection) this.collection = tagit.user.get('personas');
		this.render();
		modal.open(this.el);
		var modalclose = function() {
			modal.removeEvent('close', modalclose);
			this.release();
		}.bind(this);
		modal.addEvent('close', modalclose);
		this.collection.bind(['change', 'add', 'remove', 'destroy', 'reset'], this.render.bind(this), 'personas:monitor:render');

		tagit.keyboard.detach(); // disable keyboard shortcuts while editing
	},

	release: function()
	{
		if(modal.is_open) modal.close();
		if(this.list_controller) this.list_controller.release();
		this.collection.unbind(['change', 'add', 'remove', 'destroy', 'reset'], 'personas:monitor:render');
		tagit.keyboard.attach(); // re-enable shortcuts
		this.parent.apply(this, arguments);
	},

	render: function()
	{
		var personas = this.collection.map(function(persona) {
			return toJSON(persona);
		});
		var content = Template.render('personas/index', {
			num_personas: personas.length
		});
		this.html(content);
		if(this.list_controller) this.list_controller.release();
		if(this.personas_list)
		{
			this.list_controller = new PersonaListController({
				inject: this.personas_list,
				personas: personas
			});
		}
	},

	add_persona: function(e)
	{
		if(e) e.stop();
		this.release();
		new PersonaEditController({
			collection: this.collection
		});
	},

	get_persona_id: function(target)
	{
		return next_tag_up('li', next_tag_up('li', target).getParent()).className.replace(/^.*persona_([0-9a-f-]+).*?$/, '$1');
	},

	edit_persona: function(e)
	{
		if(!e) return false;
		e.stop();
		var pid		=	this.get_persona_id(e.target);
		var persona	=	this.collection.find_by_id(pid);
		if(!persona) return false;
		this.release();
		new PersonaEditController({
			collection: this.collection,
			model: persona
		});
	},

	delete_persona: function(e)
	{
		if(!e) return false;
		e.stop();
		var pid = this.get_persona_id(e.target);
		var persona = this.collection.find_by_id(pid);
		if(!persona) return false;
		if(!confirm('Really delete this persona? It will be gone forever, along with its keys (both public and private). All data shared with this persona will no longer be accessible to you. THIS IS IRREVERSIBLE.')) return false;
		persona.destroy_persona();
	}
});