import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY
const supabase = createClient(supabaseUrl, supabaseKey)

let carrello = [];
let allProducts = [];
let selectedMethod = null;
let currentProduct = null;
let scontoAttivo = 0;
let usatoScontoInSessione = false;

const LIVELLI_FIDELITY = [
    { nome: 'Bronzo', soglia: 0, sconto: 0 },
    { nome: 'Argento', soglia: 500, sconto: 5 },
    { nome: 'Oro', soglia: 1000, sconto: 10 },
    { nome: 'Platino', soglia: 2500, sconto: 15 },
    { nome: 'Diamante', soglia: 5000, sconto: 20 }
];

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

const handleStaffLogin = async (nickname, password) => {
    const fullEmail = `${nickname.toLowerCase()}@boutiqueye.it`;
    try {
        const { data, error } = await supabase.auth.signInWithPassword({
            email: fullEmail,
            password: password,
        });
        if (error) throw error;

        const role = data.user.user_metadata.role || 'manager'; 
        
        localStorage.setItem('staff_session', JSON.stringify(data.session));
        localStorage.setItem('staff_role', role);

        window.location.href = 'dashboard-staff.html';
    } catch (error) {
        showStatus("Accesso Staff negato: " + error.message);
    }
};

function applyPermissions() {
    const role = localStorage.getItem('staff_role');
    
    const sezOrdini = document.getElementById('section-orders');
    const sezBilancio = document.getElementById('section-finance');
    const sezStaff = document.getElementById('section-staff-management');

    if (role === 'contabile') {
        if(sezOrdini) sezOrdini.classList.add('hidden');
        if(sezStaff) sezStaff.classList.add('hidden');
        if(sezBilancio) sezBilancio.classList.remove('hidden');
    } 
    else if (role === 'manager' || role === 'vice_direttore') {
        if(sezBilancio) sezBilancio.classList.add('hidden');
        if(sezStaff) sezStaff.classList.add('hidden');
        if(sezOrdini) sezOrdini.classList.remove('hidden');
    }
    else if (role === 'direttore') {
        document.querySelectorAll('.admin-section').forEach(s => s.classList.remove('hidden'));
    }
}

const authForm = document.getElementById('auth-form');
if (authForm) {
    authForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const mcNick = document.getElementById('mc-nick').value.trim();
        const mode = window.authMode || (window.isLoginMode ? 'login' : 'register');
        
        if (mode === 'staff') {
            const password = document.getElementById('staff-pass').value;
            await handleStaffLogin(mcNick, password);
            return;
        }

        const codiceGenerato = generaCodice();
        const btn = authForm.querySelector('button[type="submit"]');
        btn.disabled = true; btn.innerText = "ATTENDERE...";

        try {
            let userId = null;

            if (mode === 'login') {
                const { data: users } = await supabase.from('profili').select('id').ilike('mc_nickname', mcNick);
                if (!users || users.length === 0) throw new Error("Utente non trovato.");
                userId = users[0].id;

                // RESET MANUALE PRIMA DI PARTIRE
                const { error: resetErr } = await supabase
                    .from('profili')
                    .update({ codice_verifica: codiceGenerato, sessione_attiva: false })
                    .eq('id', userId);
                
                if (resetErr) throw new Error("Errore reset sessione.");

            } else {
                // REGISTRAZIONE
                const rpName = document.getElementById('rp-full-name')?.value.trim();
                const tgUser = document.getElementById('tg-user')?.value.trim();
                const { data, error } = await supabase.from('profili').insert([{ 
                    mc_nickname: mcNick, 
                    rp_nome_cognome: rpName, 
                    telegram_username: tgUser, 
                    codice_verifica: codiceGenerato, 
                    sessione_attiva: false 
                }]).select();
                if (error) throw new Error("Errore registrazione.");
                userId = data[0].id;
            }

            showStatus(`Codice: <b>${codiceGenerato}</b>. Invialo al bot @VerificaBoutiqueEyeBot.`, 'status');
            
            // Passiamo il codice appena generato al polling per un controllo DOPPIO
            avviaPolling(userId, codiceGenerato);

        } catch (err) {
            btn.disabled = false; btn.innerText = "CONFERMA";
            showStatus(err.message);
        }
    });
}

