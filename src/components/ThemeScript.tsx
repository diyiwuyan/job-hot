export function ThemeScript() {
  const script = `(function(){try{var allowed=['dark','light','auto','ocean','mint','warm'];var saved=localStorage.getItem('jobhot-theme');var mode=allowed.indexOf(saved)>=0?saved:'dark';var actual=mode;if(mode==='auto'){actual=window.matchMedia('(prefers-color-scheme:light)').matches?'light':'dark';}var root=document.documentElement;root.setAttribute('data-theme',actual);root.setAttribute('data-theme-mode',mode);document.body.setAttribute('arco-theme',actual==='dark'?'dark':'light');}catch(e){document.documentElement.setAttribute('data-theme','dark');}})();`;
  return <script dangerouslySetInnerHTML={{ __html: script }} />;
}
