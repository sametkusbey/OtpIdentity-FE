# OtpIdentity Identity Server Frontend

Bu proje OtpIdentity backend servislerini yonetebilmek icin modern bir React arayuzu sunar. Uygulama PRD'de belirtilen tum varliklar icin listeleme, olusturma, guncelleme ve silme islemlerini icerir.

## Ozellikler
- React 19 + Vite altyapisi
- Ant Design ile responsive ve moduler arayuz
- React Query ile durum ve cache yonetimi
- Form validasyonlari ve hata mesaji gosterimi
- Tema renkleri: `#06923e` (ana) ve `#333446` (ikincil)
- Tanimlanan tum kaynaklar icin CRUD ekranlari ve onay diyaloglari

## Kurulum
```bash
npm install
cp .env.example .env
# gerekli ise .env icindeki VITE_API_BASE_URL degerini guncelleyin
npm run dev
```

## Uretim Derlemesi
```bash
npm run build
npm run preview
```

## Dizin Yapisi
- `src/components`: Ortak layout ve yardimci bileşenler
- `src/features`: Her ana varlik icin sayfalar ve ilgili kodlar
- `src/lib`: API istemcisi ve React Query tanimlari
- `src/utils`: Formatlama ve form yardimcilari
- `src/providers`: Uygulama saglayicilari (router, sorgu yonetimi, tema)

## Notlar
- Giris ekrani su anda yalnizca local state uzerinden calisir.
- Tum metinler Turkce ve ASCII karakterler kullanir.
- Dashboard mevcut endpointlerle temel sayilar gosterir; yeni metrikler icin backend gelistirmesine ihtiyac vardir.
