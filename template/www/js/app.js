var $isotopeContainer;
var $galleryContainer;
var $filters;
var filters = {};

var setupIsotope = function() {
	$isotopeContainer.isotope({
		itemSelector: '.item',
		layoutMode: 'masonry'
	});
}

var filterIsotope = function() {
	var $this = $(this);
    var $buttonGroup = $this.parents('.filter-group');
    var filterGroup = $buttonGroup.attr('data-filter-group');
    var thisFilter = $this.attr('data-filter');
    // turn on
    if (!($this.hasClass('active'))) {
         // set filter for group
        filters[ filterGroup ] = thisFilter

        $buttonGroup.find('.filter').removeClass('active')
        $this.addClass('active');
    // turn off
    } else {
        filters[ filterGroup ] = '';
        $this.removeClass('active');
    }

    if (thisFilter === '*' || thisFilter === '.featured') {
        $isotopeContainer.isotope({ filter: thisFilter });
        $filters.removeClass('active');
        $this.addClass('active');
    } else {
        // combine filters
        var filterValue = '';
        for ( var prop in filters ) {
            filterValue += filters[ prop ];
        }
        // set filter for Isotope
        $isotopeContainer.isotope({ filter: filterValue });
    }
}

var initPhotoSwipeFromDOM = function(gallerySelector) {
    var parseThumbnailElements = function($el) {
        var thumbElements = $el.find('figure:visible'),
            numNodes = thumbElements.length,
            items = [],
            figureEl,
            linkEl,
            size,
            item;

        for(var i = 0; i < numNodes; i++) {

            figureEl = thumbElements[i]; // <figure> element
	        // include only element nodes 
	        if(figureEl.nodeType !== 1) {
	            continue;
	        }

	        linkEl = figureEl.children[0]; // <a> element

	        size = linkEl.getAttribute('data-size').split('x');

	        // create slide object
	        item = {
	            src: linkEl.getAttribute('href'),
	            w: parseInt(size[0], 10),
	            h: parseInt(size[1], 10)
	        };

	        if(figureEl.children.length > 1) {
	            // <figcaption> content
	            item.title = figureEl.children[1].innerHTML; 
	        }

	        if(linkEl.children.length > 0) {
	            // <img> thumbnail element, retrieving thumbnail url
	            item.msrc = linkEl.children[0].getAttribute('src');
	        } 

	        item.el = figureEl; // save link to element for getThumbBoundsFn
	        items.push(item);
        }

        return items;
    };

    // find nearest parent element
    var closest = function closest(el, fn) {
        return el && ( fn(el) ? el : closest(el.parentNode, fn) );
    };

    // triggers when user clicks on thumbnail
    var onThumbnailsClick = function(e) {
        e = e || window.event;
        e.preventDefault ? e.preventDefault() : e.returnValue = false;

        var $this = $(this);

        // find root element of slide
        var $clickedListItem = $this.closest('figure');

        if(!$clickedListItem) {
            return;
        }

        // find index of clicked item by looping through all child nodes
        // alternatively, you may define index via data- attribute
        var $clickedGallery = $clickedListItem.parent(),
            childNodes = $clickedListItem.parent().children().not(':hidden'),
            numChildNodes = childNodes.length,
            nodeIndex = 0,
            index;

        for (var i = 0; i < numChildNodes; i++) {
            if(childNodes[i] === $clickedListItem[0]) {
                index = nodeIndex;
                break;
            }
            nodeIndex++;
        }

        if(index >= 0) {
            // open PhotoSwipe if valid index found
            openPhotoSwipe( index, $clickedGallery);
        }
        return false;
    };

    var openPhotoSwipe = function(index, galleryElement, disableAnimation) {
        var pswpElement = $('.pswp')[0],
            gallery,
            options,
            items;

        items = parseThumbnailElements(galleryElement);

        // define options (if needed)
        options = {
            index: index,

            // define gallery index (for URL)
            galleryUID: galleryElement.data('pswp-uid'),

            getThumbBoundsFn: function(index) {
                // See Options -> getThumbBoundsFn section of documentation for more info
                var thumbnail = items[index].el.getElementsByTagName('img')[0], // find thumbnail
                    pageYScroll = window.pageYOffset || document.documentElement.scrollTop,
                    rect = thumbnail.getBoundingClientRect(); 

                return {x:rect.left, y:rect.top + pageYScroll, w:rect.width};
            }

        };

        if(disableAnimation) {
            options.showAnimationDuration = 0;
        }

        // Pass data to PhotoSwipe and initialize it
        gallery = new PhotoSwipe( pswpElement, PhotoSwipeUI_Default, items, options);
        gallery.init();
    };

    // loop through all gallery elements and bind events
    var $galleryElements = $isotopeContainer.find('figure');
    for(var i = 0, l = $galleryElements.length; i < l; i++) {
    	var $this = $galleryElements.eq(i);
    	if ($this.css('display') !== 'none') {
    		$this.attr('data-pswp-uid', i+1);
    		$this.on('click', onThumbnailsClick);
    	}
    }
};

$(document).ready(function() {
	$isotopeContainer = $('.isotope-container').imagesLoaded(function() {
        setupIsotope();
    });
	$galleryContainer = $('.pswp__container');
	$filters = $('.filter');

	$filters.on('click', filterIsotope);
    initPhotoSwipeFromDOM($isotopeContainer);
})