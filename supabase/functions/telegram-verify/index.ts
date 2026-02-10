import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const BOT_TOKEN = "8409056823:AAHhT3pmACJAF-VjNLIFHs-LH0jy-SfNZlI";

Deno.serve(async (req) => {
  if (req.method !== 'POST') return new Response("OK", { status: 200 });

  try {
    const body = await req.json();
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    if (body.table === 'ordini' && body.type === 'INSERT') {
      const ordine = body.record;
      const prodotti = ordine.lista_prodotti || [];
      
      const { data: utente } = await supabase.from('profili').select('*').eq('id', ordine.utente_id).single();

      if (utente && utente.telegram_id) {
        let listaArticoli = "";
        prodotti.forEach((p, index) => {
          listaArticoli += `${index + 1}. \`x${p.quantita}\` *${p.nome}* — €${(p.prezzo * p.quantita).toLocaleString()}\n`;
        });

        const messaggio = `✨ *Nuovo Ordine Effettuato!*\n\n` +
                          `🆔 *ID Ordine:* #${ordine.id.substring(0, 8)}\n\n` +
                          `📦 *Articoli nel Carrello:*\n${listaArticoli}\n` +
                          `💰 *Prezzo Totale:* €${ordine.prezzo_finale.toLocaleString()}\n` +
                          `🚚 *Metodo:* ${ordine.metodo_consegna === 'ritiro' ? 'Ritiro in sede' : 'Consegna a domicilio'}\n` +
                          (ordine.metodo_consegna === 'consegna' ? `📍 *Coordinate:* ${ordine.indirizzo_coordinate}\n` : '') +
                          `👤 *Cliente:* ${utente.rp_nome_cognome}\n\n` +
                          `💳 _Pagamento da effettuare in persona._`;

        await inviaMessaggio(utente.telegram_id, messaggio);
      }
      return new Response("OK", { status: 200 });
    }

    const message = body.message;
    if (!message || !message.text) return new Response("OK", { status: 200 });

    const chatId = message.chat.id;
    const testoRicevuto = message.text.trim();
    const usernameMittente = message.from.username;

    if (testoRicevuto === "/start") {
      await inviaMessaggio(chatId, "✨ *Benvenuto nel Bot di Verifica di Boutique Eye.*\n\nInserisci il codice di verifica che vedi sul sito per confermare la tua identità.\n\n👤 **Informazioni**: @sconfitto");
      return new Response("OK", { status: 200 });
    }

    if (!usernameMittente) {
      await inviaMessaggio(chatId, "❌ Errore: Il tuo account Telegram deve avere un Username impostato.");
      return new Response("OK", { status: 200 });
    }

    const { data: profilo, error: searchError } = await supabase
      .from('profili')
      .select('id, rp_nome_cognome')
      .eq('codice_verifica', testoRicevuto)
      .ilike('telegram_username', usernameMittente)
      .single();

    if (searchError || !profilo) {
      await inviaMessaggio(chatId, "❌ Codice errato o non autorizzato.");
      return new Response("OK", { status: 200 });
    }

    const { error: updateError } = await supabase
      .from('profili')
      .update({ 
        telegram_id: chatId, 
        sessione_attiva: true, 
        codice_verifica: null 
      })
      .eq('id', profilo.id);

    if (updateError) {
      await inviaMessaggio(chatId, "⚠️ Errore durante l'attivazione.");
    } else {
      await inviaMessaggio(chatId, `✅ Identità confermata, ${profilo.rp_nome_cognome}. La tua sessione è attiva.`);
    }

    return new Response("OK", { status: 200 });

  } catch (err) {
    console.error(err);
    return new Response("Error", { status: 200 }); 
  }
});

async function inviaMessaggio(chatId, text) {
  await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ 
      chat_id: chatId, 
      text: text,
      parse_mode: "Markdown" 
    })
  });
}