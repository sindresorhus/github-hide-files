'use strict';

const select = document.querySelector.bind(document);
const selectAll = (selector: string): HTMLElement[] => [...document.querySelectorAll<HTMLElement>(selector)];

let willPreviewFiles: boolean;
let hideRegExp: RegExp;

const domLoaded = new Promise(resolve => {
	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', resolve);
	} else {
		resolve();
	}
});

function overflowsParent(el) {
	return el.getBoundingClientRect().right > el.parentNode.getBoundingClientRect().right;
}

function updateUI() {
	const hiddenFiles =
		selectAll('.files .js-navigation-item .content > span > *')
			.filter(el => hideRegExp.test(el.textContent));

	if (hiddenFiles.length === 0) {
		return;
	}

	const hidden = document.createDocumentFragment();
	let previewList: HTMLElement;

	if (willPreviewFiles) {
		previewList = <span class="hide-files-list"/>;
	}

	for (const file of hiddenFiles) {
		const row = file.closest('tr');
		row.classList.add('dimmed');

		// If there's just one hidden file, there's no need to move it
		if (hiddenFiles.length === 1) {
			continue;
		}

		hidden.append(row);
		if (willPreviewFiles) {
			const node = file.cloneNode(true) as HTMLElement;
			delete node.id;
			node.tabIndex = -1;
			previewList.append(node);
		}
	}

	if (hiddenFiles.length < 2) {
		return;
	}

	// The first tbody contains the .. link if it's a subfolder.
	select('.files tbody:last-child').prepend(hidden);

	// Add it at last to make sure it's prepended to everything
	addToggleBtn(previewList);
}

function addToggleBtn(filesPreview) {
	const btnRow = select('.hide-files-row');
	const tbody = select('table.files tbody');
	if (btnRow) {
		// This is probably inside a pjax event.
		// Make sure it's still on top.
		tbody.prepend(btnRow);
		return;
	}

	select('table.files').before(
		<input type="checkbox" id="HFT" class="hide-files-toggle" checked/>
	);

	tbody.prepend(
		<tr class="hide-files-row dimmed">
			<td colspan="5">
				<label for="HFT" class="hide-files-btn">
					{filesPreview ? <svg aria-hidden="true" height="16" width="10"><path d="M5 11L0 6l1.5-1.5L5 8.25 8.5 4.5 10 6z" /></svg> : ''}
				</label>
			</td>
		</tr>
	);

	if (!filesPreview) {
		select('.hide-files-row').prepend(<td class="icon"/>);
		return;
	}

	select('.hide-files-btn').after(filesPreview);

	// Drop extra links on long lists
	let moreBtn;
	while (overflowsParent(filesPreview)) {
		if (!moreBtn) {
			moreBtn = true;
			filesPreview.append(<label for="HFT"><a>etc...</a></label>);
		}

		filesPreview.querySelector(':scope > a:last-of-type').remove();
	}
}

async function init() {
	const settings: typeof HideFilesOnGitHub.defaults = await HideFilesOnGitHub.storage.get();
	willPreviewFiles = settings.filesPreview;
	hideRegExp = new RegExp(settings.hideRegExp.replace(/\n+/g, '|'), 'i');

	const observer = new MutationObserver(updateUI);
	const observeFragment = () => {
		const ajaxFiles = select('include-fragment.file-wrap');
		if (ajaxFiles) {
			observer.observe(ajaxFiles.parentNode, {
				childList: true
			});
		}
	};

	await domLoaded;

	updateUI();
	observeFragment();
	document.addEventListener('pjax:end', updateUI); // Update on page change
	document.addEventListener('pjax:end', observeFragment);
}

init();
