if(!self.define){let e,i={};const s=(s,n)=>(s=new URL(s+".js",n).href,i[s]||new Promise((i=>{if("document"in self){const e=document.createElement("script");e.src=s,e.onload=i,document.head.appendChild(e)}else e=s,importScripts(s),i()})).then((()=>{let e=i[s];if(!e)throw new Error(`Module ${s} didn’t register its module`);return e})));self.define=(n,r)=>{const d=e||("document"in self?document.currentScript.src:"")||location.href;if(i[d])return;let t={};const o=e=>s(e,d),l={module:{uri:d},exports:t,require:o};i[d]=Promise.all(n.map((e=>l[e]||o(e)))).then((e=>(r(...e),t)))}}define(["./workbox-3e911b1d"],(function(e){"use strict";self.skipWaiting(),e.clientsClaim(),e.precacheAndRoute([{url:"assets/index-fa76e3b6.css",revision:null},{url:"index.html",revision:"02918b8ff8f28a784c434b3bed411315"},{url:"registerSW.js",revision:"1872c500de691dce40960bb85481de07"},{url:"styles.css",revision:"58ea14cdd580bb11559d5104ecd272c7"},{url:"pwa-64x64.png",revision:"6b4e78e1110efe8a461ae44b3814d760"},{url:"pwa-192x192.png",revision:"b6da336d82002d42f47c945f1343f31d"},{url:"pwa-512x512.png",revision:"f02a1be2235f173a292fd4409d0de331"},{url:"manifest.webmanifest",revision:"eec3124a34270926d6adaf9e96a6eb7f"}],{}),e.cleanupOutdatedCaches(),e.registerRoute(new e.NavigationRoute(e.createHandlerBoundToURL("index.html"),{denylist:[/^\/api/]}))}));
