(function(){
	'use strict';
		
	$(document).ready(function(){
		
		var markers = {};
		
		var current_position;
		
		var feedbackOpen = "notopen";
		
		var addFeedbackForm = '<div class="form-group">'+
		  '<label for="feedbackClassInput">Tyyppi</label>'+
		  '<select id="feedbackClassInput" class="form-control">'+
  		  '<option value="Raivauskohde">Raivauskohde</option>'+
  		  '<option value="Siivouskohde">Siivouskohde</option>'+
  		  '<option value="vieraslajitorjunnat">vieraslajitorjunnat</option>'+
  		  '<option value="retkeilyalueen epäkohdat">retkeilyalueen epäkohdat</option>'+
  		  '<option value="other">muu</option>'+
		  '</select>'+
		  '</div>'+  
		  '<div class="form-group">'+
	    '	<label for="feedbackBodyInput">Kuvaus</label>'+
	    '	<textarea name="text" class="form-control" id="feedbackBodyInput"></textarea>'+
	    '</div>'+
	    '<div class="form-group">'+
	    ' <label for="feedbackNameInput">Nimi</label>'+
	    '	<input name="name" type="text" class="form-control" id="feedbackNameInput" placeholder="nimi" />'+
	    '</div>'+
      '<div class="form-group">'+
      ' <label for="feedbackEmailInput">Email</label>'+
      ' <input name="email" type="email" class="form-control" id="feedbackEmailInput" placeholder="sähköposti" />'+
      '</div>'+
      '<div class="form-group">'+
      ' <label for="feedbackPhoneInput">Puhelin</label>'+
      ' <input name="phone" type="text" class="form-control" id="feedbackPhoneInput" placeholder="puhelin" />'+
      '</div>'+
	    '<input id="feedbackLatInput" name="lat" type="hidden" value="{!LAT!}" />' +
	    '<input id="feedbackLngInput" name="lng" type="hidden" value="{!LNG!}" />' +
	    '<div class="form-group">'+
  	    '<form id="image-uploader-form" action="'+SERVER_ROOT+'/image" method="post" >'+
    	    '<input id="current-image-id" type="hidden" name="current_id" value="" />' +
    	    '<label for="image-uploader-input">Kuva</label>'+
          '<input type="file" id="image-uploader-input" name="image" ></input>'+
        '</form>'+
      '</div>'+
	    '<button id="addFeedbackBtn" class="btn btn-primary">Tallenna</button>';
		
		var showModal = function(content){
			$('#modalContentDiv').html('');
			$('#modalContentDiv').html(content);
			$('#commonModalDiv').modal('show');
			if($('#image-uploader-input').length > 0){
			  $('#image-uploader-input').picEdit({
			    maxWidth: 'auto',
			    imageUpdated: function(img){
			     $('#image-uploader-form').submit();
			   },formSubmitted: function(res){
			     var resObject = JSON.parse(res.response);
			     $('#current-image-id').val(resObject._id);
			   }
			  });
			}
			$('#feedbackClassInput').change(function(e){
			  if($(this).val() === 'other'){
			    $(this).parent().after('<div id="feedbackOtherTypeContainer" class="form-group"><input name="type" type="text" class="form-control" id="feedbackOtherTypeInput" placeholder="mikä?" /></div>');
			  }else{
			    $('#feedbackOtherTypeContainer').remove();
			  }
			});
			$('#addFeedbackBtn').click(function(e){
			  var feedbackData = {
			    type: $('#feedbackClassInput').val() === 'other' ? $('#feedbackOtherTypeInput').val : $('#feedbackClassInput').val(),
			    name: $('#feedbackNameInput').val(),
			    email: $('#feedbackEmailInput').val(),
			    phone: $('#feedbackPhoneInput').val(),
			    text: $('#feedbackBodyInput').val(),
			    lat: $('#feedbackLatInput').val(),
			    lng: $('#feedbackLngInput').val(),
			    image_id: $('#current-image-id').val()
			  };
			  $.post(SERVER_ROOT+'/feedback', feedbackData, function(feedback){
			    $('#commonModalDiv').modal('hide');
			    addMarker(feedback);
			  });
			});
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
		
		var getCurrentPosition = function(callback){
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(callback);
      } else {
        alert('Geolocation is not supported by this browser.');
      }
		};
		
    var map = L.map('map', {attributionControl : false}).setView([61.67371, 27.29871], 13);
    L.tileLayer("http://{s}.mqcdn.com/tiles/1.0.0/osm/{z}/{x}/{y}.png", {
      maxZoom: 19,
      subdomains: ["otile1", "otile2", "otile3", "otile4"],
      attribution: 'Tiles courtesy of <a href="http://www.mapquest.com/" target="_blank">MapQuest</a> <img src="http://developer.mapquest.com/content/osm/mq_logo.png">. Map data (c) <a href="http://www.openstreetmap.org/" target="_blank">OpenStreetMap</a> contributors, CC-BY-SA.'
    }).addTo(map);
        
        /*$('.infoBtn').click(function(e){ //TODO: add correct instructions
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
        });*/
        
        $('#new-feedback-btn').click(function(e){
          e.preventDefault();
          if(typeof(current_position) !== 'undefined'){
            var feedbackHtml = addFeedbackForm.replace('{!LAT!}', current_position.coords.latitude);
            feedbackHtml = feedbackHtml.replace('{!LNG!}', current_position.coords.longitude);
            showModal(feedbackHtml);
          }else{
            getCurrentPosition(function(position){
              var feedbackHtml = addFeedbackForm.replace('{!LAT!}', position.coords.latitude);
              feedbackHtml = feedbackHtml.replace('{!LNG!}', position.coords.longitude);
              showModal(feedbackHtml);
            });
          }

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
        //setInterval(function(){updateMarkers()}, 3000);
        getCurrentPosition(function(position){
          map.setView([position.coords.latitude, position.coords.longitude],18);
          current_position = position;
        });
        
        $('.infoBtn').popover('show');
        
        $('#commonModalDiv').on('hide.bs.modal', function (e) {
        	feedbackOpen = "notopen";
        });
        
        setTimeout(function(){
        	$('.infoBtn').popover('hide');
        }, 5000);
        
        
	});
})();