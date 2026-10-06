/* Hendese 0.4.0 */
(function(d){try{var t=localStorage.getItem(d.getAttribute('data-theme-key')||'hendese-theme');if(t!=='dark'&&t!=='light')t=matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';d.setAttribute('data-theme',t)}catch(e){}d.classList.add('js')})(document.documentElement);
