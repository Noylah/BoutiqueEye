import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY
const supabase = createClient(supabaseUrl, supabaseKey)

let carrello = [];
let allProducts = [];
let selectedMethod = null;
let currentProduct = null;

const generaCodice = () => Math.floor(100000 + Math.random() * 900000).toString();

const showToast = (message, type = 'error') => {
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        container.className = "fixed top-8 right-8 z-[9999] flex flex-col gap-4 w-80";
        document.body.appendChild(container);
    }
    const toast = document.createElement('div');
    const baseClasses = "p-5 text-xs tracking-[0.2em] uppercase transition-all duration-500 border-l-2 shadow-2xl animate-slide-in";
    const typeClasses = type === 'error' ? "bg-zinc-950/90 border-red-800 text-red-500/80" : "bg-zinc-900/90 border-gold text-gold/90";
    toast.className = `${baseClasses} ${typeClasses}`;
    toast.innerHTML = message;
    container.appendChild(toast);
    setTimeout(() => {
        toast.classList.add('opacity-0', 'translate-x-full');
        setTimeout(() => toast.remove(), 500);
    }, 3000);
};

const showStatus = (message, type = 'error') => {
    const authForm = document.getElementById('auth-form');
    let container = document.getElementById('status-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'status-container';
        if (authForm) authForm.prepend(container);
    }
    const baseClasses = "p-5 mb-6 text-xs tracking-[0.2em] uppercase transition-all duration-300 border-l-2";
    const typeClasses = type === 'error' ? "bg-zinc-950/50 border-red-800 text-red-500/80" : "bg-zinc-900 border-gold text-gold/90 shadow-2xl font-sans";
    container.className = `${baseClasses} ${typeClasses}`;
    container.innerHTML = message;
};

const authForm = document.getElementById('auth-form');
if (authForm) {
    authForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const mcNick = document.getElementById('mc-nick').value.trim();
        const codice = generaCodice();
        const btn = authForm.querySelector('button[type="submit"]');
        btn.disabled = true; btn.innerText = "ATTENDERE...";
        try {
            let userId = null;
            if (window.isLoginMode) {
                const { data, error } = await supabase.from('profili').update({ codice_verifica: codice, sessione_attiva: false }).eq('mc_nickname', mcNick).select();
                if (error || !data.length) throw new Error("Utente non trovato.");
                userId = data[0].id;
            } else {
                const rpName = document.getElementById('rp-full-name')?.value.trim();
                const tgUser = document.getElementById('tg-user')?.value.trim();
                const { data, error } = await supabase.from('profili').insert([{ mc_nickname: mcNick, rp_nome_cognome: rpName, telegram_username: tgUser, codice_verifica: codice, sessione_attiva: false }]).select();
                if (error) throw new Error("Errore registrazione.");
                userId = data[0].id;
            }
            showStatus(`Codice: <b>${codice}</b>. Invialo al bot Telegram @VerificaBoutiqueEyeBot.`, 'status');
            avviaPolling(userId);
        } catch (err) {
            btn.disabled = false; btn.innerText = "CONFERMA";
            showStatus(err.message);
        }
    });
}

async function avviaPolling(userId) {
    const timer = setInterval(async () => {
        const { data } = await supabase.from('profili').select('codice_verifica, sessione_attiva').eq('id', userId).single();
        if (data && data.sessione_attiva && !data.codice_verifica) {
            clearInterval(timer);
            const { data: user } = await supabase.from('profili').select('*').eq('id', userId).single();
            localStorage.setItem('user_session', JSON.stringify(user));
            window.location.href = 'catalogo.html';
        }
    }, 2000);
}

async function initCatalogo() {
    const session = localStorage.getItem('user_session');
    if (!session) { window.location.href = 'index.html'; return; }
    const user = JSON.parse(session);
    if(document.getElementById('user-name')) document.getElementById('user-name').innerText = user.rp_nome_cognome;
    if(document.getElementById('user-avatar')) document.getElementById('user-avatar').src = `https://nmsr.nickac.dev/face/${user.mc_nickname}`;
    const { data: prodotti } = await supabase.from('prodotti').select('*');
    if (prodotti) { 
        allProducts = prodotti; 
        renderProducts(allProducts); 
        initFilters();
    }
    document.getElementById('logout-btn').onclick = () => { localStorage.removeItem('user_session'); window.location.href = 'index.html'; };
}

