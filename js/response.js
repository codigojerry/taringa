/*
  @Autor: Jerry Ramone (https://codigojerry.blogspot.com/)
  @Version: 1.0
  @Web: https://github.com/jerrycode/taringa
*/

var taringa=function(url, cfunc, div) {
  var xhttp;
  xhttp=new XMLHttpRequest();
  xhttp.onreadystatechange = function() {
    if (xhttp.readyState == 4 && xhttp.status == 200) {
      cfunc(xhttp,div);
    }else if(xhttp.status == 404){
      document.getElementById('post').innerHTML='<b>404 Not Found</b>';
      return;
    }
  };
  xhttp.open("GET", url, true);
  xhttp.send();
}

var traer_post=function(xhttp,div){

  document.getElementById('post').innerHTML="Cargando listado de post...";
  var r=JSON.parse(xhttp.responseText);

    var cad='';
    var re_url='http://api.taringa.net/post/view/';//link para ver los post individualmente
    for (var i = 0 ; i < r.length; i++) {
        cad=cad+"<div><img width='30px' height='30px' src='"+r[i].images[0].url+"' /> <span style='color:gray;'>"+r[i].category_name+"</span> | <span class='titulo' onclick='taringa(\""+re_url+r[i].id+"\",abrir_post,\"post\")'>"+r[i].title+"</span> <span class='owner' onclick='taringa(\"http://api.taringa.net/user/nick/view/"+r[i].owner.nick+"\",traer_user,\"post\")'>@"+r[i].owner.nick+"</span></div>";
    };

    document.getElementById(div).innerHTML='<div id="contenedor">'+cad+'</div>';
}


var abrir_post=function(xhttp,div){

  document.getElementById(div).innerHTML="Cargando post...";

  //obtengo los datos del post abierto
  var r=JSON.parse(xhttp.responseText);

  var cad='';

  cad='<div style="color:blue;"><h2>'+r.title+'</h2></div>';
  cad=cad+'<div style="color:gray;"><small><b>Fecha de creación:</b> '+r.created+' <b>Autor:</b> '+r.owner.nick+'</small></div>';
  cad=cad+'<div style="background-color:white;">'+r.body+'</div><br />';

  cad=cad+"<b><span class='tags'>Tags</span></b>: ";
  for (var i = 0 ; i < r.tags.length; i++) {
      cad=cad+'<span class="tags">'+r.tags[i]+"</span> | ";
  };     

  cad=cad+"<br><b><span class='tags'>Fuente</span></b>: ";
  for (var i = 0 ; i < r.sources.length; i++) {
      cad=cad+'<span class="tags"><a target="_blank" title="'+r.sources[i].description+'" href="'+r.sources[i].url+'">'+r.sources[i].title+"</a></span> | ";
  };

  cad=cad+'<br /><small style="color:gray;"><b>Categoria:</b> '+r.category_name+' <b>Puntos:</b> '+r.score+' <b>Favoritos:</b> '+r.favorites+' <b>Visitas:</b> '+r.visits+' <b>Comentarios:</b> '+r.comments+'</small><br><small><a target="_blank" href="'+r.canonical+'">Ver en Taringa!</a></small><hr><button onclick="traer_com('+r.id+','+r.comments+',1)">Refrescar comentarios</button><h4>Comentarios</h4><div style="width:100%;background-color:white;float:left;" id="comentarios"></div>';
  document.getElementById(div).innerHTML=cad;//finalmente inserto post y sus comentarios en el div          
  
  //OK: 200
  //doy un retardo para que el div comentarios se cree primero.
  setTimeout(function(){
    traer_com(r.id,r.comments,1);
  },3000);
      
}

