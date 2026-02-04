
import { Product, Order } from './types';

export const PRODUCTS: Product[] = [
  {
    id: '8821A',
    name: 'Cronografo Imperiale',
    category: 'Orologeria',
    price: 12500,
    description: 'Collezione Aurea 2024. Meccanica di precisione con dettagli in oro 24k.',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC3vS-I9SnMcLfSFGs7iKaq2k8DYEHHBXa8ZdYTIh7kYGfN_hwGBhUjPc15YcwbfQy9_FLHuNTrteAtNbYbgmJaVFYYnV1KUl05nzXhITRaYaioTAYp2klLqlWOAZWXij50eLZ_1bHQ6DkK55cj85k26pV_CbWmGpOglM1aOSKo2PIVxWA_oJJdO-_z1Xxjy4a-4itaLYzk5bs3R3A3wHB6r42s5-xq2G_z_FDzbpSfbfyrlTABkIRVAVSQE-8uRQVfppz2_SLwvGfN',
    badge: 'NUOVO ARRIVO'
  },
  {
    id: 'ET-001',
    name: 'Collana "Eternità"',
    category: 'Gioielleria',
    price: 12500,
    description: 'Oro 24 carati lavorato a mano, incastonato con diamanti delle miniere profonde.',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBBEAiAxDfC_g47K7WJrA_IiI06Ga6Y9oTVCXzbYeRZgBvLU6Cx9zoDfcuCPz20jSBH5SshYW_qwprY_hj4O43dEpDdreP16ZOEhzzNyBcxFbB-mciHkm50GBMNoVmNxBjAFLXW6HQIpeB2GA0sEnA4m6QQB71ZnAaJfMKA119p2xDMWcFiVOD6rvdGMRD5sLVqoNJF7QPrbPoenWfyzrwn2f9A0DBD_Rr_OOv8-ODCSz_sR9cAq9YL2BYPlgJW_prpSXP8wIhEx30V',
    badge: 'NUOVO'
  },
  {
    id: 'SI-002',
    name: 'Anello Signet Imperiale',
    category: 'Gioielleria',
    price: 4200,
    description: 'Simbolo di potere. Argento puro con pietra onice nera taglio quadrato.',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB2KGRG50ZEz6mS90OMEw_i0nHQfxIGLN1FA7GoYSsPso0IVbgWDWyJmu-o1P1cDalVU_zzQ9mBVLYmJSWHJKLBIQsacgRShBdWSidHT31RsOQa9BNcF00oGNEfcbdAI7GHMnlbDOPbp86SzrNlAQaM-GMAymtctd2-NBpAzUA1haXwiQGf5KloUXYsSrQYrjBbZ0SbECa7ilFajo4jNd0rqnokLUGaUMkrgjuuWp1a-dVIvBl23feyYCJ4vbmJqz1DsGXwHLx1imCD'
  },
  {
    id: 'AT-003',
    name: 'Cronografo Atlantis',
    category: 'Orologeria',
    price: 28000,
    description: 'Precisione svizzera, resistenza alle profondità marine. Cassa in oro rosa.',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBWZO4ui4PS2DxAmg8jPayLCHCZ_jd4AL_kvgQV5v2pGRFu6uEz-aPDP3PFW9WdV-qBR22y_tmzZQSRQqA_POA_hoVMt0QuKVszqIK-VGbz-TB1M1VfEg_EJNcyF-r9-yAtawZD9cAEAAm5zQSjsRjz-ipKgWyyap45Xb5pmD5_YElPmfVMcKA7SVL16E1etIeceHBluEE86Fz4tjf5aSSUMbQSNkm8YnEFi38FN4KQMXyO-67xdp8ScddOGLhfwiBM7G6cybgmpqWW',
    badge: 'ESCLUSIVO'
  },
  {
    id: 'PM-004',
    name: 'Perle dei Mari del Sud',
    category: 'Gioielleria',
    price: 8900,
    description: 'Una selezione rara di perle perfettamente sferiche e lucenti.',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAR3t8VQsVjJuhJ0CSHY4m0lkk-k7LoGJRRQ6SxHQsmWIdCL14DXIpvVc2WNxXwuKIA9ZAWH83eh9VOHHfoFftOOBxQZ6cxYjalIJqYqr3vB_MnKBXqZXiPU8gpQXEzpeMKVw9VOBmzup2y9DnDdPJ5o4MNNyUcqZRoYKx6AyPn77_NDSf7EW21gcPExXpMaE5XbBtHSymdtKrVLZWLnRBiwQEfDgB9xr1wlkMnYnvvG6yRiCEHZba8-Ji_ppY1IXXSUjk_JW8jpWMO'
  },
  {
    id: 'GR-005',
    name: 'Gemelli Reali',
    category: 'Gioielleria',
    price: 1500,
    description: 'Il tocco finale per l\'abito formale. Incisione personalizzabile.',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAyOsstp-68bJeP79dO-DHLhEkFe2s0kpjSnVTPYW0de4WrynkxAWmbXBZ4DDq6wpGcTPPFmtB2_74yhNjlIuyfKSvuPjE5UW2H9Y2Tep7rZMGd0vDbeQvvfQWvMGs6NN9Gf1R6uLDJOM2KqOY6pSk6BdB_cJ5FJbozlxi7GMmxR9jquBEdeL1eVma3eykqEr-bSKqSR25gzF_N4msOXhLHohWx-qVeKeYF5bBCvg6SOjCwfxyiHtn9Pck0EFptsbvuuDzvYAemy3Dc'
  },
  {
    id: 'DR-006',
    name: 'Diadema della Regina',
    category: 'Gioielleria',
    price: 150000,
    description: 'Un pezzo storico unico. Non più disponibile per l\'acquisto pubblico.',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAIlkZKGRwoLQvKmOdgGbRDwD_Xd9npdV4-qaFzV0EXcPoxIL7ReTh5IaEe4myvAVPa4nQHVnRHoJBmKSBBtuHAU2OvJOqeiarGs9rrutFG2ONj5HqGhFeohslLNIc0FJUg_k4tXkAjlFrHqoV-5nI3aUoEviq1V6Ob4dA0bjVS4ma2V4LSjI0-QU2xYm4OtIPmjyYUJVMUSTChfyFe-AHpwRamxZ7vFMIfHvVN9MPvnbUuKfE7vdAs6fRfCUE0a4XRUZnjY8UoQgrM',
    outOfStock: true
  },
  {
    id: 'HD-001',
    name: 'Borsa Hermes Birkin',
    category: 'Alta Moda',
    price: 45000,
    description: 'Pelle esotica, finiture in palladio. Un must per il prestigio.',
    image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&q=80&w=800'
  }
];

