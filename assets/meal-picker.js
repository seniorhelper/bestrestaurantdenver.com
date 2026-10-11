(function(){
"use strict";
var CRAVE={mexican:["Mexican"],italian:["Italian","Pizza"],japanese:["Japanese"],chinese:["Chinese","Taiwanese","Dumplings"],noodles:["Ramen"],vietnamese:["Vietnamese"],tasting:["Tasting menu"],french:["French"],mideast:["Israeli"],latin:["Latin American"],american:["Steakhouse","Barbecue","Southern","Soul food","Game"],contemporary:["Contemporary"],eastern:["Ukrainian","Eastern European"],breakfast:["Bagels","Breakfast"]};
var AREA={nw:["LoHi","Highland","Sunnyside","Berkeley","West Highland"],dt:["LoDo","Union Station","Larimer Square","Ballpark","Uptown"],rino:["RiNo","Five Points","Cole"],south:["Platt Park","Washington Park","Baker","Lincoln Park"],east:["Cherry Creek","Cheesman Park","East Colfax","Park Hill","Hale"]};
var DISH={mexican:"pozole, aguachile or anything with house-made tortillas",italian:"fresh pasta and a Piedmont or Emilia-Romagna wine",japanese:"nigiri at the counter, or a handroll set",chinese:"dumplings, wontons and something from the wok",noodles:"a bowl of ramen and a small plate",vietnamese:"something built around fresh herbs",tasting:"the full menu, with the pairing if it is a celebration",french:"something from the classic side of the menu",mideast:"a spread of salads and something from the grill",latin:"ceviche or crudo, then tacos",american:"green chile if it is on the menu",contemporary:"whatever is built around Colorado produce",eastern:"dumplings and pickles",breakfast:"go early before it sells out"};
var W={two:6,one:5,bib:4,rec:2,press:3};
var LBL={two:"Two MICHELIN Stars",one:"One MICHELIN Star",bib:"Bib Gourmand",rec:"MICHELIN Recommended"};
var OCC={date:"good for a date",celebration:"a celebration pick",group:"works for a group",casual:"easy on a weeknight",solo:"good for one at the counter or bar"};
var $=function(s){return document.querySelector(s)}, $$=function(s){return Array.prototype.slice.call(document.querySelectorAll(s))};
var data=[], st={c:[],o:"",a:"",v:"",d:"",e:"1"};
function esc(t){return String(t==null?"":t).replace(/[&<>"]/g,function(c){return{"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;"}[c]})}
function readURL(){var p=new URLSearchParams(location.search);if(p.get("c"))st.c=p.get("c").split(",").filter(function(x){return CRAVE[x]});["o","a","v","d","e"].forEach(function(k){if(p.has(k))st[k]=p.get(k)})}
function writeURL(){var p=new URLSearchParams();if(st.c.length)p.set("c",st.c.join(","));["o","a","v","d"].forEach(function(k){if(st[k])p.set(k,st[k])});if(st.e!=="1")p.set("e","0");var q=p.toString();history.replaceState(null,"",location.pathname+(q?"?"+q:"")+location.hash)}
function sync(){$$(".mp .chip[data-g]").forEach(function(b){var g=b.dataset.g,v=b.dataset.v,on=g==="c"?st.c.indexOf(v)>-1:(g==="e"?st.e==="1":st[g]===v);b.setAttribute("aria-pressed",on?"true":"false")})}
function areaOf(h){for(var k in AREA)if(AREA[k].indexOf(h)>-1)return k;return ""}
function score(r){
  if(r.bar)return -1;
  var cuis=r.cuisines,ok=true,s=W[r.award_key]||1,why=[];
  if(st.c.length){ok=st.c.some(function(c){return CRAVE[c].some(function(x){return cuis.indexOf(x)>-1})});if(!ok)return -1}
  if(st.a&&AREA[st.a].indexOf(r.neighborhood)<0)return -1;
  if(st.d&&!r.diet_note)return -1;
  if(st.o){if(r.editor_tags.indexOf(st.o)>-1)s+=4;else s-=3}
  if(st.v){if(r.award_key==="bib")s+=4;else if(r.award_key==="press"&&r.editor_tags.indexOf("casual")>-1)s+=3;else if(r.award_key==="two"||r.award_key==="one"||cuis[0]==="Tasting menu")s-=5}
  return s}
function why(r){var w=[];w.push(LBL[r.award_key]||(r.awards[0]?("James Beard: "+r.awards[0].level+" ("+r.awards[0].year+")"):"Long-running Denver institution"));w.push(r.cuisines[0]);w.push(r.neighborhood);
  if(st.o&&r.editor_tags.indexOf(st.o)>-1)w.push(OCC[st.o]);if(st.d&&r.diet_note)w.push(r.diet_note);return w.join(" · ")}
function link(r){if(r.website)return '<a href="'+esc(r.website)+'" rel="noopener">Official website</a>';if(r.michelin_url)return '<a href="'+esc(r.michelin_url)+'" rel="nofollow noopener">MICHELIN Guide listing</a>';var s=r.sources[0];return '<a href="'+esc(s.url)+'" rel="nofollow noopener">Source: '+esc(s.title)+'</a>'}
function osm(a){return "https://www.openstreetmap.org/search?query="+encodeURIComponent(a)}
function render(){
  var list=data.map(function(r){return{r:r,s:score(r)}}).filter(function(x){return x.s>=0});
  list.sort(function(a,b){return b.s-a.s||a.r.name.localeCompare(b.r.name)});
  var top=list.slice(0,5),out=$("#mpRes");
  $("#mpCount").textContent=list.length?(list.length+" match"+(list.length===1?"":"es")+", showing "+top.length):"No matches";
  $("#mpEmpty").hidden=!!list.length;
  out.innerHTML=top.map(function(x,i){var r=x.r,badge=LBL[r.award_key]?'<span class="dr-badge '+r.award_key+'">'+LBL[r.award_key]+'</span>':'<span class="dr-badge rec">Beyond MICHELIN</span>';
    return '<li class="mp-card"><div class="pick-hd"><span class="mp-n">'+(i+1)+'</span>'+badge+'</div><h3>'+esc(r.name)+'</h3><p class="pick-meta">'+esc(r.neighborhood)+' · '+esc(r.address.replace(", Denver, CO",""))+'</p><p class="mp-why"><b>Why it fits:</b> '+esc(why(r))+'</p>'+(r.note?'<p>'+esc(r.note)+'</p>':'')+'<p class="pick-link">'+link(r)+' · <a href="'+osm(r.address)+'" rel="nofollow noopener">Map</a></p><p class="mp-ver">Last verified '+esc(r.verified)+' · '+r.sources.length+' source'+(r.sources.length>1?'s':'')+'</p></li>'}).join("");
  var eve=$("#mpEve");
  if(st.e==="1"&&top.length){var a=areaOf(top[0].r.neighborhood);var bars=data.filter(function(r){return(r.bar||r.slug==="mezcaleria-alma")&&areaOf(r.neighborhood)===a&&r.slug!==top[0].r.slug});
    var dish=st.c.length?DISH[st.c[0]]:"";var h='<h3>Make it an evening</h3>';
    h+='<p><b>Dinner:</b> '+esc(top[0].r.name)+' in '+esc(top[0].r.neighborhood)+'.'+(dish?' Typical things to look for in this cuisine: '+esc(dish)+' (a general idea, not a claim about this menu).':'')+'</p>';
    h+=bars.length?'<p><b>Drinks nearby:</b> '+bars.map(function(b){return esc(b.name)+' ('+esc(b.neighborhood)+')'}).join(" or ")+'. Same part of town, from our sourced list.</p>':'<p><b>Drinks nearby:</b> none of the bars on our sourced list are in this part of town yet. The restaurant’s own bar is usually the easiest option.</p>';
    eve.innerHTML=h;eve.hidden=false}else{eve.hidden=true}
  writeURL()}
document.addEventListener("click",function(e){var b=e.target.closest(".mp .chip[data-g]");if(!b)return;var g=b.dataset.g,v=b.dataset.v;
  if(g==="c"){var i=st.c.indexOf(v);if(i>-1)st.c.splice(i,1);else st.c.push(v)}else if(g==="v"||g==="d"){st[g]=st[g]?"":"1"}else if(g==="e"){st.e=st.e==="1"?"0":"1"}else{st[g]=v}
  sync();render()});
var rs=$("#mpReset");if(rs)rs.addEventListener("click",function(){st={c:[],o:"",a:"",v:"",d:"",e:"1"};sync();render()});
readURL();sync();
fetch("/data/restaurants.json").then(function(r){return r.json()}).then(function(j){data=j.restaurants;render()}).catch(function(){$("#mpCount").textContent="Could not load the list. Use the directory instead.";});
})();