//trae los comentarios padre e hijo de un post
var traer_com=function(id_post,num_com,page){

  if(num_com!=0){

    document.getElementById('comentarios').innerHTML='Cargando comentarios...';

     var num_pag=Math.round(num_com/50);

      taringa("http://api.taringa.net/post/comment/view?object_id="+id_post+"&page="+page,function(xhttp,div){
        var r2=JSON.parse(xhttp.responseText);

        var conta=0,com='';
        var myfor=setInterval(function(){      
          if(conta<r2.length){
            //comentario_padre
            com=com+"<div style='font-size:13px;'><div><img src='"+r2[conta].owner.avatar.tiny+"' /><b><span style='cursor:pointer;color:blue;' onclick='taringa(\"http://api.taringa.net/user/nick/view/"+r2[conta].owner.nick+"\",traer_user,\"post\")'>"+r2[conta].owner.nick+":</span></b> <span style='color:green;'>+"+r2[conta].likes+"</span> <span style='color:red;''>-"+r2[conta].unlikes+"</span></div> <div>"+r2[conta].body+"</div></div><br>";
            
            //obtiene el reply de comentarios (los muestra al reves, hay un error en la api)
            taringa('http://api.taringa.net/post/comment/replies/view?comment_id='+r2[conta].id,function(xhttp,div){
              var r3=JSON.parse(xhttp.responseText); 

                for (var j=0; j<r3.length; j++) {        
                  com=com+'<div style="width:100%;background-color:white;margin-left:30px;color:gray;font-size:13px;"><div><img src="'+r3[j].owner.avatar.tiny+'" /><b><span style="cursor:pointer;color:#005dab;" onclick="taringa(\'http://api.taringa.net/user/nick/view/'+r3[j].owner.nick+'\',traer_user,\'post\')">'+r3[j].owner.nick+'</span></b>: <span style="color:green;">+'+r3[j].likes+'</span> <span style="color:red;">-'+r3[j].unlikes+'</span></div> <div>'+r3[j].body+'</div></div><br>';
                } 

                var text_page='';//muestra las páginas
                for (var k = 1; k <= num_pag; k++) {
                  text_page+='<span style="cursor:pointer;color:blue;" onclick="traer_com('+id_post+','+num_com+','+k+')"><u>Página '+k+'</u></span> | ';
                };
                document.getElementById(div).innerHTML='<small>Página '+page+'</small><br><br>'+com+' <br> '+text_page+'<p><a href="#">Ir al cielo</a></p>';//finalmente inserto post y sus comentarios en el div          

            },'comentarios');

          }else{
            clearInterval(myfor);
            console.log('Detenido en la iteracion: '+conta);
          }
          conta++;            
        },1000);  
        
      },'comentarios');  

  }else{
    document.getElementById('comentarios').innerHTML='No hay comentarios';
  }

}

var cerrar_select=function(tipo){
  switch(tipo){
    case 'populares':
      document.getElementById('div_select_tiempo').style.display='none';
    break;
    case 'destacados':
      document.getElementById('div_sel_int_shout').style.display='none';
    break;    
  } 
  
}

var mostrar_intervalo=function(tipo){

  if(tipo=='shouts_destacados'){
    document.getElementById('div_sel_int_shout').style.display='inline';
    document.getElementById('div_select_tiempo').style.display='none';//si esta abierto lo oculto
  }else{
    document.getElementById('div_select_tiempo').style.display='inline';  
    document.getElementById('div_sel_int_shout').style.display='none';//si esta abierto lo oculto
  }
  
  document.getElementById('post').innerHTML='&nbsp;';//borro lo que tenga post

  switch(tipo){
    case 'post_populares':
      document.getElementById('select_intervalo').setAttribute('onchange','obtener_datos("post_populares")');
    break;
    case 'shouts_populares':
      document.getElementById('select_intervalo').setAttribute('onchange','obtener_datos("shouts_populares")');
    break;
  }
  
}

var obtener_datos=function(tipo){
    var post=document.getElementById('post');
    var intervalo='';
    if(tipo=='shouts_destacados'){//capturo el valor del select
      intervalo=document.getElementById('sel_interval_shout_dest').value;
    }else{ intervalo=document.getElementById('select_intervalo').value; } 

    switch(tipo){
    case 'post_populares':
      if(intervalo!=''){
        post.innerHTML='Cargando....';
        taringa('http://api.taringa.net/post/populars/view/'+intervalo+'?count=50',traer_post,'post');
      }else{ alert('Seleccione un valor'); post.innerHTML='Selecciona un valor';}
      
    break;

    case 'shouts_populares':
      if(intervalo!=''){
        post.innerHTML='Cargando....';
        taringa('http://api.taringa.net/shout/populars/view/'+intervalo+'?count=50&sort_by=positive',traer_shout,'post');
      }else{ alert('Seleccione un valor'); post.innerHTML='Selecciona un valor'; }
    break;

    case 'shouts_destacados':
      if(intervalo!=''){
        post.innerHTML='Cargando....';
        taringa('http://api.taringa.net/shout/trends/view/'+intervalo+'?count=50',traer_shout,'post')
      }else{ alert('Seleccione un valor'); post.innerHTML='Selecciona un valor'; }
    break;    

  }
}

