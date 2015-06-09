(function(){
	'use strict';
		
	$(document).ready(function(){
		
		var markers = {};
		
		var feedbackOpen = "notopen";
		
		var addFeedbackForm = '<form data-closeonsubmit="true" data-ajaxsubmit="true" role="form" action="'+SERVER_ROOT+'/feedback" method="post">' +
		'<div class="form-group">'+
	    '	<label for="feedbackBodyInput">Palaute, kehitysidea tai muu</label>'+
	    '	<textarea name="text" class="form-control" id="feedbackBodyInput"></textarea>'+
	    '</div>'+
		'<div class="form-group">'+
	    '	<input name="author" type="text" class="form-control" id="feedbackNameInput" placeholder="Nimi (vapaaehtoinen)" />'+
	    '</div>'+
	    '<input name="lat" type="hidden" value="{!LAT!}" />' +
	    '<input name="lng" type="hidden" value="{!LNG!}" />' +
		'<button class="btn btn-primary">Tallenna</button>' +
		'</form>';
		
		var showModal = function(content){
			$('#modalContentDiv').html('');
			$('#modalContentDiv').html(content);
			$('#commonModalDiv').modal('show');
		};
		
		var getFormValues = function(e){
			var values = {};
			for(var i = 0; i < e.target.length;i++){
				if($(e.target[i]).attr('name')){
					values[$(e.target[i]).attr('name')] = $(e.target[i]).val();
					$(e.target[i]).val("");
				}
			}
			return values;
		}
		
		var mapClick = function(e){
			var feedbackHtml = addFeedbackForm.replace('{!LAT!}', e.latlng.lat);
			feedbackHtml = feedbackHtml.replace('{!LNG!}', e.latlng.lng);
			showModal(feedbackHtml);
		};
		
		var showMarkerModal = function(marker){
			feedbackOpen = marker._id;
			var clickedMarker = markers[marker._id];
			var markerHtml = '<p class="feedbackItem"><b>Palaute, kehitysidea tai muu:</b><br/>'+clickedMarker.text+
			  '<br/><small>Lisännyt: '+clickedMarker.author+' '+new Date(clickedMarker.created).toLocaleString()+'</small></p><hr/>';
			markerHtml += '<div id="commentContainer">';
			if(clickedMarker.comments.length > 0) {
				for(var i = 0; i < clickedMarker.comments.length;i++) {
					markerHtml += '<p data-commentid="'+clickedMarker.comments[i]._id+'" class="comment">'+clickedMarker.comments[i].text+'<br/><small>Lisätty: '+new Date(clickedMarker.comments[i].added).toLocaleString()+'</small></p>';
				}
			}
			markerHtml += '</div>';
			markerHtml += '';
			markerHtml += '<form data-ajaxsubmit="true" role="form" action="'+SERVER_ROOT+'/comment/'+marker._id+'" method="post">' +
				'<textarea name="text" class="form-control"></textarea><br/>' +
				'<button class="btn btn-default">Kommentoi</button></form>';
			showModal(markerHtml);
		};
		
		var addMarker = function(marker){
			markers[marker._id] = marker;
			var mapMarker = L.marker(marker.coordinates, {bounceOnAdd: true}).addTo(map);
			mapMarker._id = marker._id;
			mapMarker.on('click', function(){showMarkerModal(this)});
		};
		
		var updateMarker = function(marker){
			markers[marker._id] = marker;
			if(feedbackOpen == marker._id){
				var renderedComments = [];
				$('#commentContainer').find('.comment').each(function(){
					renderedComments.push($(this).data('commentid'));
				});
				for(var i = 0; i < marker.comments.length;i++){
					if(renderedComments.indexOf(marker.comments[i]._id) < 0){
						$('#commentContainer').append('<p data-commentid="'+marker.comments[i]._id+'" class="comment">'+marker.comments[i].text+'<br/><small>Lisätty: '+new Date(marker.comments[i].added).toLocaleString()+'</small></p>');
					}
				}
			}
		};
		
		var updateMarkers = function(){
			$.getJSON( SERVER_ROOT+"/feedback", function( feedback ) {
				for(var i = 0; i < feedback.length;i++){
					var marker = feedback[i];
					if(typeof(markers[marker._id]) === 'undefined'){
						addMarker(marker);
					}else{
						updateMarker(marker);
					}
				}
			});
		};
		
        var map = L.map('map', {attributionControl : false}).setView([-32.39852, -59.23828], 3);
        L.tileLayer(SERVER_ROOT+'/tiles/{z}/{x}/{y}.png', {
            minZoom: 2,
            maxZoom: 6,
            tms: true
        }).addTo(map);
        
        $('.infoBtn').click(function(e){
        	e.preventDefault();
        	var infoHtml = '<h4> Osallistu uudistetun Mikkelin kaupunkikeskustan suunnitelman ideointiin!</h4>';
        	infoHtml += '<p>Alla on piirretty City2020 suunnitelmien pohjalta uudistettu kaupunkikeskustan kartta. Haluamme kuulla sinun kommenttisi ideoihin. Olisiko sinulla parannusehdotuksia tai ideoita esittää suunnitelmaan? Klikkaa haluamaasi kohtaa ja kirjoita kommenttisi. Voit myös kommentoida muiden jättämiä kirjoituksia. Karttasovellus on avoinna lokakuun ajan ja toivomme mahdollisimman suurta osallistumista.</p>';
        	infoHtml += '<p><b>Vaikuta sinäkin keskustan uudistamiseen!</b></p>';
        	infoHtml += 'Lisätietoja:';
        	infoHtml += '<address>';
        	infoHtml += '<strong>Tiina Maczulskij</strong><br/>';
        	infoHtml += ' Mikkelin keskustan kehittämisyhdistys ry<br/>';
        	infoHtml += '<abbr title="Puhelin">Puh:</abbr> 040 510 4096<br/>';
        	infoHtml += '<a href="mailto:tiina.maczulskij@mikkelinkeskus.fi">tiina.maczulskij@mikkelinkeskus.fi</a>';
        	infoHtml += '</address>';
        	
        	showModal(infoHtml);
        });
        
        $(document).on('submit', function(e){
        	if($(e.target).data('ajaxsubmit') == true){
        		e.preventDefault();
        		var data = getFormValues(e);
        		var method = $(e.target).attr('method');
        		var action = $(e.target).attr('action');
        		var closeOnSubmit = false;
        		if($(e.target).data('closeonsubmit') == true){
        			closeOnSubmit = true;
        		}
        		$.ajax({
        			type: method.toUpperCase(),
        			url: action,
        			dataType: "json",
        			data: data,
        			success : function(response){
        				updateMarkers();
        				if(closeOnSubmit){
        					$('#commonModalDiv').modal('hide');
        				}
        			}
        		});
        	}
        });
        
        map.on('click', mapClick);
        updateMarkers();
        setInterval(function(){updateMarkers()}, 3000);
        
        $('.infoBtn').popover('show');
        
        $('#commonModalDiv').on('hide.bs.modal', function (e) {
        	feedbackOpen = "notopen";
        });
        
        setTimeout(function(){
        	$('.infoBtn').popover('hide');
        }, 5000);
        
        
	});
})();