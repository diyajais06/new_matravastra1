import { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import { LayoutDashboard, ShoppingBag, Package, Users, MessageSquare, LogOut, RefreshCw, Search, ShieldCheck, IndianRupee, Clock3, Menu, X, CheckCircle2, Truck, Eye } from "lucide-react";
import { API, inr } from "../lib/api";

const sections = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "orders", label: "Orders", icon: ShoppingBag },
  { id: "products", label: "Products", icon: Package },
  { id: "customers", label: "Customers", icon: Users },
  { id: "enquiries", label: "Bulk enquiries", icon: MessageSquare },
];

function request(token) {
  return axios.create({ baseURL: API, headers: { Authorization: `Bearer ${token}` } });
}

export default function Admin() {
  const [token, setToken] = useState(() => sessionStorage.getItem("mv_admin_token") || "");
  const [email, setEmail] = useState("matravastra@gmail.com");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [busy, setBusy] = useState(false);
  const [section, setSection] = useState("overview");
  const [stats, setStats] = useState(null);
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [enquiries, setEnquiries] = useState([]);
  const [search, setSearch] = useState("");
  const [mobileNav, setMobileNav] = useState(false);
  const [notice, setNotice] = useState("");

  const logout = useCallback(() => {
    sessionStorage.removeItem("mv_admin_token");
    setToken("");
    setStats(null);
  }, []);

  const load = useCallback(async (activeToken = token) => {
    if (!activeToken) return;
    setBusy(true);
    setNotice("");
    try {
      const client = request(activeToken);
      const [s, o, p, c, e] = await Promise.all([
        client.get("/admin/dashboard"), client.get("/admin/orders"),
        client.get("/admin/products"), client.get("/admin/customers"),
        client.get("/admin/enquiries"),
      ]);
      setStats(s.data); setOrders(o.data); setProducts(p.data);
      setCustomers(c.data); setEnquiries(e.data);
    } catch (err) {
      if (err.response?.status === 401) logout();
      else setNotice(err.response?.data?.detail || "Data load nahi ho paya. Backend check karein.");
    } finally { setBusy(false); }
  }, [token, logout]);

  useEffect(() => { if (token) load(token); }, [token, load]);

  const login = async (event) => {
    event.preventDefault(); setBusy(true); setLoginError("");
    try {
      const { data } = await axios.post(`${API}/admin/login`, { email, password });
      sessionStorage.setItem("mv_admin_token", data.access_token);
      setToken(data.access_token); setPassword("");
    } catch (err) {
      setLoginError(err.response?.data?.detail || "Login failed. Server settings check karein.");
    } finally { setBusy(false); }
  };

  const updateStatus = async (order, status) => {
    try {
      await request(token).patch(`/admin/orders/${encodeURIComponent(order.order_number)}`, { status });
      setOrders((old) => old.map((x) => x.order_number === order.order_number ? { ...x, status } : x));
      setNotice(`Order ${order.order_number} updated.`);
    } catch (err) { setNotice(err.response?.data?.detail || "Order update failed."); }
  };

  const deleteProduct = async (slug) => {
    if (!window.confirm("Is product ko delete karna hai?")) return;
    try {
      await request(token).delete(`/admin/products/${encodeURIComponent(slug)}`);
      setProducts((old) => old.filter((p) => p.slug !== slug));
      setNotice("Product deleted.");
    } catch (err) { setNotice(err.response?.data?.detail || "Delete failed."); }
  };

  const filteredOrders = useMemo(() => orders.filter((o) => [o.order_number, o.customer?.name, o.customer?.phone].join(" ").toLowerCase().includes(search.toLowerCase())), [orders, search]);
  const filteredProducts = useMemo(() => products.filter((p) => [p.name, p.slug, p.collection].join(" ").toLowerCase().includes(search.toLowerCase())), [products, search]);

  if (!token) return <main className="mv-admin-login"><div className="mv-login-card"><div className="mv-admin-mark">MV</div><p className="mv-admin-kicker">MATRA VASTRA · PRIVATE CONSOLE</p><h1>Owner <span>Access</span></h1><p className="mv-admin-muted">Sign in to manage your store.</p><form onSubmit={login}><label>Owner email</label><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="username" /><label>Password</label><input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="current-password" /><button className="mv-admin-primary" disabled={busy}>{busy ? "Verifying…" : "Secure sign in"}</button></form>{loginError && <p className="mv-admin-error">{loginError}</p>}<div className="mv-login-foot"><ShieldCheck size={15}/> Owner-only access · Secure session</div><a href="/" className="mv-admin-back">← Back to storefront</a></div></main>;

  const current = sections.find((x) => x.id === section);
  return <div className="mv-admin">
    <aside className={`mv-admin-sidebar ${mobileNav ? "is-open" : ""}`}>
      <div className="mv-admin-brand"><div className="mv-admin-mark small">MV</div><div><b>MATRA VASTRA</b><small>OWNER CONSOLE</small></div><button className="mv-mobile-close" onClick={() => setMobileNav(false)}><X/></button></div>
      <div className="mv-admin-nav-label">WORKSPACE</div>
      {sections.map((item) => <button key={item.id} onClick={() => { setSection(item.id); setMobileNav(false); setSearch(""); }} className={section === item.id ? "active" : ""}><item.icon size={18}/>{item.label}</button>)}
      <div className="mv-sidebar-bottom"><div className="mv-owner-chip"><span className="mv-owner-dot"/> Owner account<small>matravastra@gmail.com</small></div><button onClick={logout}><LogOut size={17}/> Sign out</button><a href="/">← View storefront</a></div>
    </aside>
    {mobileNav && <button aria-label="Close menu" className="mv-admin-overlay" onClick={() => setMobileNav(false)}/>}
    <section className="mv-admin-main">
      <header className="mv-admin-top"><button className="mv-mobile-menu" onClick={() => setMobileNav(true)}><Menu/></button><div><span className="mv-admin-kicker">MATRA VASTRA / ADMIN</span><h2>{current?.label}</h2></div><div className="mv-top-actions"><span className="mv-live"><i/> LIVE DATA</span><button onClick={() => load()} disabled={busy}><RefreshCw size={16} className={busy ? "mv-spin" : ""}/> Refresh</button></div></header>
      {notice && <div className="mv-admin-notice">{notice}<button onClick={() => setNotice("")}>×</button></div>}
      {busy && !stats && <div className="mv-admin-loading">Loading your store data…</div>}
      {section === "overview" && <><div className="mv-admin-welcome"><div><p className="mv-admin-kicker">YOUR STORE AT A GLANCE</p><h1>Good to see you, <span>Owner.</span></h1><p>Here is what is happening with MatraVastra today.</p></div><div className="mv-welcome-seal">MV</div></div><div className="mv-stat-grid">{[{label:"Total revenue",value:inr(stats?.revenue || 0),icon:IndianRupee},{label:"Total orders",value:stats?.orders ?? "—",icon:ShoppingBag},{label:"Products",value:stats?.products ?? "—",icon:Package},{label:"Customers",value:stats?.customers ?? "—",icon:Users},{label:"Pending orders",value:stats?.pending_orders ?? "—",icon:Clock3},{label:"Bulk enquiries",value:stats?.bulk_enquiries ?? "—",icon:MessageSquare}].map((s) => <div className="mv-stat-card" key={s.label}><div className="mv-stat-icon"><s.icon size={18}/></div><span>{s.label}</span><strong>{s.value}</strong></div>)}</div><div className="mv-admin-panel"><div className="mv-panel-head"><div><p className="mv-admin-kicker">LATEST ACTIVITY</p><h3>Recent orders</h3></div><button onClick={() => setSection("orders")}>View all →</button></div><OrdersTable rows={orders.slice(0,5)} onStatus={updateStatus}/></div></>}
      {section === "orders" && <div className="mv-admin-panel"><div className="mv-panel-head"><div><p className="mv-admin-kicker">FULFILMENT</p><h3>All orders <small>({orders.length})</small></h3></div><div className="mv-search"><Search size={16}/><input placeholder="Search order, name, phone…" value={search} onChange={(e) => setSearch(e.target.value)}/></div></div><OrdersTable rows={filteredOrders} onStatus={updateStatus}/></div>}
      {section === "products" && <div className="mv-admin-panel"><div className="mv-panel-head"><div><p className="mv-admin-kicker">CATALOGUE</p><h3>Products <small>({products.length})</small></h3></div><div className="mv-search"><Search size={16}/><input placeholder="Search products…" value={search} onChange={(e) => setSearch(e.target.value)}/></div></div><div className="mv-admin-table-wrap"><table><thead><tr><th>Product</th><th>Collection</th><th>Price</th><th>Visibility</th><th>Action</th></tr></thead><tbody>{filteredProducts.map((p) => <tr key={p.slug}><td><b>{p.name}</b><small>{p.slug}</small></td><td>{p.collection}</td><td>{inr(p.price)}</td><td><span className="mv-status confirmed">Active</span></td><td><button className="mv-table-action danger" onClick={() => deleteProduct(p.slug)}>Delete</button></td></tr>)}</tbody></table>{!filteredProducts.length && <p className="mv-empty">No products found.</p>}</div><p className="mv-admin-hint">Product creation and full editing can be added next; existing products can be reviewed and removed here.</p></div>}
      {section === "customers" && <div className="mv-admin-panel"><div className="mv-panel-head"><div><p className="mv-admin-kicker">RELATIONSHIPS</p><h3>Customers <small>({customers.length})</small></h3></div></div><DataTable headers={["Name","Phone","Email","City","Orders","Total spent"]} rows={customers.map(c => [c.name,c.phone,c.email,c.city,c.orders,inr(c.spent)])}/></div>}
      {section === "enquiries" && <div className="mv-admin-panel"><div className="mv-panel-head"><div><p className="mv-admin-kicker">B2B / BULK</p><h3>Bulk enquiries <small>({enquiries.length})</small></h3></div></div><DataTable headers={["Name","Phone","Organisation","Category","Quantity","Details"]} rows={enquiries.map(e => [e.name,e.phone,e.organization,e.category,e.quantity,e.details])}/></div>}
      <footer className="mv-admin-footer">MATRA VASTRA · PRIVATE OWNER CONSOLE <span>Built for your business</span></footer>
    </section>
  </div>;
}

