import sys, json
from playwright.sync_api import sync_playwright
BASE, TAG = sys.argv[1], sys.argv[2]
ROUTES = ['/', '/categories', '/products', '/category/fasteners', '/search?q=bolt', '/products/p-1', '/login', '/contact', '/cart', '/checkout', '/account/orders', '/account/orders/o-120', '/account/profile', '/admin', '/admin/products', '/admin/orders', '/admin/customers']
VIEWS = {'mobile': (375, 812), 'tablet': (768, 1024), 'desktop': (1366, 768)}
JS = """() => {
 const de=document.documentElement, vw=de.clientWidth;
 const imgs=[...document.images]; const broken=imgs.filter(i=>i.complete&&i.naturalWidth===0).length;
 const svgImgs=document.querySelectorAll('svg[role=img], [role=img]').length;
 const small=[...document.querySelectorAll('a,button,input,select,summary,[role=button]')].filter(e=>{const r=e.getBoundingClientRect(); const cs=getComputedStyle(e); return r.width>0&&r.height>0&&cs.visibility!=='hidden'&&(r.height<40||r.width<40)&&!(e.tagName==='INPUT'&&e.type==='checkbox')&&!(e.tagName==='INPUT'&&e.type==='radio')&&!e.closest('.sr-only')&&cs.position!=='absolute'}).length;
 const over=[...document.querySelectorAll('body *')].filter(e=>{const r=e.getBoundingClientRect(); return r.width>0&&r.right>vw+1&&getComputedStyle(e).position!=='fixed'&&!e.closest('[class*=overflow-x]')&&!e.closest('table')}).length;
 return {hscroll: de.scrollWidth>vw, scrollW: de.scrollWidth, vw, imgs: imgs.length, broken, artImgs: svgImgs, smallTargets: small, overflowEls: over, h1: (document.querySelector('h1')||{}).textContent||'', title: document.title};
}"""
out = {}
with sync_playwright() as p:
    b = p.chromium.launch()
    for vname, (w, h) in VIEWS.items():
        for admin in (False, True):
            ctx = b.new_context(viewport={'width': w, 'height': h}, device_scale_factor=1)
            ctx.add_init_script(f"localStorage.setItem('indsupply_token','mock.{'u-admin' if admin else 'u-demo'}')")
            pg = ctx.new_page(); errs = []
            pg.on('console', lambda m: errs.append(m.text[:140]) if m.type == 'error' else None)
            pg.on('pageerror', lambda e: errs.append('PAGEERROR ' + str(e)[:140]))
            for r in ROUTES:
                isadmin = r.startswith('/admin')
                if isadmin != admin: continue
                if not isadmin and admin: continue
                errs.clear()
                try:
                    pg.goto(BASE + r, wait_until='networkidle', timeout=15000); pg.wait_for_timeout(350)
                    d = pg.evaluate(JS); d['errors'] = list(errs)
                    out[f'{vname} {r}'] = d
                    if r in ('/', '/products/p-1', '/cart', '/category/fasteners', '/admin') :
                        pg.screenshot(path=f'/home/claude/qa/{TAG}_{vname}_{r.strip("/").replace("/","_") or "home"}.png', full_page=False)
                except Exception as e:
                    out[f'{vname} {r}'] = {'fatal': str(e)[:200]}
            ctx.close()
    b.close()
json.dump(out, open(f'/home/claude/qa/{TAG}.json', 'w'), indent=1)
bad = {k: v for k, v in out.items()}
print('pages tested:', len(out))
print('hscroll pages:', [k for k, v in out.items() if v.get('hscroll')])
print('console/page errors:', {k: v['errors'] for k, v in out.items() if v.get('errors')})
print('broken imgs:', sum(v.get('broken', 0) for v in out.values()), '| pages with 0 <img>:', sum(1 for v in out.values() if v.get('imgs') == 0))
print('fatal:', {k: v['fatal'] for k, v in out.items() if v.get('fatal')})
m = [v['smallTargets'] for k, v in out.items() if k.startswith('mobile')]
print('mobile small tap targets (<40px) avg/page:', round(sum(m) / max(len(m), 1), 1))
print('overflowing elements (mobile):', {k: v['overflowEls'] for k, v in out.items() if k.startswith('mobile') and v.get('overflowEls')})
