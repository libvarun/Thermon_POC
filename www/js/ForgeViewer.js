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

var viewerApp, jsonName, URN;
function launchViewer(urn,name) {
    URN = urn;
    jsonName = name;
    var options = {
        env: 'AutodeskProduction',
        getAccessToken: getForgeToken
    };
    var documentId = 'urn:' + urn;
    Autodesk.Viewing.Initializer(options, function onInitialized() {
        viewerApp = new Autodesk.Viewing.ViewingApplication('forgeViewer');
        viewerApp.registerViewer(viewerApp.k3D, Autodesk.Viewing.Private.GuiViewer3D);
        viewerApp.loadDocument(documentId, onDocumentLoadSuccess, onDocumentLoadFailure);
    });
}
// viewerApp.getCurrentViewer().addEventListener(Autodesk.Viewing.SELECTION_CHANGED_EVENT, onSelectionChanged)

// function onSelectionChanged(event) {
//     // Let's only control selection in case of
//     // single user selection
//     console.log(event.dbIdArray)
//     if (event.dbIdArray.length === 1) {
//         oViewer.getProperties(event.dbIdArray[0], function(data) {
//             console.log(data.name)
//             // if (data.name.startsWith("Solid")) {
//             //     var instanceTree = oViewer.model.getData().instanceTree;
//             //     var parentId = instanceTree.getNodeParentId(event.dbIdArray[0])
//             //     oViewer.select([parentId]);
//             // }
//         })
//     }
// }

function onDocumentLoadSuccess(doc) {
    // We could still make use of Document.getSubItemsWithProperties()
    // However, when using a ViewingApplication, we have access to the **bubble** attribute,
    // which references the root node of a graph that wraps each object from the Manifest JSON.
    var viewables = viewerApp.bubble.search({ 'type': 'geometry', 'role':'3d'  });
    if (viewables.length === 0) {
        console.error('Document contains no viewables.');
        return;
    }
    // Choose any of the avialble viewables
    viewerApp.selectItem(viewables[0].data, onItemLoadSuccess, onItemLoadFail);
}

function onDocumentLoadFailure(viewerErrorCode) {
    console.error('onDocumentLoadFailure() - errorCode:' + viewerErrorCode);
}

