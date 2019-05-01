(function($, Symphony, undefined) {
	
	'use strict';
	
	var sels = {
		item: 'textarea[class*="markdown"], textarea[class*="commonmark"]'
	};
	
	var placeholders = [
		'Your text goes here...'
	];
	
	var Parchment = Quill.import('parchment');
	var Delta = Quill.import('delta');

	var LineBreakClass = new Parchment.Attributor.Class('linebreak', 'linebreak', {
		scope: Parchment.Scope.BLOCK
	});

	Quill.register('formats/linebreak', LineBreakClass);

	var init = function () {
		
		window.Quill.register('modules/markdownShortcuts', window.MarkdownShortcuts);
		
		var imageHandler = function () {
			var range = this.quill.getSelection();
			var value = window.prompt('Paste your image URL');
			this.quill.insertEmbed(range.index, 'image', value, window.Quill.sources.USER);
		};
		
		var randomPlaceholder = function () {
			return placeholders[Math.floor(Math.random() * placeholders.length)];
		};
		
		$(sels.item).each(function () {
			var t = $(this);
			var savedValue = t.val();
			var parsedMD = window.markdownit().render(savedValue);

			parsedMD = parsedMD.replace(new RegExp('\n$', 's'), '');
			parsedMD = parsedMD.replace(/<br>/g, '</p><p class="linebreak-true">');

			var editorCtn = $('<div />').html(parsedMD);
			var ctn = $('<div />').addClass('quill-editor').append(editorCtn);

			t.parent().append(ctn);
			t.closest('.field').addClass('quill-ctn');
			t.hide();

			var editor = new window.Quill(editorCtn.get(0), {
				theme: 'bubble',
				placeholder: randomPlaceholder(),
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
					markdownShortcuts: {},
					keyboard: {
						bindings: {
							smartbreak: {
								key: 13,
								shiftKey: true,
								handler: function (range, context) {
									this.quill.setSelection(range.index, 'silent');
									this.quill.insertText(range.index, '\n', 'user');
									this.quill.setSelection(range.index + 1, 'silent');
									this.quill.format('linebreak', true, 'user');
								}
							},
							paragraph: {
								key: 13,
								handler: function (range, context) {
									this.quill.setSelection(range.index, 'silent');
									this.quill.insertText(range.index, '\n', 'user');
									this.quill.setSelection(range.index + 1, 'silent');
									let f = this.quill.getFormat(range.index + 1);
									if(f.hasOwnProperty('linebreak')) {
										delete(f.linebreak);
										this.quill.removeFormat(range.index + 1);
										for(let key in f) {
											this.quill.formatText(range.index + 1, key, f[key]);
										}
									}
								}
							}
						}
					}
				}
			});

			editor.on('text-change', function () {
				var raw = $(editor.container.firstChild).clone().html();
				raw = raw.replace(/<\/p><p class="linebreak-true">/g, '<br/>').replace(/<br><\/p>/g, '</p>');
				raw = raw.replace(/<p><br><\p>/g, '');

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
