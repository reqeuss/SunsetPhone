(function(){
  "use strict";
  if(window.__SUNSETGAMES_SUNSETPHONE_BRIDGE__) return;
  window.__SUNSETGAMES_SUNSETPHONE_BRIDGE__=true;

  const MOD_ORIGIN="*";
  const SOURCE="sunsetgames";
  const send=(type,payload)=>{
    try{window.parent.postMessage({source:SOURCE,type,payload},MOD_ORIGIN)}catch(e){}
  };
  const safe=(fn)=>{try{return fn()}catch(e){return undefined}};

  function snapshot(){
    const d={};
    safe(()=>{ if(window.SP && typeof SP.getState==="function") Object.assign(d,SP.getState()); });
    safe(()=>{ if(window.SP && SP.me) d.me=SP.me; });
    safe(()=>{ if(window.SP && SP.contacts) d.contacts=SP.contacts; });
    safe(()=>{ if(window.SP && SP.number) d.number=SP.number; });
    safe(()=>{ if(window.SP && SP.convs) d.convs=SP.convs; });
    safe(()=>{ if(window.SP && SP.directory) d.directory=SP.directory; });
    return d;
  }

  function publishSnapshot(){
    send("phone-sync",snapshot());
  }

  if(window.SP){
    ["init","sync","contacts","sms","photos","photo","card"].forEach(name=>{
      if(typeof SP[name]!=="function") return;
      const old=SP[name];
      SP[name]=function(){
        const result=old.apply(this,arguments);
        if(name==="sms"){
          const a=arguments[0];
          send("phone-message",{from:a?.from||a?.number,text:a?.text||a?.body||"",image:a?.image||null});
        }else if(name==="photo"){
          const a=arguments[0];
          if(a?.photo) send("phone-photo",{photo:a.photo});
        }else{
          publishSnapshot();
        }
        return result;
      };
    });
  }

  window.addEventListener("message",function(event){
    const d=event.data;
    if(!d || d.source!=="sunsetphone-mod") return;

    if(d.type==="hello"){
      send("hello-ack",{version:"1.0.0",official:true});
      publishSnapshot();
      return;
    }

    if(d.type==="phone-sync-request"){
      publishSnapshot();
      return;
    }

    if(d.type!=="phone-action") return;
    const a=d.action, x=d.data||{};

    safe(()=>{
      if(!window.gmod) return;
      if(a==="SendSMS" && typeof gmod.SendSMS==="function") gmod.SendSMS(x.number,x.text);
      if(a==="Call" && typeof gmod.Call==="function") gmod.Call(x.number);
      if(a==="AddContact" && typeof gmod.AddContact==="function") gmod.AddContact(x.number,x.name);
      if(a==="RunApp" && typeof gmod.RunApp==="function") gmod.RunApp(x.id);
      if(a==="RemoveContact" && typeof gmod.RemoveContact==="function") gmod.RemoveContact(x.number);
      if(a==="Sync" && typeof gmod.Sync==="function") gmod.Sync();
      publishSnapshot();
    });
  });

  setTimeout(publishSnapshot,500);
})();