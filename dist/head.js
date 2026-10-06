/* Hendese 0.1.0 */
(function(k){try{var t=localStorage.getItem(k);if(t!=='dark'&&t!=='light')t=matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';document.documentElement.setAttribute('data-theme',t)}catch(e){}document.documentElement.classList.add('js')})('hendese-theme');
