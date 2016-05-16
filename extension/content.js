'use strict';
let visibility;
let hideRegExp;
let toggleOn = true;

const injector = window.gitHubInjection;

function createHtml(str) {
	const frag = document.createDocumentFragment();
	const temp = document.createElement('div');

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
	const toggleBtn = createHtml(`<a class="hide-files-btn btn btn-sm">${label()}</a>`);
	const btnContainer = document.querySelector('.file-navigation .btn-group.right');

	fixupOtherButtons();

	if (document.querySelector('.hide-files-btn')) {
		addToggleBtnEvents();
		return;
	}

	if (btnContainer) {
		// insert after
		btnContainer.insertBefore(toggleBtn, btnContainer.children[0]);
		addToggleBtnEvents();
	}
}

function fixupOtherButtons() {
	const sidebar = document.querySelector('.file-navigation .right');
	if (!sidebar) {
		return;
	}

	const buttons = Array.from(sidebar.getElementsByClassName('btn btn-sm'));
	for (const button of buttons) {
		const text = button.textContent.trim();
		if (text === 'Download ZIP') {
			button.innerHTML = '⇣ ZIP';
		}
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
