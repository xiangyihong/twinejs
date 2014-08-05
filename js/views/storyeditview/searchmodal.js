StoryEditView.SearchModal = Backbone.View.extend(
{
	initialize: function (options)
	{
		this.parent = options.parent;
		this.resultTemplate = _.template($('.searchModalResult').html());
	},

	/**
	 Opens a modal dialog for search/replace.

	 @method open
	**/

	open: function()
	{
		this.$el.data('modal').trigger('show');
	},

	/**
	 Closes the modal dialog for search/replace.

	 @method close
	**/

	close: function()
	{
		this.$el.data('modal').trigger('hide');
	},

	/**
	 Performs a search in story passages, updating the results list.

	 @method updateResults
	**/

	updateResults: function()
	{
		var searchVal = this.$('#searchFor').val();

		if (searchVal == '')
		{
			// bug out early if there was no text entered

			this.$('.results').empty();
			this.$('.resultSummary').hide();
			return;
		};

		var searchTerm = new RegExp('(' + this.$('#searchFor').val() + ')', 'g');
		var passagesMatched = 0;
		var resultHtml = '';

		this.$('.results').html('<i class="fa fa-circle-o-notch fa-spin"></i> Searching...');

		this.parent.children.each(_.bind(function (view)
		{
			var numMatches = view.model.numMatches(searchTerm);

			if (numMatches != 0)
			{
				passagesMatched++;

				resultHtml += this.resultTemplate(
				{
					passageId: view.model.cid,
					passageName: view.model.get('name'),
					numMatches: numMatches,
					resultNumber: passagesMatched,
					searchPreview: view.model.get('text').replace(searchTerm, '<span class="highlight">$1</span>')
				});
			};
		}, this));

		if (resultHtml != '')
		{
			this.$('.matchCount').text(passagesMatched);
			this.$('.resultSummary').show();
			this.$('.results').html(resultHtml);
		}
		else
		{
			this.$('.resultSummary').hide();
			this.$('.results').html('<p>No matching passages found.</p>');
		};
	},

	/**
	 Shows all result excerpts.

	 @method showAllResults
	**/

	showAllResults: function()
	{
		this.$('.results').find('.collapseContainer').each(function()
		{
			$(this).collapse('show');
		});
	},

	/**
	 Hides all result excerpts.

	 @method hideAllResults
	**/

	hideAllResults: function()
	{
		this.$('.results').find('.collapseContainer').each(function()
		{
			$(this).collapse('hide');
		});
	},

	/**
	 Performs a replace in a particular passage result, then
	 hides it from the search results.

	 @method replaceInPassage
	 @param {Event} e event object
	**/

	replaceInPassage: function (e)
	{
		var container = $(e.target).closest('.result');	
		var model = this.parent.children.findByModelCid(container.attr('data-passage')).model;

		model.replace(this.$('#searchFor').val(), this.$('#replaceWith').val());
		container.slideUp(null, function() { container.remove() });
	},

	/**
	 Performs a replace in all passages, closes the modal,
	 then shows a notification as to how many replacements were made.

	 @method replaceAll
	**/

	replaceAll: function()
	{
		var passagesMatched = 0;
		var totalMatches = 0;
		var searchTerm = this.$('#searchFor').val();
		var replaceWith = this.$('#replaceWith').val();

		this.parent.children.each(_.bind(function (view)
		{
			var numMatches = view.model.numMatches(searchTerm);

			if (numMatches != 0)
			{
				passagesMatched++;
				totalMatches += numMatches;
				view.model.replace(searchTerm, replaceWith);
			};
		}, this));

		this.$el.one('modalhide', function()
		{
			window.notify(totalMatches + ' replacements were made in ' + passagesMatched + ' passages.');	
		});
		this.close();
	},

	/**
	 Syncs the contents of the search field with the quick find field.

	 @method syncSearch
	**/

	syncSearch: function()
	{
		this.$('.results').empty();
		this.$('.resultSummary').hide();
		this.$('#searchFor').val($('#storyEditView .searchField').val());
	},

	events:
	{
		'modalshow': 'syncSearch',
		'keyup #searchFor': 'updateResults',
		'click .expandAll': 'showAllResults',
		'click .collapseAll': 'hideAllResults',
		'click .replacePassage': 'replaceInPassage',
		'click .replaceAll': 'replaceAll'
	}
});