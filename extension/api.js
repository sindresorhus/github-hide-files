/* globals chrome */
'use strict';

const HideFilesOnGitHub = {};

HideFilesOnGitHub.defaults = {
	hideRegExp: `
		^\\.
		^license
		^cname$
		^version$
		^(patents|authors|contributors|acknowledgments|backers)(\\.|$)
		^(issue|pull_request)_template\\.md$
		^(appveyor|circle|codecov)\\.yml$
		^(yarn|Gemfile)\\.lock$
		^package-lock\\.json$
		^npm-shrinkwrap\\.json$
		\\.sublime-project$
		^(tsconfig|typings|tslint|tsfmt)\\.json$
		^coffeelint\\.json$
		^(karma|protractor|sauce).*\\.js$
		^testem(\\.[\\w-]+)?\\.(json|js)$
		^yuidoc\\.json$
		^stylelint-config\\.json
		^humans\\.txt
	`.replace(/\n\t+/g, '\n').trim()
};

HideFilesOnGitHub.storage = {
	get: () => new Promise(resolve => {
		chrome.storage.sync.get(HideFilesOnGitHub.defaults, resolve);
	}),
	set: obj => {
		chrome.storage.sync.set(obj);
	}
};
