
import React, { useState, useEffect } from 'react';
import { View, Product, CartItem, Order, User } from './types';
import { PRODUCTS, INITIAL_ORDERS } from './constants';

// --- Componenti UI di Lusso ---

const GoldButton: React.FC<{ onClick?: () => void; children: React.ReactNode; className?: string; type?: "button" | "submit" }> = ({ onClick, children, className, type = "button" }) => (
  <button 
    type={type}
    onClick={onClick}
    className={`relative group overflow-hidden bg-primary text-background-dark font-bold py-4 px-8 rounded-sm uppercase tracking-[0.2em] transition-all hover:bg-white hover:shadow-[0_0_30px_rgba(212,175,55,0.4)] ${className}`}
  >
    <span className="relative z-10 flex items-center justify-center gap-2">{children}</span>
    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
  </button>
);

const Navbar: React.FC<{ 
  currentView: View; 
  setView: (v: View) => void;
  cartCount: number;
  user: User | null;
  onLogout: () => void;
}> = ({ currentView, setView, cartCount, user, onLogout }) => {
  // Nascondi la navbar nella landing o durante il login
  if (!user && (currentView === View.LANDING || currentView.toString().includes('login'))) return null;

  const isStaff = user?.role === 'Staff' || user?.role === 'Manager';

  return (
    <nav className="fixed w-full z-50 bg-background-dark/80 backdrop-blur-xl border-b border-primary/20 h-20 flex items-center">
      <div className="max-w-7xl mx-auto px-6 w-full flex items-center justify-between">
        <div className="flex items-center cursor-pointer" onClick={() => setView(isStaff ? View.STAFF : View.CATALOG)}>
          <span className="font-accent font-bold text-2xl tracking-[0.3em] text-white">
            BOUTIQUE<span className="text-primary">EYE</span>
          </span>
        </div>
        
        <div className="hidden md:flex items-center space-x-10">
          {!isStaff ? (
            // Menu Cliente
            <>
              {[
                { id: View.CATALOG, label: 'Collezioni' },
                { id: View.FIDELITY, label: 'Fidelity' }
              ].map(item => (
                <button 
                  key={item.id}
                  onClick={() => setView(item.id)}
                  className={`uppercase text-[10px] font-bold tracking-[0.2em] transition-all hover:text-primary ${currentView === item.id ? 'text-primary border-b border-primary pb-1' : 'text-gray-400'}`}
                >
                  {item.label}
                </button>
              ))}
            </>
          ) : (
            // Menu Staff
            <div className="flex items-center gap-2">
              <span className="material-icons-outlined text-primary text-sm">admin_panel_settings</span>
              <span className="text-primary uppercase text-[10px] font-bold tracking-[0.3em]">Operativo Interno</span>
            </div>
          )}
        </div>

        <div className="flex items-center space-x-8">
          {!isStaff && (
            <button onClick={() => setView(View.CART)} className="relative text-gray-400 hover:text-primary transition-colors">
              <span className="material-icons-outlined text-2xl">shopping_bag</span>
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary text-background-dark text-[9px] font-black h-4 w-4 rounded-full flex items-center justify-center border border-background-dark">
                  {cartCount}
                </span>
              )}
            </button>
          )}
          
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-white text-[10px] font-bold uppercase tracking-wider">{user?.rpName}</p>
              <p className="text-primary text-[8px] font-bold uppercase tracking-widest">
                {isStaff ? 'Staff Identity' : `${user?.tier} Member`}
              </p>
            </div>
            <button onClick={onLogout} className="text-gray-600 hover:text-red-500 transition-colors flex items-center gap-1 group">
              <span className="material-icons-outlined text-xl">logout</span>
              <span className="text-[9px] uppercase font-bold tracking-widest hidden group-hover:block">Esci</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

// --- Viste Pubbliche ---

