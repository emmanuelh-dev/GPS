if(!self.define){let e,i={};const s=(s,n)=>(s=new URL(s+".js",n).href,i[s]||new Promise((i=>{if("document"in self){const e=document.createElement("script");e.src=s,e.onload=i,document.head.appendChild(e)}else e=s,importScripts(s),i()})).then((()=>{let e=i[s];if(!e)throw new Error(`Module ${s} didn’t register its module`);return e})));self.define=(n,r)=>{const t=e||("document"in self?document.currentScript.src:"")||location.href;if(i[t])return;let d={};const o=e=>s(e,t),l={module:{uri:t},exports:d,require:o};i[t]=Promise.all(n.map((e=>l[e]||o(e)))).then((e=>(r(...e),d)))}}define(["./workbox-3e911b1d"],(function(e){"use strict";self.skipWaiting(),e.clientsClaim(),e.precacheAndRoute([{url:"assets/index-9bd8237d.css",revision:null},{url:"index.html",revision:"6930ab72f59f1389a706bdd494ab0792"},{url:"registerSW.js",revision:"1872c500de691dce40960bb85481de07"},{url:"styles.css",revision:"246bd46e1b1b021e2540cdbeeb1b6eb8"},{url:"pwa-64x64.png",revision:"d0ab030ca0fba93d8ebb83060c3a2723"},{url:"pwa-192x192.png",revision:"54f2679d67f4c55fe353b581971cf0c6"},{url:"pwa-512x512.png",revision:"0a0efe9865ee421067d8172a2f385f0b"},{url:"manifest.webmanifest",revision:"eec3124a34270926d6adaf9e96a6eb7f"}],{}),e.cleanupOutdatedCaches(),e.registerRoute(new e.NavigationRoute(e.createHandlerBoundToURL("index.html"),{denylist:[/^\/api/]}))}));