function OrdersTable({ rows, onStatus }) {
  return <div className="mv-admin-table-wrap"><table><thead><tr><th>Order</th><th>Customer</th><th>Date</th><th>Total</th><th>Status</th><th>Update</th></tr></thead><tbody>{rows.map(o => <tr key={o.order_number}><td><b>{o.order_number}</b><small>{o.items?.length || 0} item(s)</small></td><td><b>{o.customer?.name}</b><small>{o.customer?.phone}</small></td><td>{o.created_at ? new Date(o.created_at).toLocaleDateString("en-IN") : "—"}</td><td>{inr(o.total || 0)}</td><td><span className={`mv-status ${o.status}`}>{o.status?.replaceAll("_"," ")}</span></td><td><select value={o.status} onChange={e => onStatus(o,e.target.value)} aria-label={`Update ${o.order_number}`}><option value="pending_payment">Pending payment</option><option value="confirmed">Confirmed</option><option value="processing">Processing</option><option value="shipped">Shipped</option><option value="delivered">Delivered</option><option value="cancelled">Cancelled</option></select></td></tr>)}</tbody></table>{!rows.length && <p className="mv-empty">No orders to show yet.</p>}</div>;
}
function DataTable({ headers, rows }) {
  return <div className="mv-admin-table-wrap"><table><thead><tr>{headers.map(h=><th key={h}>{h}</th>)}</tr></thead><tbody>{rows.map((r,i)=><tr key={i}>{r.map((v,j)=><td key={j}>{v || "—"}</td>)}</tr>)}</tbody></table>{!rows.length && <p className="mv-empty">No records found yet.</p>}</div>;
}
