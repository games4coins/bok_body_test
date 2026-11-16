/* VK ID test integration for BOK Body. Authentication is UI-only until backend token verification is enabled. */
(function(global){
'use strict';
const APP_ID=54901191;
const REDIRECT='https://games4coins.github.io/bok_body_test/';
let current=null;
function sdk(){
 return new Promise((resolve,reject)=>{
  if(global.VKIDSDK)return resolve(global.VKIDSDK);
  const script=document.createElement('script');
  script.src='https://unpkg.com/@vkid/sdk@2/dist-sdk/umd/index.js';
  script.onload=()=>global.VKIDSDK?resolve(global.VKIDSDK):reject(new Error('SDK недоступен'));
  script.onerror=()=>reject(new Error('Не удалось загрузить VK ID'));
  document.head.appendChild(script);
 });
}
function profile(){return current;}
async function mount(container, onSuccess, onError){
 try{
  const VKID=await sdk();
  VKID.Config.init({app:APP_ID,redirectUrl:REDIRECT,responseMode:VKID.ConfigResponseMode.Callback,source:VKID.ConfigSource.LOWCODE,scope:''});
  const widget=new VKID.OneTap();
  widget.render({container,showAlternativeLogin:true,styles:{height:46}})
   .on(VKID.WidgetEvents.ERROR,onError)
   .on(VKID.OneTapInternalEvents.LOGIN_SUCCESS,async payload=>{
    try{
     const result=await VKID.Auth.exchangeCode(payload.code,payload.device_id);
     if(!result||!result.access_token)throw Error('Не получен токен');
     const data=await VKID.Auth.userInfo(result.access_token);
     const u=data.user||data;
     if(!u||!u.user_id)throw Error('Не получен профиль VK');
     current={id:String(u.user_id),name:[u.first_name,u.last_name].filter(Boolean).join(' '),avatar:u.avatar||'',url:'https://vk.com/id'+u.user_id};
     // No access token is persisted or sent to the existing booking API.
     onSuccess(current);
    }catch(e){onError(e);}
   });
 }catch(e){onError(e);}
}
function logout(){current=null;}
global.BokVK={mount,profile,logout,appId:APP_ID};
})(window);