var traer_user=function(xhttp,div){  
  //obtiene los datos del usuario
    document.getElementById(div).innerHTML="Cargando usuario...";

    var r=JSON.parse(xhttp.responseText);

    var cad='',flag='',img_ini='<img src="http://o1.t26.net/images/flags/',img_end='.png" />';

    switch(r.country){ //codigo para las banderitas
      case 'AR': flag=img_ini+'ar'+img_end; break;  
      case 'CH': flag=img_ini+'ch'+img_end; break;
      case 'CO': flag=img_ini+'co'+img_end; break;
      case 'MX': flag=img_ini+'mx'+img_end; break;
      case 'UY': flag=img_ini+'uy'+img_end; break; 
      case 'VE': flag=img_ini+'ve'+img_end; break;
      case 'PE': flag=img_ini+'pe'+img_end; break;
      default: flag=r.country;                       

    }

    var genero=(r.gender=='m')? 'Masculino ♂' : '<span style="color:red;">Feminazi ♀ 卍</span>' ;

    cad=cad+'<div style="text-align:center;"><small><a target="_blank" href="http://api.taringa.net/user/go/'+r.id+'">Ir al perfil en T!</a></small></div>';
    cad=cad+'<div style="text-align:center;color:#005dab;"><h3>'+r.nick+'</h3></div>';
    cad=cad+'<div class="marco"><img src="'+r.avatar.big+'" /></div>';
    cad=cad+'<div><b>Usuario desde:</b> '+r.created+'</div>';
    cad=cad+'<div><b>Nombre</b> '+r.name+' '+r.last_name+'</div>';
    cad=cad+'<div><b>Género:</b> '+genero+'</div>';
    cad=cad+'<div><b>Cumpleaños:</b> '+r.birthday+'</div>';
    cad=cad+'<div><b>Nacionalidad:</b> '+flag+'</div>';
    cad=cad+'<div><b>Descripcion:</b> '+r.message+'</div>';
    cad=cad+'<div><b>Rango:</b> '+r.range.name+'</div>';

    //obtiene las estadisticas del usuario
    taringa("http://api.taringa.net/user/stats/view/"+r.id,function(xhttp){
      var r2=JSON.parse(xhttp.responseText);

      var est='';  
      est=est+'<table border="1"><caption>Estadisticas</caption>';
      est=est+'<tr style="color:#005dab;"><th>Siguiendo</th><th>Seguidores</th><th>Puntos</th><th>Shouts</th><th>Post</th><th>Temas</th><th>Comentarios</th><th>Medallas</th></tr>';
      est=est+'<tr><td>'+r2.followings+'</td><td>'+r2.followers+'</td><td>'+r2.points+'</td><td><span style="color:blue;cursor:pointer;" onclick="taringa(\'http://api.taringa.net/shout/user/view/'+r.id+'?count=50\',traer_shout,\'post\')"><u>'+r2.shouts+'</u></span></td><td>'+r2.posts+'</td><td>'+r2.threads+'</td><td>'+r2.comments+'</td><td>'+r2.medals+'</td</tr>';
      est=est+'</table><h4>Seguidores</h4>';
      est=est+'<div id="div_seguidores"></div>';        

      document.getElementById(div).innerHTML=cad+' '+est;//finalmente inserto post y sus comentarios en el div

      setTimeout(function(){
        traer_followers(r2.followers,r.id,1);
      },1000);
      
    });     
  
}