export const INITIAL_ORDERS: Order[] = [
  {
    id: 'ORD-4029',
    timestamp: '12 Minuti fa',
    customerName: 'Mario Rossi',
    customerType: 'VIP',
    items: [
      { name: 'Orologio Gold Rolex', quantity: 1, price: 8500 },
      { name: 'Abito Sartoriale', quantity: 2, price: 2000 }
    ],
    total: 12500,
    status: 'pending',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBXuWMbogM1dDAxCUTZwA9HFmitrAJ6uZFUDGSd-gtZK1dUtetHGvY7vreJB9TeaYJrD30wxn1q1CQtMgCdYcyfORbafOEG26bIJEGdbc-Qq4XX5_KXb38OX08SwLjsfE9NKSyejZ4yTVWiATL5IvNsaJxcyDevsQdnkfeS1haTsSAwclVQtnA0IUo24bvKQrKZrvMW2pqRCeHhQjPG4FOackSESK_-8dFyjj3j9hlGeZzqtGWTWenXxUYZHp5U2vVzjfvvpcnJvHMJ'
  },
  {
    id: 'ORD-4028',
    timestamp: '25 Minuti fa',
    customerName: 'Luca Bianchi',
    customerType: 'Regular',
    items: [
      { name: 'Collana Diamanti', quantity: 1, price: 15000 }
    ],
    total: 15000,
    status: 'preparing',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBJOd8264EPoD_6Ye-8ZpAhZy3nCMAUAhd0GMpPde0pXnRoCsHldKDKzipDN2LTpWf0RKkCmKkF364bH9Q9NXNeU7IqnYy9gMLB0bkIpg96OzSoDL8Q_wLDVmrbReQwvyFaqRsIclqZ3EMrdFrsqFFh_YTQ5DizE4qFzb18DFIudey_JaGYmsEa2jHvBeA4J0hn1_cR948b39OfnVmBjmo-U0LDqdryKe7v_z1-P0k-6eT-xsfNZBo7iNnJHGgARFNodeqybeP9fOpp'
  },
  {
    id: 'ORD-4027',
    timestamp: '45 Minuti fa',
    customerName: 'Sofia Verdi',
    customerType: 'VIP',
    items: [
      { name: 'Borsa Hermes', quantity: 1, price: 12000 },
      { name: 'Sciarpa Seta', quantity: 1, price: 500 }
    ],
    total: 12500,
    status: 'ready',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD9mQlR6NAFbYAve-8FKpTh0mORG5F8CxlqtVbeBWHo2aAvKtOvhQpcC9P_6N_7h3xz94XWq6rPW2vBkor93xjQF5bImDgHvdRZpi3yJCmym1jTCgkZY9VjP9VOIRvgRlyxYF4rp0mfrNJlElqzoSU59tZllNjX9x9xE1v7LM1pJV1DKQqVClnCY0bk3_nHgKMdHBiPiNVOdW2hgEKUrzEiladVC1QJKo78IEpYUUdh280TDwgONnje_saE3dM-MyvaYCsuO-Tqs_Wm'
  }
];