async function avviaPolling(userId, codiceAppenaGenerato) {
    console.log("=== POLLING BLINDATO AVVIATO ===");
    console.log("ID Utente:", userId);
    console.log("Codice che DEVE essere nel DB:", codiceAppenaGenerato);
    
    const timer = setInterval(async () => {
        const { data, error } = await supabase
            .from('profili')
            .select('codice_verifica, sessione_attiva')
            .eq('id', userId)
            .single();

        if (error) return;

        // LOG DI DEBUG PER CAPIRE CHI SBAGLIA
        console.log("Controllo DB... Codice trovato:", data.codice_verifica, "Sessione:", data.sessione_attiva);

        // LA LOGICA INVALICABILE:
        // Entri SOLO SE la sessione è true E il codice è sparito (NULL) o svuotato dal Bot.
        // Se la sessione è true ma il codice è ancora quello vecchio (codiceAppenaGenerato),
        // significa che è un vecchio login rimasto appeso e il sito DEVE IGNORARLO.
        
        const botHaEffettivamenteAgito = data.sessione_attiva === true && 
                                       (data.codice_verifica === null || data.codice_verifica === "");

        if (botHaEffettivamenteAgito) {
            console.log("!!! ACCESSO LEGITTIMO RILEVATO !!!");
            clearInterval(timer);
            
            const { data: user } = await supabase.from('profili').select('*').eq('id', userId).single();
            localStorage.setItem('user_session', JSON.stringify(user));
            
            showStatus("Verifica riuscita!", "status");
            setTimeout(() => window.location.href = 'catalogo.html', 500);
        } else {
            console.log("In attesa del Bot... (Se leggi Sessione: true qui, il Bot sta sbagliando)");
        }
    }, 2000);
}

function getScontoLivello(punti) {
    let sconto = 0;
    for (let i = LIVELLI_FIDELITY.length - 1; i >= 0; i--) {
        if (punti >= LIVELLI_FIDELITY[i].soglia) {
            sconto = LIVELLI_FIDELITY[i].sconto;
            break;
        }
    }
    return sconto;
}

window.applyFidelityCode = async () => {
    const code = document.getElementById('fidelity-code-input').value.trim().toUpperCase();
    const msg = document.getElementById('fidelity-msg');
    if (!code) return;
    const { data: user, error } = await supabase.from('profili').select('punti_totali, ultimo_sconto_usato').eq('codice_sconto_fidelity', code).single();
    if (error || !user) {
        msg.innerText = "Codice non valido";
        msg.className = "text-[9px] uppercase tracking-widest mt-2 text-red-500 block";
        scontoAttivo = 0;
        calculateTotal();
        return;
    }
    const ultimaData = user.ultimo_sconto_usato ? new Date(user.ultimo_sconto_usato) : null;
    const oggi = new Date();
    const diffDays = ultimaData ? (oggi - ultimaData) / (1000 * 60 * 60 * 24) : 999;
    if (diffDays < 7) {
        msg.innerText = `Coupon già usato. Disponibile tra ${Math.ceil(7 - diffDays)} giorni`;
        msg.className = "text-[9px] uppercase tracking-widest mt-2 text-orange-500 block";
        scontoAttivo = 0;
    } else {
        scontoAttivo = getScontoLivello(user.punti_totali);
        usatoScontoInSessione = true;
        msg.innerText = `Sconto ${scontoAttivo}% attivato`;
        msg.className = "text-[9px] uppercase tracking-widest mt-2 text-gold block";
        document.getElementById('discount-applied-label').classList.remove('hidden');
    }
    calculateTotal();
};

async function initCatalogo() {
    const session = localStorage.getItem('user_session');
    if (!session) { window.location.href = 'index.html'; return; }
    const user = JSON.parse(session);
    const { data: updatedUser } = await supabase.from('profili').select('*').eq('id', user.id).single();
    if (updatedUser) localStorage.setItem('user_session', JSON.stringify(updatedUser));
    const currentUser = updatedUser || user;
    if(document.getElementById('user-name')) document.getElementById('user-name').innerText = currentUser.rp_nome_cognome;
    if(document.getElementById('user-avatar')) document.getElementById('user-avatar').src = `https://nmsr.nickac.dev/face/${currentUser.mc_nickname}`;
    const { data: prodotti } = await supabase.from('prodotti').select('*');
    if (prodotti) { 
        allProducts = prodotti; 
        renderProducts(allProducts); 
        initFilters();
    }
    document.getElementById('logout-btn').onclick = async () => {
    const session = localStorage.getItem('user_session');
    if (session) {
        const user = JSON.parse(session);
        await supabase
            .from('profili')
            .update({ sessione_attiva: false, codice_verifica: null })
            .eq('id', user.id);
    }
    localStorage.removeItem('user_session');
    window.location.href = 'index.html';
};
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
                            <div class="absolute top-2 right-2 bg-black/60 px-2 py-1 border border-gold/20">
                                <p class="text-[9px] text-gold uppercase tracking-widest">+${p.punti_valore || 0} pts</p>
                            </div>
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
    
    const colorContainer = document.getElementById('modal-colors-container');
    const colorWrapper = document.getElementById('modal-colors-wrapper');
    
    if (product.colori && colorWrapper) {
        const listaColori = Array.isArray(product.colori) 
            ? product.colori 
            : product.colori.split(',').map(c => c.trim());

        colorWrapper.innerHTML = listaColori.map(hex => `
            <div class="w-8 h-8 rounded-full border border-white/10 shadow-inner" 
                 style="background-color: ${hex};" 
                 title="${hex}">
            </div>
        `).join('');
        colorContainer.classList.remove('hidden');
    } else if (colorContainer) {
        colorContainer.classList.add('hidden');
    }

    document.getElementById('product-modal').classList.remove('hidden');
};

