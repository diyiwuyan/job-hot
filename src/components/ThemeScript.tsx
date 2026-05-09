export function ThemeScript() {
  const script = `(function(){try{var saved=localStorage.getItem('jobhot-theme');var mode=(saved==='dark'||saved==='light'||saved==='auto')?saved:'dark';var actual=mode;if(mode==='auto'){actual=window.matchMedia('(prefers-color-scheme:light)').matches?'light':'dark';}var root=document.documentElement;root.setAttribute('data-theme',actual);root.setAttribute('data-theme-mode',mode);document.body.setAttribute('arco-theme',actual);}catch(e){document.documentElement.setAttribute('data-theme','dark');}})();`;
  return <script dangerouslySetInnerHTML={{ __html: script }} />;
}
