if(!self.define){let e,i={};const s=(s,n)=>(s=new URL(s+".js",n).href,i[s]||new Promise((i=>{if("document"in self){const e=document.createElement("script");e.src=s,e.onload=i,document.head.appendChild(e)}else e=s,importScripts(s),i()})).then((()=>{let e=i[s];if(!e)throw new Error(`Module ${s} didn’t register its module`);return e})));self.define=(n,r)=>{const d=e||("document"in self?document.currentScript.src:"")||location.href;if(i[d])return;let c={};const t=e=>s(e,d),o={module:{uri:d},exports:c,require:t};i[d]=Promise.all(n.map((e=>o[e]||t(e)))).then((e=>(r(...e),c)))}}define(["./workbox-3e911b1d"],(function(e){"use strict";self.skipWaiting(),e.clientsClaim(),e.precacheAndRoute([{url:"assets/index-9bd8237d.css",revision:null},{url:"index.html",revision:"0dd9884ff28855961c550a06d2ecdb8e"},{url:"registerSW.js",revision:"1872c500de691dce40960bb85481de07"},{url:"styles.css",revision:"25c0d42c32ba2a405cf5681cadfbfe9e"},{url:"pwa-64x64.png",revision:"cc9dc4e0109d7151261c9fccd045680b"},{url:"pwa-192x192.png",revision:"5d5b4b3e28167bcb20a383729660d733"},{url:"pwa-512x512.png",revision:"74a71edefb38eff5cd85cf43d655f7a3"},{url:"manifest.webmanifest",revision:"eec3124a34270926d6adaf9e96a6eb7f"}],{}),e.cleanupOutdatedCaches(),e.registerRoute(new e.NavigationRoute(e.createHandlerBoundToURL("index.html"),{denylist:[/^\/api/]}))}));
