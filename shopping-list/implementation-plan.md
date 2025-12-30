# Implementation Plan - Shopping List Manager

## Faza 1: Setup & Structură (index.html)

### 1.1 Structura HTML de bază
- [ ] DOCTYPE și meta tags
- [ ] Link-uri CDN pentru Supabase
- [ ] Container principal pentru aplicație

### 1.2 CSS Inline
- [ ] Variabile CSS pentru teme (culori, spațiere)
- [ ] Stiluri pentru layout responsive
- [ ] Stiluri pentru componente (butoane, inputs, cards)
- [ ] Animații și tranziții
- [ ] Dark mode support

---

## Faza 2: Inițializare Supabase

### 2.1 Configurare Client
```javascript
const SUPABASE_URL = 'https://ywbmnkleicpokpnwkija.supabase.co';
const SUPABASE_KEY = 'sb_publishable_3Eoi2E9K_EFFvdj7PwAAgQ_CdwFKgeV';
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
```

### 2.2 Funcții Database
- [ ] `createList(name)` - Creează listă nouă cu cod unic
- [ ] `getListByCode(code)` - Obține lista după cod
- [ ] `getCategories(listId)` - Obține categoriile unei liste
- [ ] `getItems(categoryId)` - Obține articolele unei categorii
- [ ] `addItem(categoryId, text)` - Adaugă articol
- [ ] `toggleItem(itemId, completed)` - Toggle completat
- [ ] `deleteItem(itemId)` - Șterge articol

---

## Faza 3: Componente UI

### 3.1 Modal Creare Listă
- Input pentru nume
- Buton creare
- Afișare cod generat

### 3.2 Header Listă
- Afișare nume listă
- Buton copiere URL
- Notificare "Link copiat!"

### 3.3 Formular Adăugare Articol
- Input text pentru articol
- Dropdown pentru selectare categorie
- Buton adăugare

### 3.4 Afișare Categorii și Articole
- Secțiuni colapsabile pe categorii
- Checkbox pentru fiecare articol
- Buton ștergere articol
- Contador articole per categorie

---

## Faza 4: Logica Aplicației

### 4.1 Routing Simplu
```javascript
// La încărcare pagină
const code = new URLSearchParams(window.location.search).get('code');
if (code) {
  loadExistingList(code);
} else {
  showCreateListModal();
}
```

### 4.2 Event Handlers
- [ ] Submit formular adăugare
- [ ] Click checkbox articol
- [ ] Click ștergere articol
- [ ] Click copiere URL

### 4.3 Real-time Updates
- [ ] Subscribe la modificări pe items
- [ ] Update UI automat când altcineva face modificări

---

## Faza 5: Polish & Testing

### 5.1 UX Improvements
- [ ] Loading states
- [ ] Error handling cu mesaje user-friendly
- [ ] Empty states (listă goală)
- [ ] Confirmare înainte de ștergere

### 5.2 Testare Manuală
- [ ] Creare listă nouă
- [ ] Partajare și acces din alt browser/tab
- [ ] Adăugare articole
- [ ] Toggle completat
- [ ] Ștergere articole
- [ ] Verificare real-time sync

---

## Structura Fișierelor

```
shopping-list/
├── AGENTS.md              # Documentație pentru agenți
├── PRD.md                 # Product Requirements
├── implementation-plan.md # Acest fișier
└── index.html             # Aplicația completă
```

## Dependențe Externe
- Supabase JS Client (CDN): `https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2`

## Timeline Estimat
- Setup & Structură: 30 min
- Supabase Integration: 30 min
- UI Components: 45 min
- Business Logic: 30 min
- Polish: 15 min
- **Total: ~2.5 ore**
