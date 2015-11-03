Package.describe({
  name: 'jonlachlan:quill-reactive',
  version: '0.0.1',
  summary: 'Helpers for QuillJS rich text (WYSIWYG) editor, with live editing similar to Google Docs or Etherpad',
  // URL to the Git repository containing the source code for this package.
  git: '',
  // By default, Meteor will default to using README.md for documentation.
  // To avoid submitting documentation, set this field to null.
  documentation: 'README.md'
});

Package.onUse(function(api) {
  api.versionsFrom('METEOR@1.0');
  api.use('ecmascript@0.1.6');
  api.use("templating", "client");
  api.use('trever:quill@0.0.5');
  api.use('jonlachlan:ottypes-rich-text@0.0.1');
  api.use('robertlowe:persistent-reactive-dict');
  api.use('dburles:mongo-collection-instances');
  api.addFiles('templates/quill-reactive.html', 'client');
  api.addFiles('templates/quill-reactive.js', 'client');
  api.addFiles('methods/update-quill.js');
});
