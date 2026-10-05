/* SunsetPhone (mod) : 100 % navigateur, aucun serveur ni base de données.
   Textes, contacts, notes, réglages -> localStorage ; images -> IndexedDB (un cookie est limité à 4 Ko). */
(function(){
  var KEY = 'sunsetphone', saved = {};
  try { saved = JSON.parse(localStorage.getItem(KEY)) || {}; } catch(e){}
  var D = {me: saved.me, settings: saved.settings || {wallpaper:'sunset', sounds:true}, notes: saved.notes || [],
           contacts: saved.contacts || [], convs: saved.convs || {}, card: saved.card || {photo:0}, next: saved.next || 1};
  function save(){ try { localStorage.setItem(KEY, JSON.stringify(D)); } catch(e){ alertBox('Stockage plein', 'Supprimez des photos ou des messages.', {cancel:false}); } }

  var APPS = [
    {id:'settings', name:'Réglages', icon:'settings.png', kind:'screen'},
    {id:'calculator', name:'Calculatrice', icon:'calculator.png', kind:'screen'},
    {id:'notes', name:'Notes', icon:'notes.png', kind:'screen'},
    {id:'camera', name:'Caméra', icon:'camera.png', kind:'camera'},
    {id:'phone', name:'Téléphone', icon:'phone.png', kind:'screen', dock:1},
    {id:'sms', name:'Messages', icon:'sms.png', kind:'screen', dock:2},
    {id:'photos', name:'Photos', icon:'photos.png', kind:'screen', dock:3}
  ];
  var WALLS = [{id:'night', name:'Nuit', file:'night.jpg'}, {id:'sunset', name:'Sunset', file:'sunset.jpg'}, {id:'dark', name:'Sombre', file:'dark.jpg'}];

  /* ---- images : IndexedDB ---- */
  var dbp, urls = {};
  function idb(){ return dbp || (dbp = new Promise(function(ok, ko){
    var r = indexedDB.open('sunsetphone', 1);
    r.onupgradeneeded = function(){ r.result.createObjectStore('photos', {keyPath:'id', autoIncrement:true}); };
    r.onsuccess = function(){ ok(r.result); }; r.onerror = ko; })); }
  function tx(mode, fn){ return idb().then(function(d){ return new Promise(function(ok, ko){
    var t = d.transaction('photos', mode), q = fn(t.objectStore('photos'));
    t.oncomplete = function(){ ok(q && q.result); }; t.onerror = ko; }); }); }
  function url(p){ return urls[p.id] || (urls[p.id] = URL.createObjectURL(p.blob)); }
  function item(p){ return {id:p.id, url:url(p), taken:p.taken}; }

  function pick(selfie){
    var i = document.createElement('input');
    i.type = 'file'; i.accept = 'image/*'; if (selfie) i.setAttribute('capture', 'user');
    i.onchange = function(){
      var f = i.files[0]; if (!f) return;
      SP.uploading({on:true}); openApp('photos');
      createImageBitmap(f).then(function(b){
        var k = Math.min(1, 1600 / Math.max(b.width, b.height)), c = document.createElement('canvas');
        c.width = Math.round(b.width * k); c.height = Math.round(b.height * k);
        c.getContext('2d').drawImage(b, 0, 0, c.width, c.height);
        c.toBlob(function(blob){
          var rec = {blob:blob, taken:Date.now() / 1000};
          tx('readwrite', function(s){ return s.add(rec); }).then(function(id){ rec.id = id; SP.photo({photo:item(rec)}); });
        }, 'image/jpeg', 0.85);
      }).catch(function(){ SP.uploading({on:false}); });
    };
    i.click();
  }

  function names(){ var n = {}; D.contacts.forEach(function(c){ n[c.number] = c.name; }); return n; }
  var cleanN = function(n){ return String(n || '').replace(/\D/g, ''); };

  var impl = {
    Ready: function(){
      if (!D.me) {
        var name = (prompt('Votre nom ?', 'Joueur') || 'Joueur').slice(0, 24);
        D.me = {name:name, number:'06' + String(Math.floor(Math.random() * 1e8)).padStart(8, '0')}; save();
      }
      SP.init({apps:APPS, wallpapers:WALLS, settings:D.settings, notes:D.notes, carrier:'Sunset Mod', version:'mod-local', me:D.me, services:[]});
      SP.card({card:{name:D.card.name || D.me.name, number:D.me.number, url:'', photo:D.card.photo || 0}});
      SP.sync({number:D.me.number, contacts:D.contacts, directory:[], convs:{list:D.convs, names:names()}});
      SP.open();
    },
    Close: function(){ SP.close(); setTimeout(SP.open, 60); },
    SendSMS: function(to, text){
      to = cleanN(to);
      var m = {id:D.next++, from:D.me.number, to:to, text:String(text).slice(0, 300), time:Math.floor(Date.now() / 1000)};
      (D.convs[to] = D.convs[to] || []).push(m); if (D.convs[to].length > 80) D.convs[to].shift();
      save(); SP.sms({msg:m, other:to});
    },
    AddContact: function(n, name){
      n = cleanN(n); var c = D.contacts.filter(function(x){ return x.number === n; })[0];
      if (c) c.name = name; else D.contacts.push({number:n, name:name});
      S.names[n] = name; save(); SP.contacts({contacts:D.contacts});
    },
    RemoveContact: function(n){
      D.contacts = D.contacts.filter(function(c){ return c.number !== n; }); delete S.names[n]; save(); SP.contacts({contacts:D.contacts});
    },
    SaveSettings: function(j){ D.settings = JSON.parse(j); save(); },
    SaveNotes: function(j){ D.notes = JSON.parse(j); save(); },
    SetCard: function(name, photo){
      D.card = {name:name, photo:+photo || 0}; save();
      var go = function(u){ SP.card({card:{name:name, number:D.me.number, url:u, photo:D.card.photo}}); };
      if (!D.card.photo) return go('');
      tx('readonly', function(s){ return s.get(D.card.photo); }).then(function(p){ go(p ? url(p) : ''); });
    },
    CopyText: function(t){ try { navigator.clipboard.writeText(t); } catch(e){} },
    Camera: function(selfie){ pick(!!selfie); },
    LoadPhotos: function(){ tx('readonly', function(s){ return s.getAll(); }).then(function(l){ SP.photos({list:(l || []).reverse().map(item)}); }); },
    DeletePhoto: function(id){
      tx('readwrite', function(s){ return s.delete(+id); }).then(function(){ if (urls[id]) { URL.revokeObjectURL(urls[id]); delete urls[id]; } SP.photoDeleted({id:id}); });
    },
    PhotoUrl: function(ids){
      String(ids).split(',').forEach(function(id){
        tx('readonly', function(s){ return s.get(+id); }).then(function(p){ SP.photoUrl({id:id, url:p ? url(p) : ''}); });
      });
    }
  };
  /* tout le reste (X, Snap, appels, AirDrop...) n'existe pas dans le mod : no-op */
  window.gmod = new Proxy(impl, {get: function(t, k){ return k in t ? t[k] : function(){}; }});
})();