//trae los seguidores del usuario 
var traer_followers=function(num_foll,id_user,pag){

  if(num_foll!=0){

    document.getElementById('div_seguidores').innerHTML='Cargando seguidores...';

     var num_pag=Math.round(num_foll/50);//redondea cuando la decima es >=5  2.5=3

      //followers del usuario
      taringa("http://api.taringa.net/user/followers/view/"+id_user+"?count=50&page="+pag,function(xhttp){
        var resp=JSON.parse(xhttp.responseText);
        var fol='<p><small>Página '+pag+'</small></p>';
        for (var i = 0; i < resp.length; i++) {
          fol=fol+'<img src="'+resp[i].avatar.tiny+'" /><span style="cursor:pointer;" onclick="taringa(\'http://api.taringa.net/user/nick/view/'+resp[i].nick+'\',traer_user,\'post\')">'+resp[i].nick+'</span> | ';
        };

        var text_pag='';
        for(var j=1;j<=num_pag;j++){
          text_pag=text_pag+'<span style="cursor:pointer;color:blue;" onclick="traer_followers('+num_foll+','+id_user+','+j+')"><u>Pag. '+j+'</u></span> | ';
        }

        document.getElementById('div_seguidores').innerHTML=fol+' <br> '+text_pag;

      });

  }else{
    document.getElementById('div_seguidores').innerHTML='No tiene seguidores ):';
  }

}

//trae shouts nuevos cada 30 segundos
var st2=setInterval(function(){
  taringa('http://api.taringa.net/shout/public/view?count=50',traer_shout,'shout');
},30000);

var traer_shout=function(xhttp,div){

      var r=JSON.parse(xhttp.responseText);

        var cad='';
        for (var i = 0 ; i < r.length; i++) {
            cad=cad+"<div><img src='"+r[i].owner.avatar.small+"' /> <b><span style='cursor:pointer;' onclick='taringa(\"http://api.taringa.net/user/nick/view/"+r[i].owner.nick+"\",traer_user,\"post\")'>"+r[i].owner.nick+"</span></b> <small><span style='color:gray;'>"+r[i].created+"</span></small></div>";

            if (r[i].attachment!=null) {
              switch(r[i].attachment.type){
                case 'image':
                  cad=cad+'<img width="50%" height="50%" src="'+r[i].attachment.url+'" />';
                break;

                case 'link':
                  cad=cad+'<div>'+r[i].attachment.title+'<div>';
                  cad=cad+'<img width="25%" height="25%" src="'+r[i].attachment.thumbnail+'" />';
                  cad=cad+'<div><b>Autor:</b> '+r[i].attachment.post_author_username+'</div>';
                break;

                case 'video':
                  cad=cad+'<embed   width="420" height="345" src="'+r[i].attachment.url+'"></embed  >';
                break;

              }
            };

            cad=cad+"<div>"+r[i].body+"</div>";
            cad=cad+"<div><img src='http://www.theitprofile.com/wp-content/themes/newszine/images/comment.png'> "+r[i].replies+" <img src='http://iconshow.me/media/images/Mixed/line-icon/png/20/like-20.png' /> "+r[i].likes+" <img src='http://dolody.com/wp-content/themes/ytopica/images/icons/favorite.png' /> "+r[i].favorites+" <img src='http://www.hedgethink.com/wp-content/themes/hedgethink/images/tw_retweet.png' /> "+r[i].forwards+"</div>";
            cad=cad+'<small><a target="_blank" href="http://api.taringa.net/shout/go/'+r[i].id+'">Ir al shout en T!</a></small><hr>';
        };

        document.getElementById(div).innerHTML=cad;
}

taringa('http://api.taringa.net/shout/public/view?count=50',traer_shout,'shout');//apenas carga la pagina ejcuto la function para ver los shouts


var traer_hashtag=function(xhttp,div){

  var r=JSON.parse(xhttp.responseText);
  var cad='<b>Tendencia: </b>';
  for (var i=0; i < r.length; i++) {
    cad=cad+'<span class="hashtag"><a target="_blank" href="http://www.taringa.net/mi/pin/'+encodeURIComponent(r[i])+'">'+r[i]+'</a></span> | ';
  };

  document.getElementById(div).innerHTML=cad;  
}

taringa("http://api.taringa.net/shout/hashtags/view",traer_hashtag,'tendencia');

var st3=setInterval(function(){
  taringa("http://api.taringa.net/shout/hashtags/view",traer_hashtag,'tendencia');
},60000);


//taringa('http://api.taringa.net/shout/trends/view/1h',traer_shout,'shout_destacados')
//taringa('http://api.taringa.net/shout/populars/view/today',traer_shout,'shout_populares')


