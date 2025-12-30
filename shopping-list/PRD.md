# Shopping List Manager - Product Requirements Document

## 1. Obiectiv
Aplicație web pentru managementul listelor de cumpărături care permite:
- Crearea și partajarea listelor fără autentificare
- Organizarea articolelor pe categorii pentru navigare ușoară în magazin
- Acces simplu prin URL unic

## 2. User Stories

### US1: Creare Listă
**Ca** utilizator  
**Vreau** să creez o listă de cumpărături nouă  
**Pentru a** putea adăuga articolele de care am nevoie

### US2: Partajare Listă
**Ca** utilizator  
**Vreau** să pot partaja lista prin URL  
**Pentru a** permite altor persoane să vadă/modifice lista

### US3: Adăugare Articole
**Ca** utilizator  
**Vreau** să adaug articole în listă cu o categorie asociată  
**Pentru a** le găsi ușor în magazin

### US4: Categorizare
**Ca** utilizator  
**Vreau** ca articolele să fie grupate pe categorii  
**Pentru a** face cumpărăturile mai eficient

### US5: Marcare Completat
**Ca** utilizator  
**Vreau** să marchez articolele cumpărate  
**Pentru a** ști ce am luat deja

## 3. Funcționalități

### 3.1 Lista de Cumpărături
- Creare listă cu nume personalizat
- Generare cod unic pentru partajare
- Afișare URL partajabil

### 3.2 Categorii
Categorii predefinite:
- 🥛 Lactate
- 🍞 Panificație
- 🍎 Fructe & Legume
- 🥩 Carne & Mezeluri
- 🥫 Conserve
- 🧊 Produse Congelate
- 🧹 Curățenie
- 🧴 Igienă Personală
- 🍬 Dulciuri
- 🥤 Băuturi
- ❓ Altele

### 3.3 Articole
- Adăugare articol cu text și categorie
- Marcare ca completat/necompletat
- Ștergere articol
- Sortare pe categorii

## 4. Interfață

### Ecran Principal
1. **Header**: Nume listă + buton partajare
2. **Input**: Adăugare articol nou cu selector categorie
3. **Listă**: Articole grupate pe categorii
4. **Footer**: Statistici (total/completate)

### Design
- Stil modern, minimalist
- Suport pentru dark/light mode
- Mobile-first, responsive
- Animații subtile

## 5. Cerințe Tehnice

### Frontend
- HTML5, CSS3, JavaScript ES6+
- Nu necesită build tools
- Funcționează direct în browser

### Backend
- Supabase pentru stocare și real-time
- Fără autentificare (acces pe bază de cod)

### Compatibilitate
- Chrome, Firefox, Safari, Edge (ultimele 2 versiuni)
- iOS Safari, Android Chrome

## 6. Out of Scope (v1)
- Autentificare utilizatori
- AI pentru detectare automată categorie
- Istoric modificări
- Notificări push
