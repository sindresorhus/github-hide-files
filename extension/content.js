'use strict';
let visibility;
let hideRegExp;
let toggleOn = true;

const injector = window.gitHubInjection;

function createHtml(str) {
	const frag = document.createDocumentFragment();
	const temp = document.createElement('tr');

	temp.innerHTML = str;

	while (temp.firstChild) {
		frag.appendChild(temp.firstChild);
	}

	return frag;
}

function toggleFiles() {
	const rows = Array.from(document.querySelectorAll('.files tr'));
	let i = 0;

	for (const el of rows) {
		if (el.querySelector('.content a')) {
			const fileName = el.querySelector('td.content a').innerText;

			if (hideRegExp && hideRegExp.test(fileName)) {
				if (visibility === 'hidden') {
					el.style.display = toggleOn ? 'none' : 'table-row';
				} else if (visibility === 'dimmed') {
					if (toggleOn) {
						el.classList.add('dimmed');
					} else {
						el.classList.remove('dimmed');
					}
				}
			}
		} else if (++i === 1) {
			// remove top border
			el.classList.add('first');
		}
	}
}

function addToggleBtn() {
	const toggleBtn = createHtml(`<td class="icon"></td><td class="hide-files-btn content">${label()}</td>`);
	const fileTable = document.querySelector('.files');

	if (document.querySelector('.hide-files-btn')) {
		addToggleBtnEvents();
		return;
	}

	if (fileTable) {
		// insert at the end of the table
		fileTable.insertBefore(toggleBtn, fileTable.children[fileTable.rows.length - 1]);
		addToggleBtnEvents();
	}
}

function addToggleBtnEvents() {
	const btn = document.querySelector('.hide-files-btn');

	if (btn) {
		btn.addEventListener('click', () => {
			toggleOn = !toggleOn;
			btn.textContent = label();
			toggleFiles();
		});
	}
}

function label() {
	return toggleOn ? 'Show dotfiles' : 'Hide dotfiles';
}

function trigger() {
	addToggleBtn();
	toggleFiles();
}

document.addEventListener('DOMContentLoaded', () => {
	trigger();

	const container = document.querySelector('#js-repo-pjax-container');

	if (!container) {
		return;
	}

	new MutationObserver(trigger).observe(container, {childList: true});

	window.HideFilesOnGitHub.storage.get((err, items) => {
		if (err) {
			throw err;
		}

		visibility = items.visibility;
		hideRegExp = items.hideRegExp === '' ? undefined : new RegExp(items.hideRegExp, 'i');

		injector(window, err => {
			if (err) {
				console.error(err);
				return;
			}

			addToggleBtnEvents();
			trigger();
		});
	});
});