//trae post con la busqueda realizada
var buscar_post=function(xhttp,div){

  document.getElementById(div).innerHTML="Cargando resultados...";

  var r=JSON.parse(xhttp.responseText);

  if(r.count!=0){
    var cad='<div style="text-align:center;margin:10px;">Resultados para: <b>'+document.getElementById('q').value+'</b></div>';
    var re_url='http://api.taringa.net/post/view/';//link para ver los post individualmente
    for (var i = 0; i < r.result.length; i++) {
      cad=cad+"<div id='id_"+r.result[i].id+"'><span>"+r.result[i].id+"</span> | <span class='titulo' onclick='taringa(\""+re_url+r.result[i].id+"\",abrir_post,\"post\")'>"+r.result[i].title+"</span> | <span class='owner' onclick='taringa(\"http://api.taringa.net/user/nick/view/"+r.result[i].owner.nick+"\",traer_user,\"post\")'>"+r.result[i].owner.nick+"</span></div>";
    };

  }else{ cad='0 resultados'; }
  
  document.getElementById(div).innerHTML=cad;
 
}

var buscar_shout=function(xhttp,div){

  document.getElementById(div).innerHTML="Cargando resultados...";

  var r=JSON.parse(xhttp.responseText);

  if(r.count!=0){

        var cad='';
        for (var i = 0 ; i < r.result.length; i++) {
            cad=cad+"<div><img src='"+r.result[i].owner.avatar.small+"' /> <b><span style='cursor:pointer;' onclick='taringa(\"http://api.taringa.net/user/nick/view/"+r.result[i].owner.nick+"\",traer_user,\"post\")'>"+r.result[i].owner.nick+"</span></b> <small><span style='color:gray;'>"+r.result[i].created+"</span></small></div>";

            if (r.result[i].attachment!=null) {
              switch(r.result[i].attachment.type){
                case 'image':
                  cad=cad+'<img width="50%" height="50%" src="'+r.result[i].attachment.url+'" />';
                break;

                case 'link':
                  cad=cad+'<div>'+r.result[i].attachment.title+'<div>';
                  cad=cad+'<img width="25%" height="25%" src="'+r.result[i].attachment.thumbnail+'" />';
                  cad=cad+'<div><b>Autor:</b> '+r.result[i].attachment.post_author_username+'</div>';
                break;

                case 'video':
                  cad=cad+'<embed   width="420" height="345" src="'+r.result[i].attachment.url+'"></embed  >';
                break;

              }
            };

            cad=cad+"<div>"+r.result[i].body+"</div>";
            cad=cad+"<div><img src='http://www.theitprofile.com/wp-content/themes/newszine/images/comment.png'> "+r.result[i].replies+" <img src='http://iconshow.me/media/images/Mixed/line-icon/png/20/like-20.png' /> "+r.result[i].likes+" <img src='http://dolody.com/wp-content/themes/ytopica/images/icons/favorite.png' /> "+r.result[i].favorites+" <img src='http://www.hedgethink.com/wp-content/themes/hedgethink/images/tw_retweet.png' /> "+r.result[i].forwards+"</div>";
            cad=cad+'<small><a target="_blank" href="http://api.taringa.net/shout/go/'+r.result[i].id+'">Ir al shout en T!</a></small><hr>';
        };//for    

  }else{ cad='0 resultados'; }  

  document.getElementById(div).innerHTML=cad;

}

var buscar=function(){//cuando presiona el boton
  var radio=document.getElementsByName("opcion");
  var busqueda='';
  for (var i = 0; i < radio.length; i++) {
    if(radio[i].checked==true){
      busqueda=radio[i].value;
    }
  };

  var q=document.getElementById('q').value;
  if(q!=""){
    if(busqueda=='user'){
      taringa('http://api.taringa.net/user/nick/view/'+q,traer_user,'post');//el ultimo parametro es que carga la info en el div post
    }else if(busqueda=='shout'){
      taringa('http://api.taringa.net/shout/search/view?q='+q+'&count=50&interval=last-365days',buscar_shout,'post');//el ultimo parametro es que carga la info en el div post
    }else{
      taringa('http://api.taringa.net/post/search/view?q='+q+'&count=50&interval=last-365days',buscar_post,'post');
    }
  }else{
    alert("Ingresá un valor lpm");
  }

  
}