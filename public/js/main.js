//Delete confirmation message
$(".btn#delete-button").click(function(){
    if(!confirm("Are you sure you want to delete this?")){
        return false;
    }
});

//Classic CK Editor
ClassicEditor
.create( document.querySelector( '#ta') )
.catch( error => {
    console.error( error );
} );


