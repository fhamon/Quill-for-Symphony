(function($, Symphony, undefined) {

	'use strict';

	var sels = {
		item: 'textarea[class*="markdown"], textarea[class*="commonmark"]'
	};

	var Delta = window.Quill.import('delta');
	var Break = window.Quill.import('blots/break');
	var Embed = window.Quill.import('blots/embed');

	var lineBreakMatcher = function () {
		var newDelta = new Delta();
		newDelta.insert({'break': ''});
		return newDelta;
	};

	class SmartBreak extends Break {
		length () {
			return 1;
		}
		value () {
			return '\n';
		}
		
		insertInto(parent, ref) {
			Embed.prototype.insertInto.call(this, parent, ref);
		}
	}

	SmartBreak.blotName = 'break';
	SmartBreak.tagName = 'BR';

	window.Quill.register(SmartBreak);

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
					clipboard: {
						matchers: [
							['BR', lineBreakMatcher] 
						]
					},
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
					markdownShortcuts: {},
					keyboard: {
						bindings: {
							linebreak: {
								key: 13,
								shiftKey: true,
								handler: function (range) {
									var currentLeaf = this.quill.getLeaf(range.index)[0];
									var nextLeaf = this.quill.getLeaf(range.index + 1)[0];
						
									this.quill.insertEmbed(range.index, 'break', true, 'user');
						
									if (nextLeaf === null || (currentLeaf.parent !== nextLeaf.parent)) {
										this.quill.insertEmbed(range.index, 'break', true, 'user');
									}

									this.quill.setSelection(range.index + 1, window.Quill.sources.SILENT);
								}
							}
						}
					}
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
