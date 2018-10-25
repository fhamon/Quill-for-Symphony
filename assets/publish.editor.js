(function($, Symphony, undefined) {

	'use strict';

	var sels = {
		item: 'textarea[class*="markdown"], textarea[class*="commonmark"]'
	};

	var init = function () {

		window.Quill.register('modules/markdownShortcuts', window.MarkdownShortcuts);

		var imageHandler = function () {
			var range = this.quill.getSelection();
			var value = window.prompt('Paste your image URL');
			this.quill.insertEmbed(range.index, 'image', value, window.Quill.sources.USER);
		};

		$(sels.item).each(function () {
			var t = $(this);
			t.closest('.field').addClass('quill-ctn');
			var savedValue = t.val();
			var parsedMD = window.markdownit().render(savedValue);
			t.hide();
			var editorCtn = $('<div />').html(parsedMD);
			var ctn = $('<div />').addClass('quill-editor').append(editorCtn);
			t.parent().append(ctn);
			var editor = new window.Quill(editorCtn.get(0), {
				theme: 'bubble',
				modules: {
					toolbar: {
						container: [
							[{ header: [false, 1, 2, 3, 4, 5, 6] }],
							[
								{ 'list' : 'ordered' },
								{ 'list' : 'bullet' } ,
								'link',
								'blockquote',
								'image'
							],
							['bold', 'italic']
						],
						handlers: {
							image: imageHandler
						}
					},
					markdownShortcuts: {}
				}
			});

			editor.on('text-change', function () {
				var raw = editor.container.firstChild.innerHTML;
				var markdown = new window.TurndownService({
					headingStyle: 'atx'
				}).turndown(raw);
				t.val(markdown);
			});

			editor.clipboard.addMatcher(window.Node.ELEMENT_NODE, function (node, delta) {
				delta.ops = delta.ops.map(function (op) {
					return {
						insert: op.insert
					};
				});
				return delta;
			});

		});
	};

	$(init);

}(window.jQuery, window.Symphony));
