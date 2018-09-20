/////////////////////////////////////////////////////////////////////
// Copyright (c) Autodesk, Inc. All rights reserved
// Written by Forge Partner Development
//
// Permission to use, copy, modify, and distribute this software in
// object code form for any purpose and without fee is hereby granted,
// provided that the above copyright notice appears in all copies and
// that both that copyright notice and the limited warranty and
// restricted rights notice below appear in all supporting
// documentation.
//
// AUTODESK PROVIDES THIS PROGRAM "AS IS" AND WITH ALL FAULTS.
// AUTODESK SPECIFICALLY DISCLAIMS ANY IMPLIED WARRANTY OF
// MERCHANTABILITY OR FITNESS FOR A PARTICULAR USE.  AUTODESK, INC.
// DOES NOT WARRANT THAT THE OPERATION OF THE PROGRAM WILL BE
// UNINTERRUPTED OR ERROR FREE.
/////////////////////////////////////////////////////////////////////

$(document).ready(function() {

    var items = ['dXJuOmFkc2sub2JqZWN0czpvcy5vYmplY3Q6dGhlcm1vbmJ1Y2tldC9QUEctUElQSU5HLTAxLmR3Zw']
    appendItems(items);
    
    function appendItems(items) {
        var template = '';
        for (var i = 0; i < items.length; i++) {
            var params = encodeURIComponent(items[i]);
            template += '<div data-index="' + i + '" class="col-sm-6 col-md-4 category">' +
                '<div class="thumbnail">' +
                '<img src="' + location.protocol + '//' + location.host + location.pathname + 'thumbnails/?id=' + params + '" >' +
                '<div class="caption">' +
                '</div>' +
                '</div>' +
                '</div>';
        }
        $('.categories_list').html(template);
        $('.category').click(viewItem);
        $('.loader').hide();
        $('.category').click();
    }

    function viewItem() {
        var index = parseInt($(this).attr('data-index'));
        launchViewer(items[index])
        $('.gallery-container').hide();
        $('.viewer_container').show();
    }
    $('.models_list').click(function(){
        $('.gallery-container').show();
        $('.viewer_container').hide();
    });



    /*
    START - CIRCUIT
    */
    var circuits = [];
    getCurcuits();
    function getCurcuits(){
        $.getJSON("/circuits", function (res) {
            var data = res;
            circuits = data.circuits;
            appendCurcuits(data.circuits);
        });
    }

    function appendCurcuits(items) {
        console.log(items)
        var template = '';
        items.forEach(item => {
            template += '<p>'+item.name+'<p>'; 
        });
        $('.existing_circuits').html(template);
        // $('.category').click(viewItem);
        $('.loader').hide();
    }

    $('.create_circuit').click(function(){
        var CircuitName = $('.circuit_name').val();
        if(CircuitName === ''){
            $('.status_msg').text('Please enter Circuit Name');
        }
        else{
            var NewCircuit = {"name":CircuitName,"items":[]}
            circuits.push(NewCircuit)
            updateCircuit();
        }
    })

    function updateCircuit(){
        $('.status_msg').text('');
        $.ajax({
            type: "POST",
            url: '/updatecircuit',
            data: {"circuits":circuits},
            dataType:'json',
            success: function(){
                $('.status_msg').text('Added successfully.');
                // getItems();
            }

          });        
    }

    $(".circuit_name").focus(function() {this.select();});

    $('.new_circuit').click(function(){
        $(".circuit_name").val('NEW_CIRCUIT').focus(); 
        $('.new_circuit_container').show();       
    })

    $('.create_circuit').click(function(){
        console.log('create_circuit')
    })
    /*
    END - CIRCUIT
    */



});