const LandingView: React.FC<{ setView: (v: View) => void }> = ({ setView }) => (
  <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-black">
    <div className="absolute inset-0 z-0">
      <img 
        src="https://images.unsplash.com/photo-1549439602-43ebca2327af?auto=format&fit=crop&q=80&w=2000" 
        className="w-full h-full object-cover opacity-20 scale-105"
        alt="Lusso Background"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-black"></div>
    </div>
    
    <div className="relative z-10 text-center space-y-12 max-w-4xl px-6">
      <div className="space-y-4">
        <h2 className="text-primary font-accent text-xs tracking-[0.5em] uppercase">Atlantis RP • Elite Selection</h2>
        <h1 className="text-7xl md:text-9xl font-display font-bold text-white leading-none tracking-tighter">
          BOUTIQUE<br/><span className="gold-shimmer bg-clip-text text-transparent italic">EYE</span>
        </h1>
        <div className="h-0.5 w-32 bg-primary mx-auto mt-12"></div>
      </div>
      
      <p className="text-gray-400 font-light text-lg md:text-xl tracking-wide max-w-2xl mx-auto leading-relaxed">
        L'ingresso è riservato ai cittadini di alto profilo. Gioielleria di lusso e alta moda per chi non accetta compromessi.
      </p>
      
      <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-8">
        <GoldButton onClick={() => setView(View.LOGIN_CLIENT)}>
          Accesso Clienti
        </GoldButton>
        <button 
          onClick={() => setView(View.LOGIN_STAFF)}
          className="text-gray-500 hover:text-white text-[10px] font-bold uppercase tracking-[0.3em] transition-all py-4 px-8 border border-white/5 hover:border-primary/20 bg-white/5"
        >
          Portale Staff Interno
        </button>
      </div>
    </div>
  </div>
);

const LoginView: React.FC<{ type: 'client' | 'staff', onLogin: (u: User) => void, setView: (v: View) => void }> = ({ type, onLogin, setView }) => {
  const [loading, setLoading] = useState(false);
  const [id, setId] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      onLogin({
        id: id,
        nickname: id,
        rpName: type === 'staff' ? 'Operatore ' + id : 'Cittadino ' + id,
        role: type === 'staff' ? 'Staff' : 'User',
        points: type === 'staff' ? 0 : 5000,
        tier: type === 'staff' ? 'Regular' : 'Gold'
      });
      setLoading(false);
    }, 1200);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background-dark p-6">
      <div className="w-full max-w-md bg-surface-dark border border-primary/20 p-10 relative shadow-2xl rounded-sm">
        <button onClick={() => setView(View.LANDING)} className="absolute top-8 left-8 text-gray-600 hover:text-primary transition-colors">
          <span className="material-icons-outlined">arrow_back</span>
        </button>
        
        <div className="text-center mb-12">
          <h2 className="text-primary font-accent text-[10px] tracking-[0.5em] uppercase mb-4">
            {type === 'staff' ? 'Area Riservata Operatori' : 'Private Clients Gate'}
          </h2>
          <h1 className="text-3xl font-display text-white">
            {type === 'staff' ? 'Login Staff' : 'Autenticazione'}
          </h1>
        </div>

        <form onSubmit={handleLogin} className="space-y-8">
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">
              {type === 'staff' ? 'Badge ID' : 'Codice Cittadino (CID)'}
            </label>
            <input 
              required
              value={id}
              onChange={(e) => setId(e.target.value)}
              className="w-full bg-black border border-white/10 text-white p-4 outline-none focus:border-primary transition-all text-sm rounded-sm"
              placeholder={type === 'staff' ? 'es. STF-001' : 'es. 22415'}
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">
              {type === 'staff' ? 'Master Key' : 'Secret Password'}
            </label>
            <input 
              required
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-black border border-white/10 text-white p-4 outline-none focus:border-primary transition-all text-sm rounded-sm"
              placeholder="••••••••"
            />
          </div>
          
          <GoldButton type="submit" className="w-full">
            {loading ? 'Verifica Credenziali...' : 'Inizializza Sessione'}
          </GoldButton>
        </form>
        
        <p className="text-[9px] text-gray-700 text-center mt-12 uppercase tracking-widest leading-relaxed px-4">
          L'accesso è monitorato. Ogni violazione sarà segnalata al comando centrale di Atlantis RP.
        </p>
      </div>
    </div>
  );
};

// --- Viste Private ---