window.closeModal = () => {
    const productModal = document.getElementById('product-modal');
    const authModal = document.getElementById('modal-wrapper'); 
    
    if (productModal) productModal.classList.add('hidden');
    if (authModal) authModal.classList.add('hidden');
    
    currentProduct = null;
};

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
    scontoAttivo = 0;
    usatoScontoInSessione = false;
    calculateTotal(); 
};

window.goToCheckout = () => {
    document.getElementById('cart-modal').classList.add('hidden');
    document.getElementById('checkout-modal').classList.remove('hidden');
    selectedMethod = null;
    scontoAttivo = 0;
    usatoScontoInSessione = false;
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
    let subtotal = 0;
    let scontatiCount = 0;
    const listaEspansa = [];
    carrello.forEach(item => {
        for(let i=0; i<item.quantita; i++) listaEspansa.push(Number(item.prezzo));
    });
    listaEspansa.sort((a, b) => b - a);
    listaEspansa.forEach(prezzo => {
        if (scontoAttivo > 0 && scontatiCount < 5) {
            subtotal += prezzo * (1 - scontoAttivo / 100);
            scontatiCount++;
        } else {
            subtotal += prezzo;
        }
    });
    const finalPrice = selectedMethod === 'consegna' ? subtotal * 1.15 : subtotal;
    const totalEl = document.getElementById('checkout-total');
    if (totalEl) totalEl.innerText = `€ ${Math.round(finalPrice).toLocaleString()}`;
}

function calcolaPuntiCarrello(articoli) {
    return articoli.reduce((acc, item) => acc + (Number(item.punti_valore || 0) * item.quantita), 0);
}

window.processOrder = async () => {
    const user = JSON.parse(localStorage.getItem('user_session'));
    const address = document.getElementById('delivery-address').value;
    if (selectedMethod === 'consegna' && !address) {
        showToast("Inserisci coordinate", 'error');
        return;
    }
    let subtotal = 0;
    let scontatiCount = 0;
    const listaEspansa = [];
    carrello.forEach(item => {
        for(let i=0; i<item.quantita; i++) listaEspansa.push(Number(item.prezzo));
    });
    listaEspansa.sort((a, b) => b - a);
    listaEspansa.forEach(prezzo => {
        if (scontoAttivo > 0 && scontatiCount < 5) {
            subtotal += prezzo * (1 - scontoAttivo / 100);
            scontatiCount++;
        } else {
            subtotal += prezzo;
        }
    });
    const finalPrice = Math.round(selectedMethod === 'consegna' ? subtotal * 1.15 : subtotal);
    const puntiGenerati = calcolaPuntiCarrello(carrello);
    const { error: orderError } = await supabase.from('ordini').insert([{
        utente_id: user.id,
        metodo_consegna: selectedMethod,
        indirizzo_coordinate: selectedMethod === 'consegna' ? address : 'Ritiro in sede',
        prezzo_finale: finalPrice,
        lista_prodotti: carrello,
        punti_generati: puntiGenerati
    }]);
    if (!orderError) {
        if (usatoScontoInSessione && scontoAttivo > 0) {
            await supabase.from('profili').update({ ultimo_sconto_usato: new Date().toISOString() }).eq('id', user.id);
        }
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
window.closeCheckout = () => {
    document.getElementById('checkout-modal').classList.add('hidden');
    scontoAttivo = 0;
    usatoScontoInSessione = false;
    const msg = document.getElementById('fidelity-msg');
    const label = document.getElementById('discount-applied-label');
    if(msg) msg.classList.add('hidden');
    if(label) label.classList.add('hidden');
};

if (window.location.pathname.includes('catalogo.html')) {
    initCatalogo();
}