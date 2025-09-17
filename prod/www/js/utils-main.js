function loadIcons() {
	$.ajax({
		type: "GET",
		url: "https://cdn.gizmify.ca/prod/www/img/gs-icons.svg",
		dataType: "text",
		success: function(data) {
			$("body").append("<div hidden>"+data+"</div>");
		}
	});
}

function activateTooltips() {
	var tooltipTriggerList = [].slice.call(
		document.querySelectorAll('[data-bs-toggle="tooltip"]')
	);
	var tooltipList = tooltipTriggerList.map(function(tooltipTriggerEl) {
  		return new bootstrap.Tooltip(tooltipTriggerEl)
	});
}

function backToTop() {
	document.body.scrollTop = 0;
	document.documentElement.scrollTop = 0;
}

function activateBackToTop() {
	let toTopBtn = document.getElementById("backToTop");
	toTopBtn.addEventListener("click", backToTop);
}

function activateScroll() {
	let toTopBtn = document.getElementById("backToTop");
	let downloadBtn = document.getElementById("btn-download-top");
	
	window.onscroll = function() {
		if (document.body.scrollTop > 20 || document.documentElement.scrollTop > 20) {
			toTopBtn.style.display = "block";
		}
		else {
			toTopBtn.style.display = "none";
		}
		
		if (document.body.scrollTop > 512 || document.documentElement.scrollTop > 512) {
			downloadBtn.classList.add("visible");
			setTimeout(() => {
				downloadBtn.classList.remove("visible");
				downloadBtn.classList.add("visible-zoomed");
			}, 250);
		}
		else {
			downloadBtn.classList.add("visible");
			setTimeout(() => {
				downloadBtn.classList.remove("visible-zoomed");
				downloadBtn.classList.remove("visible");
			}, 250);
		}
	};
}

function _setTOCSection(target) {
	document.querySelectorAll('.content-section').forEach(sec => sec.classList.add('d-none'));

	const section = document.querySelector(target);
	if (section) section.classList.remove('d-none');

	document.querySelectorAll('#toc a').forEach(nav => nav.classList.remove('active'));
	const navLink = document.querySelector(`#toc a[href="${target}"]`);
	if (navLink) navLink.classList.add('active');

	const tocCollapse = document.querySelector('#tocCollapse');
	if (tocCollapse && bootstrap.Collapse.getInstance(tocCollapse)) {
		bootstrap.Collapse.getInstance(tocCollapse).hide();
	}
}

function activateTableOfContents() {
	document.querySelectorAll('#toc a, .toc-btn, .link-toc').forEach(link => {
		link.addEventListener('click', function(e) {
			const target = this.getAttribute('href');
			if (target && target.startsWith('#')) {
				e.preventDefault();
				_setTOCSection(target);
				backToTop();
				history.pushState(null, "", target);
			}
		});
	});

	const target = window.location.hash;
	if (target) _setTOCSection(target);
}

function activateFeatureVideos() {
	document.querySelectorAll('.feature-video').forEach(container => {
		const video = container.querySelector('video');

		container.addEventListener('mouseenter', () => {
			video.currentTime = 0;
			video.play();
		});

		container.addEventListener('mouseleave', () => {
			video.pause();
			video.currentTime = 0;
		});
    });
}

function activateAll() {
	loadIcons();
	activateTooltips();
	activateBackToTop();
	activateScroll();
}