function renderProducts(list) {
    const grid = document.getElementById('catalog-grid');
    if (!grid) return;
    const grouped = list.reduce((acc, p) => { 
        const coll = p.collezione || "Permanent Collection"; 
        if (!acc[coll]) acc[coll] = []; 
        acc[coll].push(p); 
        return acc; 
    }, {});
    grid.innerHTML = Object.keys(grouped).map(collezione => `
        <div class="col-span-full mb-16">
            <h2 class="font-serif italic text-2xl text-gold mb-8 border-b border-gold/10 pb-4">${collezione}</h2>
            <div class="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-x-10 gap-y-12">
                ${grouped[collezione].map(p => `
                    <div class="group cursor-pointer" onclick='openProduct(${JSON.stringify(p).replace(/'/g, "&apos;")})'>
                        <div class="bg-zinc-900 aspect-[4/5] overflow-hidden flex items-center justify-center border border-zinc-800/50 group-hover:border-gold/40 transition-all duration-700 shadow-2xl relative">
                            <img src="${p.immagine_url}" class="w-full h-full object-cover transition duration-[1.5s] group-hover:scale-110 opacity-90">
                        </div>
                        <div class="mt-5 text-center">
                            <h3 class="font-serif text-sm tracking-[0.2em] uppercase text-gold">${p.nome}</h3>
                            <p class="text-white font-sans text-lg mt-1">€ ${p.prezzo.toLocaleString()}</p>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    `).join('');
}

function initFilters() {
    const filterItems = document.querySelectorAll('.filter-item');
    filterItems.forEach(item => {
        item.onclick = (e) => {
            e.preventDefault();
            filterItems.forEach(fi => {
                fi.classList.remove('text-gold', 'border-gold'); 
                fi.classList.add('text-zinc-500', 'border-transparent');
            });
            item.classList.remove('text-zinc-500', 'border-transparent');
            item.classList.add('text-gold', 'border-gold');
            const cat = item.getAttribute('data-category');
            const filtered = cat === 'tutti' ? allProducts : allProducts.filter(p => p.categoria?.toLowerCase() === cat.toLowerCase());
            renderProducts(filtered);
        };
    });
}

window.openProduct = (product) => {
    currentProduct = product;
    document.getElementById('modal-img').src = product.immagine_url;
    document.getElementById('modal-title').innerText = product.nome;
    document.getElementById('modal-price').innerText = `€ ${product.prezzo.toLocaleString()}`;
    document.getElementById('modal-category').innerText = product.categoria || 'Nessuna Categoria';
    document.getElementById('modal-collection').innerText = product.collezione || 'Nessuna Collezione';
    document.getElementById('modal-description').innerText = product.descrizione || "Nessuna descrizione.";
    document.getElementById('product-modal').classList.remove('hidden');
};

window.closeModal = () => document.getElementById('product-modal').classList.add('hidden');

window.addToCart = () => {
    if (!currentProduct) return;
    const esistente = carrello.find(item => item.id === currentProduct.id);
    if (esistente) {
        esistente.quantita += 1;
    } else {
        carrello.push({ ...currentProduct, quantita: 1 });
    }
    showToast(`${currentProduct.nome} aggiunto`, 'success');
    updateCartUI();
    closeModal();
};

window.updateQuantity = (index, delta) => {
    carrello[index].quantita += delta;
    if (carrello[index].quantita < 1) {
        removeFromCart(index);
    } else {
        updateCartUI();
        openCheckout();
    }
};

window.removeFromCart = (index) => {
    const nome = carrello[index].nome;
    carrello.splice(index, 1);
    showToast(`${nome} rimosso`, 'error');
    if (carrello.length === 0) {
        window.closeCart();
        const trigger = document.getElementById('cart-trigger');
        if(trigger) trigger.classList.add('opacity-30', 'pointer-events-none');
        if(document.getElementById('cart-count')) document.getElementById('cart-count').classList.add('hidden');
    } else {
        updateCartUI();
        openCheckout();
    }
};

function updateCartUI() {
    const count = document.getElementById('cart-count');
    const trigger = document.getElementById('cart-trigger');
    const totaleArticoli = carrello.reduce((acc, item) => acc + item.quantita, 0);
    if (count) {
        count.innerText = totaleArticoli;
        totaleArticoli > 0 ? count.classList.remove('hidden') : count.classList.add('hidden');
    }
    if (trigger) {
        if (totaleArticoli > 0) {
            trigger.classList.replace('opacity-30', 'opacity-100');
            trigger.classList.remove('pointer-events-none');
        } else {
            trigger.classList.replace('opacity-100', 'opacity-30');
            trigger.classList.add('pointer-events-none');
        }
    }
}

window.openCheckout = () => {
    if (carrello.length === 0) return;
    const container = document.getElementById('cart-items-container');
    document.getElementById('cart-modal').classList.remove('hidden');
    container.innerHTML = carrello.map((item, index) => `
        <div class="flex gap-4 items-center mb-4 border-b border-white/5 pb-4">
            <img src="${item.immagine_url}" class="w-12 h-12 object-cover border border-gold/20">
            <div class="flex-1 text-[10px] uppercase">
                <p class="text-white mb-1">${item.nome}</p>
                <p class="text-gold">€ ${item.prezzo.toLocaleString()}</p>
            </div>
            <div class="flex items-center border border-white/10 bg-black">
                <button onclick="updateQuantity(${index}, -1)" class="px-2 py-1 text-zinc-500 hover:text-white">-</button>
                <span class="px-2 text-gold font-sans text-[11px] lowercase">${item.quantita}</span>
                <button onclick="updateQuantity(${index}, 1)" class="px-2 py-1 text-zinc-500 hover:text-gold">+</button>
            </div>
            <button onclick="removeFromCart(${index})" class="text-zinc-600 hover:text-red-500 px-2 text-lg">×</button>
        </div>
    `).join('');
    const sub = carrello.reduce((acc, item) => acc + (Number(item.prezzo) * item.quantita), 0);
    document.getElementById('cart-subtotal').innerText = `€ ${sub.toLocaleString()}`;
};

window.closeCart = () => document.getElementById('cart-modal').classList.add('hidden');

window.startCheckout = () => {
    if (!currentProduct) return;
    carrello = [{...currentProduct, quantita: 1}];
    updateCartUI();
    document.getElementById('product-modal').classList.add('hidden');
    document.getElementById('checkout-modal').classList.remove('hidden');
    selectedMethod = null;
    calculateTotal(); 
};

window.goToCheckout = () => {
    document.getElementById('cart-modal').classList.add('hidden');
    document.getElementById('checkout-modal').classList.remove('hidden');
    selectedMethod = null;
    calculateTotal();
};

window.selectDelivery = (method) => {
    selectedMethod = method;
    const isConsegna = method === 'consegna';
    const btnRitiro = document.getElementById('btn-ritiro');
    const btnConsegna = document.getElementById('btn-consegna');
    btnRitiro.className = "flex-1 py-4 border border-white/10 text-zinc-500 text-[10px] uppercase tracking-widest transition-all hover:bg-white/5";
    btnConsegna.className = "flex-1 py-4 border border-white/10 text-zinc-500 text-[10px] uppercase tracking-widest transition-all hover:bg-white/5";
    if (isConsegna) {
        btnConsegna.classList.add('border-gold', 'bg-gold/10', 'text-gold');
        btnConsegna.classList.remove('text-zinc-500', 'border-white/10');
    } else {
        btnRitiro.classList.add('border-gold', 'bg-gold/10', 'text-gold');
        btnRitiro.classList.remove('text-zinc-500', 'border-white/10');
    }
    document.getElementById('address-container').classList.toggle('hidden', !isConsegna);
    document.getElementById('confirm-purchase-btn').disabled = false;
    calculateTotal();
};

function calculateTotal() {
    if (!carrello || carrello.length === 0) {
        if(document.getElementById('checkout-total')) document.getElementById('checkout-total').innerText = "€ 0";
        return;
    }
    const subtotal = carrello.reduce((acc, item) => acc + (Number(item.prezzo) * item.quantita), 0);
    const finalPrice = selectedMethod === 'consegna' ? subtotal * 1.15 : subtotal;
    const totalEl = document.getElementById('checkout-total');
    if (totalEl) totalEl.innerText = `€ ${Math.round(finalPrice).toLocaleString()}`;
}

window.processOrder = async () => {
    const user = JSON.parse(localStorage.getItem('user_session'));
    const subtotal = carrello.reduce((acc, item) => acc + (Number(item.prezzo) * item.quantita), 0);
    const finalPrice = selectedMethod === 'consegna' ? subtotal * 1.15 : subtotal;
    const address = document.getElementById('delivery-address').value;
    if (selectedMethod === 'consegna' && !address) {
        showToast("Inserisci coordinate", 'error');
        return;
    }
    const { error } = await supabase.from('ordini').insert([{
        utente_id: user.id,
        metodo_consegna: selectedMethod,
        indirizzo_coordinate: selectedMethod === 'consegna' ? address : 'Ritiro in sede',
        prezzo_finale: Math.round(finalPrice),
        lista_prodotti: carrello
    }]);
    if (!error) {
        showToast("Ordine Confermato", 'success');
        carrello = [];
        setTimeout(() => window.location.reload(), 1500);
    } else {
        showToast("Errore durante l'invio", 'error');
    }
};

window.openOrdersModal = async () => {
    const session = localStorage.getItem('user_session');
    if (!session) return;
    const user = JSON.parse(session);
    const container = document.getElementById('orders-container');
    document.getElementById('orders-modal').classList.remove('hidden');
    container.innerHTML = '<p class="text-[10px] uppercase text-center text-zinc-600 animate-pulse tracking-widest py-20">Accesso ai registri...</p>';
    const { data: ordini, error } = await supabase.from('ordini').select('*').eq('utente_id', user.id).order('created_at', { ascending: false });
    if (error || !ordini || ordini.length === 0) {
        container.innerHTML = '<p class="text-[10px] uppercase text-center text-zinc-500 italic py-20">Nessun ordine trovato.</p>';
        return;
    }
    container.innerHTML = ordini.map(o => {
        const prodotti = o.lista_prodotti ?? [];
        const data = new Date(o.created_at).toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit', year: 'numeric' });
        const stato = o.stato || "In Preparazione";
        let statoClass = "text-zinc-400 border-zinc-500/30";
        if (stato === "In Preparazione") statoClass = "text-blue-400 border-blue-500/30 bg-blue-500/5";
        if (stato === "Pronto") statoClass = "text-emerald-400 border-emerald-500/30 bg-emerald-500/5";
        if (stato === "Rifiutato") statoClass = "text-red-400 border-red-500/30 bg-red-500/5";
        
        return `
            <div class="flex flex-col md:grid md:grid-cols-12 gap-y-4 md:gap-4 items-start md:items-center py-5 md:py-6 border-b border-white/5 hover:bg-white/[0.02] transition-all px-4 md:px-2 group bg-white/[0.02] md:bg-transparent rounded-lg md:rounded-none">
                
                <div class="w-full md:col-span-2 flex justify-between items-center md:block">
                    <span class="text-[11px] text-zinc-500 font-mono">${data}</span>
                    <span class="md:hidden text-[9px] uppercase tracking-widest border px-2 py-0.5 rounded-full font-bold ${statoClass}">${stato}</span>
                </div>

                <div class="w-full md:col-span-5 mt-2 md:mt-0">
                    <div class="flex flex-wrap gap-2 md:gap-1">
                        ${prodotti.map(p => `
                            <span class="text-[10px] text-white uppercase tracking-tighter bg-zinc-900 border border-white/10 px-2 py-1 md:py-0.5 rounded-sm flex items-center gap-1.5 md:inline-block">
                                <span class="text-gold lowercase text-[9px]">x${p.quantita}</span> ${p.nome}
                            </span>
                        `).join('')}
                    </div>
                </div>

                <div class="hidden md:block col-span-2 text-center">
                    <span class="text-[9px] uppercase tracking-widest border px-3 py-1 rounded-full font-bold ${statoClass}">${stato}</span>
                </div>

                <div class="w-full md:contents flex justify-between items-end mt-4 md:mt-0 border-t border-white/5 md:border-0 pt-3 md:pt-0">
                    <div class="md:col-span-1 text-left md:text-center">
                         <span class="text-[9px] text-zinc-600 md:hidden uppercase mr-2">Metodo:</span>
                         <span class="text-[10px] text-zinc-500 uppercase">${o.metodo_consegna === 'ritiro' ? 'Ritiro' : 'Consegna'}</span>
                    </div>

                    <div class="md:col-span-2 text-right">
                        <span class="text-gold font-sans font-bold tracking-tighter text-sm md:text-base">€ ${o.prezzo_finale.toLocaleString()}</span>
                    </div>
                </div>
            </div>
        `;
    }).join('');
};

window.closeOrdersModal = () => document.getElementById('orders-modal').classList.add('hidden');
window.closeCheckout = () => document.getElementById('checkout-modal').classList.add('hidden');

if (window.location.pathname.includes('catalogo.html')) {
    initCatalogo();
}