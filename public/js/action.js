
function checkDeleteItem(id){
    console.log("Delete id: "+id);

    var redirect = function(url, method) {
        var form = document.createElement('form');
        form.method = method;
        form.action = url;

        var input = document.createElement('input');
        input.type = 'hidden';
        input.name = "cid";
        input.value = id;
        form.appendChild(input);

        $('body').append(form);
        form.submit();
    };
    
    redirect('/delete-item', 'post');

}

function checkDeleteCategory(id){
    console.log("Delete id: "+id);

    var redirect = function(url, method) {
        var form = document.createElement('form');
        form.method = method;
        form.action = url;

        var input = document.createElement('input');
        input.type = 'hidden';
        input.name = "cid";
        input.value = id;
        form.appendChild(input);

        $('body').append(form);
        form.submit();
    };
    
    redirect('/delete-category', 'post');

}

(function ($) {


    $('#editCat').on('show.bs.modal', function (event) {
        var button = $(event.relatedTarget) // Button that triggered the modal
        var cid = button.data('id');
        var title = button.data('title');
        var desc = button.data('desc');
        var image = button.data('img');

        
        console.log("In delete  CAt: "+ cid+" title: "+title+" desc: "+desc+" img: "+image);
    
        var modal = $(this);

        modal.find('input#ctitle').val(title);
        modal.find('#cdesc').val(desc);
        modal.find('input#cimage').val(image);
        modal.find('input#catid').val(cid);

        modal.find('#edit-btn').click(function() { 
            
            modal.find('form#c-form').submit();
        });
      })

$('#delCat').on('show.bs.modal', function (event) {
    var button = $(event.relatedTarget) // Button that triggered the modal
    var cid = button.data('id') // Extract info from data-* attributes
    
    console.log("In delete  CAt: ", cid);

    var modal = $(this);
    modal.find('#del-btn').click(function() { 
        checkDeleteCategory(cid);
    });
  })

  $('#editItem').on('show.bs.modal', function (event) {
    var button = $(event.relatedTarget) // Button that triggered the modal
    var tid = button.data('id');
    var title = button.data('title');
    var desc = button.data('desc');
    var image = button.data('img');
    var category = button.data('cat');
    var price = button.data('price');

    
    console.log("In delete  CAt: "+ tid+" title: "+title+" desc: "+desc+" img: "+image+" categroy: "+category+" price: "+price);

    var modal = $(this);

    modal.find('input#ititle').val(title);
    modal.find('#idesc').val(desc);
    modal.find('input#image').val(image);
    modal.find('input#icat').val(category);
    modal.find('#iprice').val(price);
    modal.find('input#tid').val(tid);

    modal.find('#edit-btn').click(function() { 
        
        modal.find('form#i-form').submit();
    });
  })


  $('#delItem').on('show.bs.modal', function (event) {
    var button = $(event.relatedTarget) // Button that triggered the modal
    var cid = button.data('id') // Extract info from data-* attributes
    
    console.log("In delete  Item: ", cid);

    var modal = $(this);
    modal.find('#del-item-btn').click(function() { 
        checkDeleteItem(cid);
    });
  })

})(jQuery);