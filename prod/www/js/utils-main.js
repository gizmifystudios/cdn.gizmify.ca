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
	const toTopBtn = document.getElementById("backToTop");
	toTopBtn.addEventListener("click", backToTop);
}

function activateScroll() {
	const toTopBtn = document.getElementById("backToTop");
	const downloadBtn = document.getElementById("btn-download-top");
	
	var toTopVisible = false;
	var downloadVisible = false;

	window.onscroll = function() {
		if (document.body.scrollTop > 20 || document.documentElement.scrollTop > 20) {
			if (!toTopVisible) {
				toTopVisible = true;
				toTopBtn.style.display = "block";
			}
		}
		else {
			if (toTopVisible) {
				toTopVisible = false;
				toTopBtn.style.display = "none";
			}
		}
		
		if (downloadBtn) {
			if (document.body.scrollTop > 512 || document.documentElement.scrollTop > 512) {
				if (!downloadVisible) {
					downloadVisible = true;
					downloadBtn.classList.add("visible");
					setTimeout(() => {
						downloadBtn.classList.add("visible-zoomed");
					}, 250);
				}
			}
			else {
				if (downloadVisible) {
					downloadVisible = false;
					downloadBtn.classList.remove("visible-zoomed");
					setTimeout(() => {
						downloadBtn.classList.remove("visible");
					}, 250);
				}
			}
		}
	};

	document.querySelectorAll('a[href^="#"]').forEach(link => {
		link.addEventListener('click', function (e) {
			const targetId = this.getAttribute('href');
			const target = document.querySelector(targetId);

			if (target) {
				e.preventDefault();
				target.scrollIntoView({
					behavior: 'smooth',
					block: 'center'
				});
				history.pushState(null, '', targetId);
			}
		});
	});
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

function displayAlert() {
	const params = new URLSearchParams(window.location.search);
	if (params.get("success") == "1") {
		document.querySelectorAll(".top-alert.alert-success").forEach(topAlert => {
			topAlert.classList.add('show');
		});
	}
	else if (params.get("success") == "0") {
		document.querySelectorAll(".top-alert.alert-danger").forEach(topAlert => {
			topAlert.classList.add('show');
		});
	}
}

// -- Journies -- //

function getUTMObject(utmKeys) {
	const data = {};
	utmKeys.forEach(key => {
		if (params.has(key)) {
			data[key] = params.get(key);
		}
	});
	return data;
}

function activateLastTouch() {
	const params = new URLSearchParams(window.location.search);
	const keys = ['utm_source', 'utm_medium', 'utm_campaign'];
	const utmData = [];
	keys.forEach(key => {
		utmData.push(params.has(key) ? encodeURIComponent(params.get(key)) : '-');
	});
	localStorage.setItem('utmLast', utmData.join('|'));
}

function buildLastTouchQuery() {
	const utmLast = localStorage.getItem('utmLast');
	if (!utmLast) return '';

	const keys = ['utm_source', 'utm_medium', 'utm_campaign'];
	const values = utmLast.split('|');

	const params = new URLSearchParams();
	for (let i = 0; i < keys.length; i++) {
		if (values[i] && values[i] !== '-') {
			params.set(keys[i], decodeURIComponent(values[i]));
		}
	}
	return params.toString();
}

function journeyEvent(event, itemIds, itemNames, prices, callbackFunc = null) {
	if (typeof gtag !== "function") return;

	if (!Array.isArray(itemIds)) itemIds = [itemIds];
	if (!Array.isArray(itemNames)) itemNames = [itemNames];
	if (!Array.isArray(prices)) prices = [prices];

	const items = itemIds.map((id, index) => ({
		item_id: id,
		item_name: itemNames[index] || "Unknown Product",
		item_category: "Software License",
		price: prices[index] || 0,
		quantity: 1
	}));
	const totalValue = prices.reduce((sum, p) => sum + (parseFloat(p) || 0), 0);

	gtag("event", event, {
		currency: "USD",
		value: totalValue,
		items: items,
		event_callback: callbackFunc
	});
}

function journeyProductPage() {
	const chooseBtns = document.querySelectorAll(".btn-choose");
	if (chooseBtns.length <= 0) return;
	
	const itemIds = Array.from(chooseBtns).map(chooseBtn => chooseBtn.dataset.itemId);
	const itemNames = Array.from(chooseBtns).map(chooseBtn => chooseBtn.dataset.itemName);
	const prices = Array.from(chooseBtns).map(chooseBtn => chooseBtn.dataset.price);

	journeyEvent("view_item", itemIds, itemNames, prices);
}

function activateJournies() {
	if (typeof gtag !== "function") return;
	journeyProductPage();

	document.querySelectorAll(".btn-choose").forEach(link => {
		const itemId = link.dataset.itemId;
		const itemName = link.dataset.itemName;
		const price = parseFloat(link.dataset.price);
		const url = link.href + '?' + buildLastTouchQuery();
		
		link.addEventListener("click", function(e) {
			e.preventDefault();

			journeyEvent("add_to_cart", itemId, itemName, price, function() {
				journeyEvent("begin_checkout", itemId, itemName, price, function() {
					window.location.href = url;
				});
			});
			
			setTimeout(function() {
				window.location.href = url;
			}, 5000);
		});
	});
}


function activateUnsubAllButton() {
	const allBox = document.getElementById('all');
	const options = document.querySelectorAll('.sub-feature');

	allBox.addEventListener('change', () => {
		if (allBox.checked) options.forEach(opt => opt.checked = false);
	});

	options.forEach(opt => {
		opt.addEventListener('change', () => {
			if (opt.checked) allBox.checked = false;
		});
	});
}

// -- Video controls -- //

function activateVideoPlayer(streams) {
	const video = document.getElementById('video');
	const player = document.getElementById('player');
	const playPauseBtn = document.getElementById('playPause');
	const seek = document.getElementById('seek');
	const volume = document.getElementById('volume');
	const fullscreenBtn = document.getElementById('fullscreenBtn');
	const overlayPlay = document.getElementById('overlayPlay');
	const speaker = document.getElementById('speaker');
	const settingsBtn = document.getElementById('settingsBtn');
	const settingsMenu = document.getElementById('settingsMenu');
	const resolutionSelect = document.getElementById('resolutionSelect');
	const speedSelect = document.getElementById('speedSelect');

	const iconPlayPause = document.querySelector('#playPause i')
	const iconSpeaker = document.querySelector('#speaker i')
	const iconFullScreen = document.querySelector('#fullscreenBtn i')
	
	let hls;
	let currentResolution = 480;
	let inControl = false;

	function toggleIcon(element, addClass, removeClass) {
		element.classList.remove(removeClass);
		element.classList.add(addClass);
	}

	function togglePlay() {
		if (video.paused) {
			video.play();
		}
		else {
			video.pause();
		}
		inControl = true;
	}

	function selectInitialResolution() {
		const width = window.innerWidth;
		if (width >= 1200) return 1080;
		if (width >= 768) return 720;
		return 480;
	}

	function loadStream(res) {
		currentResolution = res;
		if (hls) {
			hls.destroy();
		}
		if (Hls.isSupported()) {
			hls = new Hls();
			hls.loadSource(streams[res]);
			hls.attachMedia(video);
		}
		else if (video.canPlayType('application/vnd.apple.mpegurl')) {
			video.src = streams[res];
		}
	}

	initRes = selectInitialResolution();
	loadStream(initRes);
	resolutionSelect.value = String(initRes);

	playPauseBtn.onclick = togglePlay;
	overlayPlay.onclick = togglePlay;
	video.onclick = togglePlay;

	video.addEventListener('play', () => {
		toggleIcon(iconPlayPause, 'fa-pause', 'fa-play');
		overlayPlay.classList.add('hidden');
	});

	video.addEventListener('pause', () => {
		toggleIcon(iconPlayPause, 'fa-play', 'fa-pause');
		overlayPlay.classList.remove('hidden');
	});

	video.addEventListener('timeupdate', () => {
		seek.value = (video.currentTime / video.duration) * 100 || 0;
	});

	seek.oninput = () => {
		video.currentTime = (seek.value / 100) * video.duration;
	};

	video.muted = true;
	toggleIcon(iconSpeaker, 'fa-volume-xmark', 'fa-volume-high');
	volume.oninput = () => {
		video.volume = volume.value;
		if (video.volume === 0) {
			video.muted = true;
			toggleIcon(iconSpeaker, 'fa-volume-xmark', 'fa-volume-high');
		}
		else {
			video.muted = false;
			toggleIcon(iconSpeaker, 'fa-volume-high', 'fa-volume-xmark');
		}
	};

	speaker.onclick = () => {
		video.muted = !video.muted;
		if (video.muted) toggleIcon(iconSpeaker, 'fa-volume-xmark', 'fa-volume-high');
		else toggleIcon(iconSpeaker, 'fa-volume-high', 'fa-volume-xmark');
	};

	settingsBtn.onclick = () => {
		settingsMenu.classList.toggle('show');
	};

	resolutionSelect.onchange = e => {
		const res = parseInt(e.target.value);
		const wasPlaying = !video.paused;
		loadStream(res);
		if (wasPlaying) video.play().catch(()=>{});
	};

	speedSelect.onchange = e => {
		video.playbackRate = parseFloat(e.target.value);
	};

	document.addEventListener('click', e => {
		if (!settingsBtn.contains(e.target) && !settingsMenu.contains(e.target)) {
			settingsMenu.classList.remove('show');
		}
	});

	function toggleFullscreen() {
		if (!document.fullscreenElement) {
			player.requestFullscreen?.() || player.webkitRequestFullscreen?.();
			toggleIcon(iconFullScreen, 'fa-compress', 'fa-expand');
		}
		else {
			document.exitFullscreen?.() || document.webkitExitFullscreen?.();
			toggleIcon(iconFullScreen, 'fa-expand', 'fa-compress');
		}
    }

    fullscreenBtn.addEventListener('click', toggleFullscreen);

    player.addEventListener('dblclick', toggleFullscreen);

    document.addEventListener('fullscreenchange', () => {
		if (!document.fullscreenElement) {
			toggleIcon(iconFullScreen, 'fa-expand', 'fa-compress');
		}
    });

	const observer = new IntersectionObserver(
		entries => {
			entries.forEach(entry => {
				if (entry.isIntersecting) {
					if (!inControl) video.play().catch(()=>{});
				}
				else {
					video.pause();
				}
			});
		},
		{ threshold:0.75 }
	);
	observer.observe(player);
}

// -- Analytics -- //

function initAnalytics() {
	if (!window.gaInitialized) {
		window.gaInitialized = true;
		const script = document.createElement('script');
		script.async = true;
		script.src = "https://www.googletagmanager.com/gtag/js?id=G-Q602WFV2DJ";
		document.head.appendChild(script);

		window.dataLayer = window.dataLayer || [];
		function gtag(){dataLayer.push(arguments);}
		window.gtag = gtag;
		gtag('js', new Date());
		gtag('config', 'G-Q602WFV2DJ');
	}
}

function activateAnalytics() {
	const banner = document.getElementById('cookieBanner');
	const consent = localStorage.getItem('cookieConsent');
	
	if (consent === 'agreed') {
		initAnalytics();
		return;
	}
	
	if (consent === 'essential') return;

	let shown = false;
	window.addEventListener('scroll', () => {
		if (!shown && window.scrollY > 600) {
			banner.classList.remove('d-none');
			banner.classList.add('show');
			shown = true;
		}
	});

	document.getElementById('acceptCookies').addEventListener('click', () => {
		localStorage.setItem('cookieConsent', 'agreed');
		banner.classList.remove('show');
		banner.classList.add('d-none');
		initAnalytics();
	});

	document.getElementById('rejectCookies').addEventListener('click', () => {
		localStorage.setItem('cookieConsent', 'essential');
		banner.classList.remove('show');
		banner.classList.add('d-none');
	});
}

function sendHelpful(isHelpful='1') {
	const form = document.getElementById('helpful-form');
	const formData = new FormData(form);

	fetch(form.action+"?yes="+isHelpful, {
		method: 'POST', body: formData
	})
	.then(resp => resp.json())
	.then(data => {
		const helpfulLinks = document.querySelectorAll('.helpful-widget a');
		helpfulLinks.forEach(link => { link.classList.add('d-none'); });
		
		const helpfulText = document.querySelectorAll('.helpful-widget h5');
		helpfulText.forEach(text => { text.textContent = "✅ Thank you for your feedback!"; });
	})
	.catch(error => {});
}

function activateHelpful() {
	const helpfulYes = document.querySelectorAll('.toc-helpful-yes');
	const helpfulNo = document.querySelectorAll('.toc-helpful-no');

	helpfulYes.forEach(btn => {
		btn.addEventListener('click', function (event) {
			event.preventDefault();
			sendHelpful(isHelpful='1');
		});
	});

	helpfulNo.forEach(btn => {
		btn.addEventListener('click', function (event) {
			event.preventDefault();
			sendHelpful(isHelpful='0');
		});
	});
}

function carouselAutoScrollStart(slider, scrollInterval) {
	if (scrollInterval) return scrollInterval;
	return setInterval(() => {
		const cardWidth = slider.querySelector('.testimonial-card').offsetWidth + 24;
		if (slider.scrollLeft + slider.clientWidth >= slider.scrollWidth) {
			slider.scrollTo({ left: 0, behavior: 'smooth' });
		}
		else {
			slider.scrollBy({ left: cardWidth, behavior: 'smooth' });
		}
	}, 10000);
}

function activateCarousel() {
	const slider = document.getElementById('carousel-slider');
	let isDown = false;
	let startX;
	let scrollLeft;
	let scrollInterval = null;

	slider.addEventListener('mousedown', (e) => {
		isDown = true;
		slider.classList.add('active');
		startX = e.pageX - slider.offsetLeft;
		scrollLeft = slider.scrollLeft;
		clearInterval(scrollInterval);
		scrollInterval = null;
	});

	slider.addEventListener('mouseleave', () => {
		isDown = false;
		slider.classList.remove('active');
		scrollInterval = carouselAutoScrollStart(slider, scrollInterval);
	});

	slider.addEventListener('mouseup', () => {
		isDown = false;
		slider.classList.remove('active');
		scrollInterval = carouselAutoScrollStart(slider, scrollInterval);
	});

	slider.addEventListener('mousemove', (e) => {
		if (!isDown) return;
		e.preventDefault();
		const x = e.pageX - slider.offsetLeft;
		const walk = (x - startX) * 1.5;
		slider.scrollLeft = scrollLeft - walk;
	});

	slider.addEventListener('mouseenter', () => {
		clearInterval(scrollInterval);
		scrollInterval = null;
	});

	slider.addEventListener('mouseleave', () => {
		scrollInterval = carouselAutoScrollStart(slider, scrollInterval);
	});

	scrollInterval = carouselAutoScrollStart(slider, scrollInterval);
}

function activatePromo() {
	document.getElementById("promoClose").addEventListener("click", function () {
		document.getElementById("promo-banner").classList.add('d-none');
		document.getElementById("promo-gap").classList.add('d-none');
		document.getElementById("navbar").classList.remove('navbar-with-promo');
	});
}


function activateAll() {
	loadIcons();
	activateTooltips();
	activateBackToTop();
	activateScroll();
	activateAnalytics();
	activateLastTouch();
}