function onItemLoadSuccess(viewer, item) {
    // item loaded, any custom action?
 /*
    START - CIRCUIT
    */
   
function getLineNumberTag(properties){
    for (let i = 0; i < properties.length; i++) {
        const element = properties[i];
        if(properties[i].attributeName === 'LineNumberTag'){
            return properties[i].displayValue;
        }
    }
}
$('.auto_track').on('change',function(){
    if(this.checked) {
        viewer.addEventListener(Autodesk.Viewing.SELECTION_CHANGED_EVENT, onSelectionChanged)
    }else{
        viewer.removeEventListener(Autodesk.Viewing.SELECTION_CHANGED_EVENT, onSelectionChanged)
     }
})
   function onSelectionChanged(dbids){
       console.log(dbids.dbIdArray)
       viewer.getProperties(dbids.dbIdArray[0], (result) => {
        console.log('result:');
        console.log(result);
        var properties = result.properties;
        var LineNumberTag = getLineNumberTag(properties);
        viewer.model.search(LineNumberTag,searchCallback,errorCallback,['LineNumberTag'])
      }, (err) => {
        console.log('err');
        console.log(err);
      });
   }
   $('.loader').hide();
   var InstanceTree;
   var searchCallback = function(results){
       console.log('searchCallback');
       console.log(results);
       viewer.select(results)
   } 
   var errorCallback = function(error){
       console.log('errorCallback');
       console.log(error);
   } 
   setTimeout(() => {       
       InstanceTree = viewer.model.getData().instanceTree;
       if(URN === 'dXJuOmFkc2sub2JqZWN0czpvcy5vYmplY3Q6dGhlcm1vbmJ1Y2tldC9SMV9NZWNoLmRnbi5pLmRnbg'){
            console.log('hide [3, 73, 74, 75, 21547]')
            viewer.hide([3, 73, 74, 75, 21547]);
        }
    }, 4000);
   var circuits = [];
   $('.circuits_tab').click(function(){
    getCurcuits();
   })
   function getCurcuits(){
       var url = '/circuits/?name=' + jsonName ;
       $.getJSON(url, function (res) {
           var data = res;
           circuits = data.circuits;
           appendCurcuits(data.circuits);
       });
   }

   function appendCurcuits(items) {
       console.log(items)
       var template = '';
       items.forEach(item => {
           template += '<p class="ckt">'+item.name+'<p>'; 
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
           $('.ckt_cnf,.add_objects').show();           
       }
   })

   function updateCircuit(){
       $('.status_msg').text('');
       $.ajax({
           type: "POST",
           url: '/updatecircuit/?name='+jsonName,
           data: {"circuits":circuits},
           dataType:'json',
           success: function(){
               $('.status_msg').text('Added successfully.');
               // getItems();
               $('.ckt_cnf,.add_objects').show();
           }

         });        
   }

   $(".circuit_name").focus(function() {this.select();});

   $('.add_objects').click(function(){
       var dbids = viewer.getSelection();
       var CircuitName = $('.circuit_name').val();
       var items = [];
       for (let i = 0; i < dbids.length; i++) {
           var name = InstanceTree.getNodeName(dbids[i]);
           console.log(name);
           items.push({'name':name,'dbid':dbids[i]})
       }
       var NewCircuit = {"name":CircuitName,"items":items}
       circuits.push(NewCircuit)
       updateCircuit();     
   })
   var selected_dbids,selected_ckt;
   $('.existing_circuits').delegate('.ckt','click',function(){
       $('.ckt').removeClass('selected')
       $('.ckt_item').removeClass('selected_item')
       $(this).addClass('selected')
       $('.edit_buttons').css('visibility','visible');
       selected_ckt = $(this).text();
       console.log(selected_ckt)    
       selected_dbids = getdbids(selected_ckt)
       console.log(selected_dbids)   
       var parseddbids = parsedbidArray(selected_dbids)
       viewer.select(parseddbids);
       setTotalLength(parseddbids)
    })
    var ckt_properties;
    function setTotalLength(dbIds){
        viewer.model.getBulkProperties(dbIds, ['Length','NominalDiameter'],
        function(elements){
            ckt_properties = elements;  
            console.log(elements)
          var totalLength = 0;
          for(var i=0; i<elements.length; i++){
            totalLength += parseFloat(elements[i].properties[1].displayValue);
          }
          $('.circuit_length').text(totalLength + ' ft');
        })
     }
   $('.existing_circuits').delegate('.ckt_item','click',function(){
       $('.ckt').removeClass('selected');
       $('.ckt_item').removeClass('selected_item');
       $(this).addClass('selected_item');
       var dbid = parseInt( $(this).attr('data-dbid') );
       viewer.select(dbid);
    })

    $('.expand_ckt').click(function(){
        var ckt = getCircuitByName(selected_ckt);
        var template = '<ol>';
        for (let i = 0; i < ckt.length; i++) {
            var properties = ckt_properties[i].properties;
            var element = '<li data-dbid="'+ckt[i].dbid+'" class="ckt_item">' + ckt[i].name +', Length: '+properties[1].displayValue+'ft, Diameter: '+properties[0].displayValue+'ft</li>';
            template += element;
        }
        $('.selected').after(template);
    })

    $('.delete_ckt').click(function(){
        if ($('.existing_circuits').find('.selected').length === 1) {
            $('.loader').show();
            var ckt_name = $('.existing_circuits').find('.selected').text();
            for (let i = 0; i < circuits.length; i++) {
                if(ckt_name === circuits[i].name){
                    circuits.splice(i, 1);
                    $.ajax({
                        type: "POST",
                        url: '/updatecircuit/?name='+jsonName,
                        data: {"circuits":circuits},
                        dataType:'json',
                        success: function(){
                            appendCurcuits(circuits);
                            $('.loader').hide();
                        }
            
                    });
                    console.log('delete')
                }
                
            }            
        } else if ($('.existing_circuits').find('.selected_item').length === 1){
            var circuit_name = $('.existing_circuits').find('.selected_item').parent().prev('.ckt').text();
            var obj_name = $('.existing_circuits').find('.selected_item').text()
            for (let i = 0; i < circuits.length; i++) {
                if(circuit_name === circuits[i].name){
                    var objs = circuits[i].items;
                    for (let j = 0; j < objs.length; j++) {
                        if (obj_name === objs[j].name) {
                            circuits[i].items.splice(j, 1);
                            $.ajax({
                                type: "POST",
                                url: '/updatecircuit/?name='+jsonName,
                                data: {"circuits":circuits},
                                dataType:'json',
                                success: function(){
                                    appendCurcuits(circuits);
                                    $('.loader').hide();
                                    viewer.clearSelection();
                                }
                    
                            });
                        }
                    }
                }
                
            }
        }
    })

    $('.add_ckt').click(function(){
        $('.add_objs').css('visibility','visible');
        viewer.clearSelection();
    })

    $('.eadd_objects').click(function(){
        $('.loader').show();
        var ckt_name = $('.existing_circuits').find('.selected').text();
        console.log(ckt_name)
        var dbids = viewer.getSelection();        
        for (let j = 0; j < circuits.length; j++) {
            if (ckt_name === circuits[j].name) {
                for (let i = 0; i < dbids.length; i++) {
                    var name = InstanceTree.getNodeName(dbids[i]);
                    console.log(name);
                    circuits[j].items.push({'name':name,'dbid':dbids[i]})
                 }
                $.ajax({
                    type: "POST",
                    url: '/updatecircuit/?name='+jsonName,
                    data: {"circuits":circuits},
                    dataType:'json',
                    success: function(){
                        appendCurcuits(circuits);
                        $('.loader').hide();
                        viewer.clearSelection();
                    }
        
                });
                break;
            }
            
        }
    })

   function parsedbidArray(dbids){
       var newarr = []
       for (let i = 0; i < dbids.length; i++) {
           newarr[i] = parseInt(dbids[i])            
       }
       return newarr;
   }
   function getdbids(cktname){
       for(var i=0;i<circuits.length;i++){
           if(cktname === circuits[i].name){
               var items = circuits[i].items;
               var dbids = [];
               for (let j = 0; j < items.length; j++) {
                   var item = items[j];
                   dbids.push(item.dbid);
               }
               return dbids;
           }
       }
   }
   function getCircuitByName(name){
        for(var i=0;i<circuits.length;i++){
           if(name === circuits[i].name){               
               return circuits[i].items;
           }
       }
   }
   $('.new_circuit').click(function(){
       $(".circuit_name").val('NEW_CIRCUIT').focus(); 
       $('.new_circuit_container').show();       
   })


   /*
   END - CIRCUIT
   */    
}

function onItemLoadFail(errorCode) {
    console.error('onItemLoadFail() - errorCode:' + errorCode);
}

function getForgeToken(callback) {
    jQuery.ajax({
      url: '/api/forge/oauth/token',
      success: function (res) {
        callback(res.access_token, res.expires_in)
      }
    });
  }