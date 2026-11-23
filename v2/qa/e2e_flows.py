"""
Real-browser end-to-end checks for IndSupply (desktop + phone).

  pip install playwright && playwright install chromium
  npm run build && npm run preview        # serves http://localhost:4173
  python3 qa/e2e_flows.py http://localhost:4173

Runs against the built-in mock backend. Prints PASS/FAIL per check and exits 1 on any failure.
"""
import sys
from playwright.sync_api import sync_playwright, expect

BASE = (sys.argv[1] if len(sys.argv) > 1 else 'http://localhost:4173').rstrip('/')
results = []


def check(name, fn):
    try:
        fn(); results.append((True, name)); print('PASS', name)
    except Exception as e:  # noqa: BLE001
        results.append((False, name)); print('FAIL', name, '->', (str(e).splitlines() or [repr(e)])[0][:200])


def no_hscroll(pg):
    assert pg.evaluate('document.documentElement.scrollWidth <= document.documentElement.clientWidth + 1'), 'page scrolls sideways'


def visible_search(pg):
    return pg.locator('input[role=combobox]:visible').first


with sync_playwright() as p:
    b = p.chromium.launch()

    # ---------------- Desktop ----------------
    d = b.new_context(viewport={'width': 1366, 'height': 800}); pg = d.new_page()
    pg.goto(BASE + '/', wait_until='networkidle')

    def home():
        expect(pg.get_by_role('heading', name='Your trusted partner for industrial supplies')).to_be_visible()
        assert pg.locator('article [role=img]').count() >= 6, 'no product illustrations'
    check('desktop: home renders with product illustrations', home)

    def cat_menu():
        pg.get_by_role('button', name='All Categories').click()
        pg.get_by_role('link', name='Bearings').first.click()
        pg.wait_for_url('**/category/bearings')
        expect(pg.get_by_role('heading', name='Bearings', exact=True)).to_be_visible()
    check('desktop: category mega-menu is clickable (was clipped in v1)', cat_menu)

    def typeahead():
        pg.goto(BASE + '/', wait_until='networkidle')
        visible_search(pg).fill('bear')
        opt = pg.get_by_role('listbox', name='Product suggestions').get_by_role('option').first
        expect(opt).to_be_visible(); opt.click()
        pg.wait_for_url('**/products/*')
    check('desktop: search suggestions open a product', typeahead)

    def filters():
        pg.goto(BASE + '/products', wait_until='networkidle')
        pg.locator('aside label:has-text("TVS") input').check()
        expect(pg.get_by_role('button', name='Remove filter TVS')).to_be_visible()
        expect(pg.locator('article')).to_have_count(3)
        assert pg.locator('article:has-text("TVS")').count() == 3
        pg.get_by_label('Sort products').select_option('price_desc')
        pg.get_by_role('button', name='Clear all').click()
        expect(pg.locator('article')).to_have_count(12)
    check('desktop: brand filter, chips, sort and clear', filters)

    def disabled_oos():
        pg.goto(BASE + '/products/p-17', wait_until='networkidle')
        expect(pg.get_by_role('button', name='Add to Cart').first).to_be_disabled()
        expect(pg.get_by_text('Ask when it will be back')).to_be_visible()
    check('desktop: out-of-stock product cannot be added', disabled_oos)

    def guest_to_order():
        pg.goto(BASE + '/products/p-9', wait_until='networkidle')
        pg.get_by_role('button', name='Add to Cart').first.click()
        expect(pg.get_by_text('added to cart').first).to_be_visible()
        expect(pg.get_by_label('Cart, 1 item').first).to_be_visible()
        pg.goto(BASE + '/cart', wait_until='networkidle')
        expect(pg.get_by_text('Deep Groove Ball Bearing 6205').first).to_be_visible()
        pg.get_by_role('link', name='Login to checkout').first.click()
        pg.wait_for_url('**/login')
        pg.get_by_label('Mobile number / Email').first.fill('demo@indsupply.in')
        pg.get_by_label('Password', exact=True).first.fill('demo123')
        pg.locator('form:has(h1:has-text("Login")) button[type=submit]').click()
        pg.wait_for_url('**/checkout')
        expect(pg.get_by_label('Contact name')).to_have_value('Rajesh Kumar')
        pg.get_by_role('button', name='Continue to review').click()
        pg.get_by_text('Cash / UPI on delivery').click()
        pg.get_by_role('button', name='Place Order').click()
        pg.wait_for_url('**/order-confirmation/*')
        expect(pg.get_by_role('heading', name='Thank you!')).to_be_visible()
        assert pg.get_by_text('IS-2026-').first.is_visible()
    check('desktop: guest cart -> login -> checkout -> order confirmation', guest_to_order)

    def cancel_order():
        pg.get_by_role('link', name='Track this order').click()
        pg.wait_for_url('**/account/orders/*')
        expect(pg.get_by_text('Order tracking')).to_be_visible()
        pg.once('dialog', lambda dlg: dlg.accept())
        pg.get_by_role('button', name='Cancel order').click()
        expect(pg.get_by_text('This order was cancelled.')).to_be_visible()
    check('desktop: customer can cancel an order before packing', cancel_order)

    def orders_tabs():
        pg.goto(BASE + '/account/orders', wait_until='networkidle')
        pg.get_by_role('tab', name='Delivered').click()
        rows = pg.locator('li:has-text("View details")')
        expect(rows.first).to_be_visible()
        pg.wait_for_timeout(300)
        assert rows.count() >= 3 and rows.filter(has_not_text='Delivered').count() == 0, 'tab shows non-delivered orders'
    check('desktop: order status tabs filter the list', orders_tabs)

    def profile_save():
        pg.goto(BASE + '/account/profile', wait_until='networkidle')
        pg.get_by_label('Company name').fill('Kumar Fabricators LLP')
        pg.get_by_role('button', name='Save changes').click()
        expect(pg.get_by_text('Profile saved')).to_be_visible()
    check('desktop: profile saves', profile_save)

    def customer_blocked_from_admin():
        pg.goto(BASE + '/admin', wait_until='networkidle')
        assert '/admin' not in pg.url.replace(BASE, '') or pg.url.endswith('/'), pg.url
    check('desktop: customer cannot open /admin', customer_blocked_from_admin)
    d.close()

    # ---------------- Admin ----------------
    a = b.new_context(viewport={'width': 1366, 'height': 800}); pa = a.new_page()
    pa.goto(BASE + '/admin/login', wait_until='networkidle')

    def admin_login():
        pa.get_by_label('Email').fill('admin@indsupply.in'); pa.get_by_label('Password', exact=True).fill('admin123')
        pa.get_by_role('button', name='Login').click(); pa.wait_for_url('**/admin')
        expect(pa.get_by_role('heading', name='Dashboard')).to_be_visible()
        expect(pa.get_by_text('Recent orders')).to_be_visible()
    check('admin: login and dashboard', admin_login)

    def admin_status():
        pa.goto(BASE + '/admin/orders', wait_until='networkidle')
        sel = pa.locator('tbody select').first
        sel.select_option('PACKED')
        expect(pa.get_by_text('marked Packed')).to_be_visible()
    check('admin: update order status', admin_status)

    def admin_product():
        pa.goto(BASE + '/admin/products', wait_until='networkidle')
        pa.get_by_role('button', name='Add Product').click()
        pa.get_by_label('Product name').fill('QA Test Bolt'); pa.get_by_label('SKU / Item code').fill('QA-001'); pa.get_by_label(r'Price (₹, excl. GST)', exact=False).fill('7.5')
        pa.get_by_role('button', name='Save product').click()
        expect(pa.get_by_text('Product added')).to_be_visible()
        pa.get_by_placeholder('Search by name or item code').fill('QA-001')
        expect(pa.get_by_text('QA Test Bolt')).to_be_visible()
    check('admin: add a product and find it', admin_product)

    def admin_category():
        pa.goto(BASE + '/admin/categories', wait_until='networkidle')
        pa.get_by_role('button', name='Add Category').click()
        pa.get_by_label('Category name').fill('Welding Supplies')
        pa.get_by_role('button', name='Save category').click()
        expect(pa.get_by_text('Welding Supplies').first).to_be_visible()
    check('admin: add a category', admin_category)
    a.close()

    # ---------------- Phone ----------------
    m = b.new_context(viewport={'width': 390, 'height': 844}, device_scale_factor=2, has_touch=True, is_mobile=True); pm = m.new_page()

    def phone_overflow():
        for path in ['/', '/categories', '/products', '/category/fasteners', '/products/p-1', '/cart', '/login', '/contact', '/info/about']:
            pm.goto(BASE + path, wait_until='networkidle'); no_hscroll(pm)
    check('phone: no sideways scrolling on 9 key pages', phone_overflow)

    def tabbar():
        pm.goto(BASE + '/', wait_until='networkidle')
        tb = pm.get_by_role('navigation', name='Quick navigation'); expect(tb).to_be_visible()
        tb.get_by_role('link', name='Categories').tap(); pm.wait_for_url('**/categories')
    check('phone: bottom tab bar navigates', tabbar)

    def drawer():
        pm.goto(BASE + '/', wait_until='networkidle')
        pm.get_by_role('button', name='Open menu').tap()
        dlg = pm.get_by_role('dialog', name='Menu'); expect(dlg).to_be_visible()
        dlg.get_by_role('link', name='Lubricants').tap(); pm.wait_for_url('**/category/lubricants')
        expect(pm.get_by_role('dialog', name='Menu')).to_have_count(0)
    check('phone: menu drawer lists categories and closes on navigate', drawer)

    def sheet():
        pm.goto(BASE + '/products', wait_until='networkidle')
        pm.get_by_role('button', name='Filters').tap()
        dlg = pm.get_by_role('dialog', name='Filters'); expect(dlg).to_be_visible()
        dlg.locator('label:has-text("Unbrako") input').check()
        dlg.get_by_role('button', name='Clear all').tap()
        expect(pm.get_by_role('dialog', name='Filters')).to_have_count(0)
    check('phone: filter bottom-sheet works', sheet)

    def sticky_buy():
        pm.goto(BASE + '/products/p-1', wait_until='networkidle')
        bar = pm.locator('div.fixed:has-text("Buy Now")'); expect(bar).to_be_visible()
        bar.get_by_role('button', name='Add').tap()
        expect(pm.get_by_text('added to cart').first).to_be_visible()
    check('phone: sticky Add / Buy Now bar adds to cart', sticky_buy)

    def cart_bar():
        pm.goto(BASE + '/cart', wait_until='networkidle')
        expect(pm.locator('div.fixed:has-text("Login to checkout")')).to_be_visible()
        no_hscroll(pm)
    check('phone: cart shows sticky checkout bar', cart_bar)

    def register_tab():
        pm.goto(BASE + '/login', wait_until='networkidle')
        pm.get_by_role('tab', name='Register').tap()
        expect(pm.get_by_role('heading', name='Register')).to_be_visible()
    check('phone: login/register tabs', register_tab)

    def tap_sizes():
        pm.goto(BASE + '/products', wait_until='networkidle')
        small = pm.evaluate("""()=>[...document.querySelectorAll('article button, header button, header a, nav[aria-label="Quick navigation"] a')].filter(e=>{const r=e.getBoundingClientRect();return r.width>0&&(r.height<40||r.width<40)}).length""")
        assert small == 0, f'{small} primary controls under 40px'
    check('phone: primary controls are at least 40px', tap_sizes)
    m.close(); b.close()

fails = [n for ok, n in results if not ok]
print(f'\n{len(results) - len(fails)}/{len(results)} checks passed')
sys.exit(1 if fails else 0)