const CatalogView: React.FC<{ addToCart: (p: Product) => void }> = ({ addToCart }) => {
  const [filter, setFilter] = useState('Tutti');
  const categories = ['Tutti', 'Gioielleria', 'Orologeria', 'Alta Moda'];
  const filtered = filter === 'Tutti' ? PRODUCTS : PRODUCTS.filter(p => p.category === filter);

  return (
    <div className="pt-32 pb-20 px-6 max-w-7xl mx-auto">
      <div className="flex flex-col lg:flex-row gap-16">
        <aside className="w-full lg:w-64 space-y-12 shrink-0">
          <div className="space-y-6">
            <h3 className="font-accent text-white text-xs tracking-[0.3em] uppercase border-b border-primary/30 pb-3">Sezioni</h3>
            <ul className="space-y-5">
              {categories.map(c => (
                <li key={c}>
                  <button 
                    onClick={() => setFilter(c)}
                    className={`text-[11px] font-bold uppercase tracking-[0.2em] transition-all flex items-center justify-between w-full group ${filter === c ? 'text-primary' : 'text-gray-600 hover:text-white'}`}
                  >
                    {c}
                    <span className={`material-icons-outlined text-sm ${filter === c ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>chevron_right</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-surface-dark p-8 border border-primary/20 rounded-sm shadow-xl">
            <h4 className="text-white font-display text-xl mb-3">Boutique Tips</h4>
            <div className="text-[11px] text-gray-400 font-light italic leading-relaxed border-l border-primary/30 pl-4">
              "L'eleganza non è farsi notare, ma farsi ricordare." Scegli con cura i tuoi pezzi per definire il tuo status ad Atlantis.
            </div>
          </div>
        </aside>

        <div className="flex-1">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-12">
            {filtered.map(p => (
              <div key={p.id} className="group cursor-pointer">
                <div className="aspect-[3/4] overflow-hidden bg-black border border-white/5 relative group-hover:border-primary/50 transition-all duration-700 shadow-2xl">
                  <img src={p.image} className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-1000 opacity-80 group-hover:opacity-100" alt={p.name} />
                  <div className="absolute inset-0 bg-background-dark/90 flex flex-col items-center justify-center p-10 opacity-0 group-hover:opacity-100 transition-all duration-500 text-center">
                    <p className="text-white text-xs font-light mb-8 leading-relaxed">{p.description}</p>
                    {!p.outOfStock ? (
                      <button onClick={() => addToCart(p)} className="w-full bg-primary text-background-dark text-[10px] font-black uppercase tracking-[0.3em] py-4 transition-all hover:bg-white">
                        Prenota Pezzo
                      </button>
                    ) : (
                      <span className="text-red-500 uppercase text-[10px] font-bold tracking-widest border border-red-500/20 px-6 py-3">Esaurito</span>
                    )}
                  </div>
                </div>
                <div className="mt-8 text-center">
                  <h3 className="text-white font-display text-2xl mb-2 tracking-tight">{p.name}</h3>
                  <p className="text-primary font-mono text-xl font-bold tracking-tighter">${p.price.toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// --- App Root ---

const App: React.FC = () => {
  const [view, setView] = useState<View>(View.LANDING);
  const [user, setUser] = useState<User | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);

  const isStaff = user?.role === 'Staff' || user?.role === 'Manager';

  // Protezione Rotte
  useEffect(() => {
    const isPublic = [View.LANDING, View.LOGIN_CLIENT, View.LOGIN_STAFF].includes(view);
    if (!user && !isPublic) {
      setView(View.LANDING);
    }
    // Se lo staff prova ad accedere a catalog/cart/fidelity, lo rimandiamo alla dashboard
    if (user && isStaff && [View.CATALOG, View.CART, View.FIDELITY].includes(view)) {
      setView(View.STAFF);
    }
  }, [view, user, isStaff]);

  const handleLogin = (u: User) => {
    setUser(u);
    setView(u.role === 'Staff' || u.role === 'Manager' ? View.STAFF : View.CATALOG);
  };

  const handleLogout = () => {
    setUser(null);
    setView(View.LANDING);
    setCart([]);
  };

  const addToCart = (p: Product) => {
    setCart(prev => {
      const ex = prev.find(i => i.id === p.id);
      if (ex) return prev.map(i => i.id === p.id ? { ...i, quantity: i.quantity + 1 } : i);
      return [...prev, { ...p, quantity: 1 }];
    });
  };

  return (
    <div className="min-h-screen bg-background-dark selection:bg-primary selection:text-background-dark">
      <Navbar 
        currentView={view} 
        setView={setView} 
        cartCount={cart.reduce((a, b) => a + b.quantity, 0)} 
        user={user}
        onLogout={handleLogout}
      />
      
      <main className="min-h-screen">
        {view === View.LANDING && <LandingView setView={setView} />}
        {view === View.LOGIN_CLIENT && <LoginView type="client" onLogin={handleLogin} setView={setView} />}
        {view === View.LOGIN_STAFF && <LoginView type="staff" onLogin={handleLogin} setView={setView} />}
        
        {user && !isStaff && (
          <div className="animate-in fade-in duration-700">
            {view === View.CATALOG && <CatalogView addToCart={addToCart} />}
            {view === View.CART && (
              <div className="pt-32 pb-20 px-6 max-w-4xl mx-auto">
                <div className="text-center mb-16">
                  <h1 className="text-6xl font-display text-white italic mb-2">Il Sacco</h1>
                  <p className="text-primary text-[10px] uppercase tracking-[0.4em]">Review della tua selezione</p>
                </div>
                {cart.length === 0 ? (
                  <div className="text-center py-20 border border-white/5 bg-white/5">
                    <p className="text-gray-600 text-sm font-light italic">Il tuo sacco è vuoto.</p>
                  </div>
                ) : (
                  <div className="space-y-10">
                    {cart.map(i => (
                      <div key={i.id} className="flex justify-between items-center border-b border-white/10 pb-6">
                        <div className="text-left">
                          <p className="text-white font-display text-xl">{i.name}</p>
                          <p className="text-primary text-[10px] tracking-widest mt-1">Q.TÀ: {i.quantity}</p>
                        </div>
                        <p className="text-primary font-mono text-lg font-bold">${(i.price * i.quantity).toLocaleString()}</p>
                      </div>
                    ))}
                    <GoldButton className="w-full">Invia Richiesta allo Staff</GoldButton>
                  </div>
                )}
              </div>
            )}
            {view === View.FIDELITY && (
              <div className="pt-32 pb-20 px-6 max-w-5xl mx-auto">
                 <div className="bg-surface-dark border border-primary/40 p-16 rounded-sm relative overflow-hidden">
                    <h1 className="text-7xl font-display text-white font-bold tracking-tighter uppercase mb-12">{user.tier} STATUS</h1>
                    <div className="flex justify-between items-end">
                       <p className="text-3xl text-white font-accent uppercase tracking-widest">{user.rpName}</p>
                       <p className="text-7xl text-primary font-mono font-bold tracking-tighter">{user.points.toLocaleString()} PT</p>
                    </div>
                 </div>
              </div>
            )}
          </div>
        )}

        {user && isStaff && (
          <div className="animate-in fade-in duration-700">
            {view === View.STAFF && (
              <div className="pt-32 pb-20 px-6 max-w-7xl mx-auto space-y-16">
                <header className="flex flex-col md:flex-row justify-between items-end gap-8 border-b border-primary/20 pb-10">
                   <div>
                      <h1 className="text-5xl font-display text-white italic">Staff <span className="text-primary">Dashboard</span></h1>
                      <p className="text-gray-500 text-[11px] uppercase tracking-[0.4em] mt-3">Area Operativa Riservata BoutiqueEye</p>
                   </div>
                   <div className="flex gap-4">
                      <div className="bg-surface-dark border border-white/5 px-8 py-4 text-center">
                         <p className="text-gray-600 text-[9px] uppercase tracking-widest mb-1">Stato Sistema</p>
                         <p className="text-green-500 font-mono font-bold text-xl uppercase tracking-widest">Attivo</p>
                      </div>
                   </div>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                   {INITIAL_ORDERS.map(o => (
                     <div key={o.id} className="bg-surface-dark p-8 border border-white/5 flex flex-col justify-between hover:border-primary/20 transition-all">
                        <div className="space-y-6">
                           <div className="flex justify-between">
                              <p className="text-white font-mono text-sm font-bold tracking-tighter">ORD-{o.id}</p>
                              <span className="text-[8px] font-black uppercase tracking-widest px-3 py-1 rounded-sm border bg-primary/20 text-primary border-primary/40">{o.status}</span>
                           </div>
                           <p className="text-white font-display text-lg tracking-wide uppercase">{o.customerName}</p>
                           <div className="space-y-2">
                              {o.items.map((it, idx) => (
                                <div key={idx} className="flex justify-between text-[10px] text-gray-500">
                                   <span>{it.quantity}x {it.name}</span>
                                   <span className="text-white">${it.price.toLocaleString()}</span>
                                </div>
                              ))}
                           </div>
                        </div>
                        <div className="pt-8 mt-8 border-t border-dashed border-white/10 flex flex-col gap-6">
                           <div className="flex justify-between items-baseline">
                              <p className="text-primary font-mono text-2xl font-bold">${o.total.toLocaleString()}</p>
                           </div>
                           <button className="w-full bg-white/5 hover:bg-white/10 text-[10px] font-bold text-gray-400 uppercase py-4 border border-white/5">Gestisci Pratica</button>
                        </div>
                     </div>
                   ))}
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {view !== View.LANDING && !view.toString().includes('login') && (
        <footer className="border-t border-white/5 py-16 px-6 mt-20">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-10">
            <div className="text-center md:text-left">
              <span className="font-accent font-bold text-lg text-white tracking-[0.3em]">BOUTIQUE<span className="text-primary">EYE</span></span>
              <p className="text-[9px] text-gray-700 uppercase tracking-[0.3em] mt-3">© 2024 Atlantis RP Luxury Experience.</p>
            </div>
            <p className="text-[10px] text-gray-800 uppercase tracking-[0.4em] font-bold italic">Riservatezza • Eleganza • Potere</p>
          </div>
        </footer>
      )}
    </div>
  );
};

export default App;
