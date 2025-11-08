# OTP Identity API Sistemi - Kapsamlı AI Agent Dokümantasyonu

## İçindekiler
1. [Sistem Genel Bakış](#sistem-genel-bakış)
2. [Veri Modeli ve İlişkiler](#veri-modeli-ve-ilişkiler)
3. [İş Mantığı Kuralları](#iş-mantığı-kuralları)
4. [API Endpoint'leri](#api-endpointleri)
5. [Güvenlik ve Yetkilendirme](#güvenlik-ve-yetkilendirme)
6. [Validasyon Kuralları](#validasyon-kuralları)
7. [Hata Yönetimi](#hata-yönetimi)
8. [Frontend Entegrasyon Rehberi](#frontend-entegrasyon-rehberi)

## Sistem Genel Bakış

### Mimarı
- **Backend**: ASP.NET Core Web API
- **Database**: Entity Framework Core ile SQL Server
- **Authentication**: JWT Token tabanlı
- **Pattern**: Repository + Unit of Work (DbContext üzerinden)

### Ana Bileşenler
1. **Portal Hesapları**: Sisteme giriş yapan kullanıcı hesapları
2. **Bayiler**: Ana işletmeler (IsCustomer = false)
3. **Müşteriler**: Bayilerin altındaki işletmeler (IsCustomer = true)
4. **Kullanıcılar**: Sistem kullanıcıları
5. **Uygulamalar**: Lisanslanabilir yazılım ürünleri
6. **Lisanslar**: Uygulama kullanım yetkileri
7. **Yetkilendirmeler**: Kullanıcı-Uygulama-Bayi ilişkileri

## Veri Modeli ve İlişkiler

### Entity Relationship Diagram (Metin Formatında)

```
PortalAccount (Portal Hesapları)
├── Id: Guid (PK)
├── Username: string (Unique)
├── PasswordHash: string
├── IsAdmin: bool
├── DealerCode: string? (Bayi kodu - ÖNEMLİ)
├── IsActive: bool
├── CreatedDate: DateTime
└── Menus: ICollection<PortalMenu> (Many-to-Many)

Dealer (Bayi/Müşteri)
├── Id: Guid (PK)
├── TaxIdentifierNumber: string (Vergi No)
├── Title: string (Ünvan)
├── CompanyType: CompanyType enum
├── City: string
├── District: string
├── CompanyPhoneNumber: string
├── CompanyEmailAddress: string
├── IsCustomer: bool (false=Bayi, true=Müşteri)
├── DealerCode: string? (Bayi kodu)
├── OwnerPortalAccountId: Guid? (FK to PortalAccount)
├── ParentDealerId: Guid? (FK to Dealer - müşteriler için)
├── IsActive: bool
├── CreatedDate: DateTime
├── Users: ICollection<User> (Many-to-Many)
├── Licenses: ICollection<License> (One-to-Many)
├── Authorizations: ICollection<Authorization> (One-to-Many)
└── Connections: ICollection<Connection> (One-to-Many)

User (Kullanıcılar)
├── Id: Guid (PK)
├── Name: string
├── LastName: string
├── Email: string
├── PhoneNumber: string
├── IdentityNumber: string (TC Kimlik No)
├── IsEmailVerified: bool
├── IsPhoneNumberVerified: bool
├── IsActive: bool
├── CreatedDate: DateTime
├── Dealers: ICollection<Dealer> (Many-to-Many)
├── Apps: ICollection<App> (Many-to-Many)
└── Authorizations: ICollection<Authorization> (One-to-Many)

App (Uygulamalar)
├── Id: Guid (PK)
├── AppCode: string
├── AppName: string
├── IsActive: bool
├── CreatedDate: DateTime
├── Users: ICollection<User> (Many-to-Many)
├── Licenses: ICollection<License> (One-to-Many)
└── Authorizations: ICollection<Authorization> (One-to-Many)

License (Lisanslar)
├── Id: Guid (PK)
├── DealerId: Guid (FK to Dealer)
├── AppId: Guid (FK to App)
├── StartDate: DateTime
├── EndDate: DateTime?
├── RenewalPeriod: int
├── RenewalPeriodType: RenewalPeriodType enum
├── IsAutoRenewed: bool
├── IsLocked: bool
├── IsActive: bool
├── CreatedDate: DateTime
├── Dealer: Dealer (Navigation)
└── App: App (Navigation)

Authorization (Yetkilendirmeler)
├── Id: Guid (PK)
├── UserId: Guid (FK to User)
├── AppId: Guid (FK to App)
├── DealerId: Guid (FK to Dealer)
├── IsActive: bool
├── CreatedDate: DateTime
├── User: User (Navigation)
├── App: App (Navigation)
└── Dealer: Dealer (Navigation)

Program (Programlar)
├── Id: Guid (PK)
├── ProgramCode: string
├── ProgramName: string
├── IsActive: bool
├── CreatedDate: DateTime
└── Versions: ICollection<ProgramVersion> (One-to-Many)

ProgramVersion (Program Versiyonları)
├── Id: Guid (PK)
├── ProgramId: Guid (FK to Program)
├── VersionCode: string
├── VersionName: string
├── IsActive: bool
├── CreatedDate: DateTime
├── Program: Program (Navigation)
└── Editions: ICollection<ProgramEdition> (One-to-Many)

ProgramEdition (Program Sürümleri)
├── Id: Guid (PK)
├── ProgramVersionId: Guid (FK to ProgramVersion)
├── EditionCode: string
├── EditionName: string
├── IsActive: bool
├── CreatedDate: DateTime
└── ProgramVersion: ProgramVersion (Navigation)

Connection (Bağlantılar)
├── Id: Guid (PK)
├── ProgramId: Guid (FK to Program)
├── ProgramVersionId: Guid (FK to ProgramVersion)
├── AppId: Guid (FK to App)
├── DealerId: Guid (FK to Dealer)
├── ConnectionType: string
├── Parameter1-5: string? (5 adet parametre)
├── IsActive: bool
├── CreatedDate: DateTime
├── Program: Program (Navigation)
├── App: App (Navigation)
└── Dealer: Dealer (Navigation)

CompanyAddress (Şirket Adresleri)
├── Id: Guid (PK)
├── DealerId: Guid (FK to Dealer)
├── AddressName: string
├── Country: string
├── City: string
├── District: string
├── Town: string?
├── Street: string
├── ZipCode: string
├── ApartmentName: string?
├── ApartmentNumber: string?
├── DoorNumber: string?
├── EmailAddress: string?
├── Website: string?
├── IsEInvoiceTaxpayer: bool
├── EInvoiceTransitionDate: DateTime?
├── EInvoiceAlias: string?
├── IsEWaybillTaxpayer: bool
├── EWaybillTransitionDate: DateTime?
├── EWaybillAlias: string?
├── IsActive: bool
├── CreatedDate: DateTime
└── Dealer: Dealer (Navigation)

CompanyRepresentative (Şirket Temsilcileri)
├── Id: Guid (PK)
├── DealerId: Guid (FK to Dealer)
├── Name: string
├── LastName: string
├── PhoneNumber: string
├── EmailAddress: string
├── IsActive: bool
├── CreatedDate: DateTime
└── Dealer: Dealer (Navigation)

PortalMenu (Portal Menüleri)
├── Id: Guid (PK)
├── MenuCode: string
├── MenuName: string
├── IsActive: bool
├── CreatedDate: DateTime
└── PortalAccounts: ICollection<PortalAccount> (Many-to-Many)
```

### Enum Tanımları

```csharp
public enum CompanyType
{
    Limited = 1  // Şu anda sadece Limited şirket türü mevcut
}

public enum RenewalPeriodType
{
    Day = 1,    // Günlük
    Month = 2,  // Aylık
    Year = 3    // Yıllık
}
```

## İş Mantığı Kuralları

### 1. Portal Hesap - Bayi İlişkisi
```
KURAL: Portal hesap oluşturulurken bayi seçilirse:
- Portal hesabın DealerCode alanı seçilen bayinin DealerCode'u ile doldurulur
- Bayinin OwnerPortalAccountId alanı portal hesabın Id'si ile doldurulur
- Bu ilişki müşteri işlemlerinde yetkilendirme için kullanılır
```

### 2. Bayi - Müşteri Hiyerarşisi
```
KURAL: Müşteri (IsCustomer=true) kayıtları:
- Mutlaka bir parent bayi (IsCustomer=false) altında olmalıdır
- ParentDealerId alanı parent bayinin Id'sini içermelidir
- DealerCode alanı parent bayinin DealerCode'u ile aynı olmalıdır
- OwnerPortalAccountId parent bayinin OwnerPortalAccountId'si ile aynı olmalıdır
```

### 3. Kullanıcı Yetkilendirme Mantığı
```
KURAL: Giriş yapan kullanıcı:
- Admin ise: Tüm kayıtları görebilir ve yönetebilir
- Admin değilse: Sadece kendi bayi koduna ait kayıtları görebilir
- Bayi kodu PortalAccount.DealerCode alanından alınır
- Bu kod ile Dealer.DealerCode eşleştirmesi yapılır
```

### 4. Müşteri Oluşturma Mantığı
```
KURAL: Yeni müşteri oluşturulurken:
1. IsCustomer otomatik olarak true set edilir
2. Giriş yapan kullanıcının portal hesabından bayi kodu alınır
3. Bu bayi koduna sahip parent bayi bulunur
4. Müşterinin DealerCode'u parent bayinin DealerCode'u olarak set edilir
5. Müşterinin ParentDealerId'si parent bayinin Id'si olarak set edilir
6. Müşterinin OwnerPortalAccountId'si giriş yapan kullanıcının Id'si olarak set edilir
```

### 5. Müşteri Listeleme Mantığı
```
KURAL: Müşteri listesi çekilirken:
1. Giriş yapan kullanıcının portal hesabından bayi kodu alınır
2. Bu bayi koduna sahip parent bayi bulunur
3. Sadece bu parent bayinin altındaki müşteriler (ParentDealerId eşleşmesi) listelenir
4. Admin kullanıcılar bu kısıtlamaya tabi değildir
```

## API Endpoint'leri

### 1. Authentication Controller (/api/auth)

#### POST /api/auth/register
**Amaç**: Yeni portal hesabı oluşturur ve isteğe bağlı olarak bayi ile ilişkilendirir.

**Request Model**:
```json
{
  "username": "string (required, unique)",
  "password": "string (required)",
  "menuIds": ["guid1", "guid2"] // optional
  "dealerId": "guid" // optional - bayi seçimi için ÖNEMLİ
}
```

**Response Model**:
```json
{
  "isSuccess": true,
  "message": "Kayıt başarıyla oluşturuldu.",
  "data": {
    "id": "guid",
    "username": "string",
    "isActive": true,
    "isAdmin": false,
    "dealerCode": "string" // Seçilen bayinin kodu otomatik atanır
  }
}
```

**İş Mantığı**:
1. Username benzersizlik kontrolü
2. Password hash'leme
3. Portal hesap oluşturma
4. Menü ilişkilendirme (varsa)
5. **Bayi ilişkilendirme (varsa)**:
   - Dealer bulunur
   - Dealer.OwnerPortalAccountId = PortalAccount.Id
   - PortalAccount.DealerCode = Dealer.DealerCode

**Validasyonlar**:
- Username boş olamaz
- Username benzersiz olmalı
- Password boş olamaz
- DealerId varsa geçerli bir bayi olmalı

**Hata Durumları**:
- 400: Username boş
- 409: Username zaten kayıtlı

#### POST /api/auth/login
**Amaç**: Kullanıcı girişi yapar ve session bilgilerini döner.

**Request Model**:
```json
{
  "username": "string (required)",
  "password": "string (required)"
}
```

**Response Model**:
```json
{
  "isSuccess": true,
  "message": "Giriş başarılı.",
  "data": {
    "id": "guid",
    "username": "string",
    "isActive": true,
    "isAdmin": false,
    "menus": [
      {
        "id": "guid",
        "menuCode": "string",
        "menuName": "string"
      }
    ],
    "dealerCode": "string" // ÖNEMLİ: Frontend'de saklanmalı
  }
}
```

**İş Mantığı**:
1. Username ile hesap bulma
2. Hesap aktiflik kontrolü
3. Password doğrulama
4. Aktif menüleri getirme
5. **DealerCode'u response'a dahil etme**

#### POST /api/auth/login/jwt
**Amaç**: JWT token ile kullanıcı girişi yapar.

**Request Model**: Yukarıdaki ile aynı

**Response Model**: Yukarıdaki + `"token": "jwt-string"`

### 2. Portal Accounts Controller (/api/portalaccounts)

#### GET /api/portalaccounts
**Amaç**: Tüm portal hesaplarını listeler.

**Response Model**:
```json
{
  "isSuccess": true,
  "message": "Hesaplar başarıyla getirildi.",
  "data": [
    {
      "id": "guid",
      "username": "string",
      "createdDate": "datetime",
      "isActive": true
    }
  ]
}
```

#### GET /api/portalaccounts/{id}
**Amaç**: Belirtilen portal hesabının detaylarını getirir.

**Response Model**:
```json
{
  "isSuccess": true,
  "message": "Hesap başarıyla getirildi.",
  "data": {
    "id": "guid",
    "username": "string",
    "isActive": true,
    "isAdmin": false,
    "dealerCode": "string" // Bayi kodu
  }
}
```

#### PUT /api/portalaccounts/{id}
**Amaç**: Portal hesabını günceller.

**Request Model**:
```json
{
  "password": "string", // optional - şifre değişikliği için
  "isActive": true, // optional
  "menuIds": ["guid1", "guid2"], // optional
  "ownedDealerId": "guid", // optional - bayi değişikliği için
  "dealerCode": "string" // optional - manuel bayi kodu değişikliği
}
```

**İş Mantığı**:
1. Hesap bulma
2. Password güncelleme (varsa)
3. Aktiflik durumu güncelleme (varsa)
4. Menü ilişkilendirme güncelleme (varsa)
5. **Bayi ilişkilendirme güncelleme (varsa)**:
   - Yeni bayi bulunur
   - Dealer.OwnerPortalAccountId güncellenir
   - PortalAccount.DealerCode güncellenir
6. Manuel DealerCode güncelleme (varsa)

#### DELETE /api/portalaccounts/{id}
**Amaç**: Portal hesabını pasife alır (soft delete).

#### GET /api/portalaccounts/{id}/menus
**Amaç**: Portal hesabının menülerini getirir.

### 3. Dealers Controller (/api/dealers)

#### GET /api/dealers
**Amaç**: Bayileri listeler (IsCustomer = false).

**Query Parameters**:
- `isCustomer`: bool? (filtreleme için, default: null)
- `mineOnly`: bool? (sadece kendi bayilerini getirmek için)

**Response Model**:
```json
{
  "isSuccess": true,
  "message": "Bayiler başarıyla getirildi.",
  "data": [
    {
      "id": "guid",
      "taxIdentifierNumber": "string",
      "title": "string",
      "companyType": 1,
      "city": "string",
      "district": "string",
      "companyPhoneNumber": "string",
      "companyEmailAddress": "string",
      "isCustomer": false,
      "dealerCode": "string",
      "userIds": ["guid1", "guid2"]
    }
  ]
}
```

**İş Mantığı**:
1. Sadece bayileri getir (IsCustomer = false)
2. mineOnly=true ise sadece kullanıcının sahip olduğu bayileri getir
3. Admin kullanıcılar tüm bayileri görebilir

#### GET /api/dealers/{id}
**Amaç**: Belirtilen bayinin detaylarını getirir.

#### POST /api/dealers
**Amaç**: Yeni bayi oluşturur.

**Request Model**:
```json
{
  "taxIdentifierNumber": "string (required)",
  "title": "string (required)",
  "companyType": 1, // CompanyType enum
  "city": "string (required)",
  "district": "string (required)",
  "companyPhoneNumber": "string (required)",
  "companyEmailAddress": "string (required)",
  "isCustomer": false, // Bayi için false
  "dealerCode": "string", // optional ama önerilir
  "userIds": ["guid1", "guid2"] // optional
}
```

**İş Mantığı**:
1. CompanyType validasyonu
2. IsCustomer=false kontrolü (müşteriler için CustomersController kullanılmalı)
3. Bayi oluşturma
4. Kullanıcı ilişkilendirme

**Validasyonlar**:
- Tüm required alanlar dolu olmalı
- CompanyType geçerli enum değeri olmalı
- IsCustomer=false olmalı

#### PUT /api/dealers/{id}
**Amaç**: Bayi bilgilerini günceller.

#### DELETE /api/dealers/{id}
**Amaç**: Bayi kaydını siler.

### 4. Customers Controller (/api/customers) - [Authorize] Required

#### GET /api/customers
**Amaç**: Müşterileri listeler (IsCustomer = true) - Bayi koduna göre filtrelenmiş.

**Response Model**:
```json
{
  "isSuccess": true,
  "message": "Müşteriler başarıyla getirildi.",
  "data": [
    {
      "id": "guid",
      "taxIdentifierNumber": "string",
      "title": "string",
      "companyType": 1,
      "city": "string",
      "district": "string",
      "companyPhoneNumber": "string",
      "companyEmailAddress": "string",
      "isCustomer": true,
      "dealerCode": "string", // Parent bayinin kodu
      "userIds": ["guid1", "guid2"]
    }
  ]
}
```

**İş Mantığı**:
1. **Admin kontrolü**: Admin ise tüm müşterileri getir
2. **Normal kullanıcı için**:
   - Portal hesaptan bayi kodunu al
   - Bu bayi koduna sahip parent bayiyi bul
   - Sadece bu parent bayinin altındaki müşterileri getir (ParentDealerId kontrolü)
3. **Fallback**: OwnerPortalAccountId ile de kontrol et

**Güvenlik**: JWT token gerekli, bayi kodu kontrolü otomatik

#### GET /api/customers/{id}
**Amaç**: Belirtilen müşterinin detaylarını getirir.

**İş Mantığı**:
1. Müşteri bulma (IsCustomer=true kontrolü)
2. **Yetki kontrolü**: Admin değilse sadece kendi bayi koduna ait müşterilere erişim

#### POST /api/customers
**Amaç**: Yeni müşteri oluşturur.

**Request Model**:
```json
{
  "taxIdentifierNumber": "string (required)",
  "title": "string (required)",
  "companyType": 1,
  "city": "string (required)",
  "district": "string (required)",
  "companyPhoneNumber": "string (required)",
  "companyEmailAddress": "string (required)",
  "isCustomer": true, // Her zaman true
  "dealerCode": null, // Backend tarafından otomatik atanır
  "userIds": ["guid1", "guid2"]
}
```

**İş Mantığı**:
1. **Giriş yapan kullanıcıyı bul**
2. **Portal hesaptan bayi kodunu al**
3. **Parent bayiyi bul** (bayi kodu ile)
4. **Müşteri oluştur**:
   - IsCustomer = true (otomatik)
   - DealerCode = parent bayinin DealerCode'u
   - ParentDealerId = parent bayinin Id'si
   - OwnerPortalAccountId = giriş yapan kullanıcının Id'si
5. **Kullanıcı ilişkilendirme**

**Kritik Noktalar**:
- `dealerCode` frontend'den gönderilmemeli, backend otomatik atar
- `isCustomer` her zaman true olmalı
- Parent bayi bulunamazsa hata fırlatılır

#### PUT /api/customers/{id}
**Amaç**: Müşteri bilgilerini günceller.

**İş Mantığı**:
1. Müşteri bulma ve yetki kontrolü
2. Bilgileri güncelleme
3. **DealerCode korunur** (değiştirilmez)

#### DELETE /api/customers/{id}
**Amaç**: Müşteri kaydını siler.

### 5. Users Controller (/api/users)

#### GET /api/users
**Amaç**: Tüm kullanıcıları listeler.

#### GET /api/users/{id}
**Amaç**: Belirtilen kullanıcının detaylarını getirir.

#### POST /api/users
**Amaç**: Yeni kullanıcı oluşturur.

**Request Model**:
```json
{
  "name": "string (required)",
  "lastName": "string (required)",
  "email": "string (required)",
  "phoneNumber": "string (required)",
  "identityNumber": "string (required)", // TC Kimlik No
  "isEmailVerified": false,
  "isPhoneNumberVerified": false,
  "dealerIds": ["guid1", "guid2"], // İlişkili bayiler
  "appIds": ["guid1", "guid2"] // İlişkili uygulamalar
}
```

#### PUT /api/users/{id}
**Amaç**: Kullanıcı bilgilerini günceller.

#### DELETE /api/users/{id}
**Amaç**: Kullanıcı kaydını siler.

### 6. Apps Controller (/api/apps)

#### GET /api/apps
**Amaç**: Tüm uygulamaları listeler.

#### GET /api/apps/{id}
**Amaç**: Belirtilen uygulamanın detaylarını getirir.

#### POST /api/apps
**Amaç**: Yeni uygulama oluşturur.

**Request Model**:
```json
{
  "appCode": "string (required)",
  "appName": "string (required)"
}
```

#### PUT /api/apps/{id}
**Amaç**: Uygulama bilgilerini günceller.

#### DELETE /api/apps/{id}
**Amaç**: Uygulama kaydını siler.

### 7. Licenses Controller (/api/licenses)

#### GET /api/licenses
**Amaç**: Tüm lisansları listeler.

#### GET /api/licenses/{id}
**Amaç**: Belirtilen lisansın detaylarını getirir.

#### POST /api/licenses
**Amaç**: Yeni lisans oluşturur.

**Request Model**:
```json
{
  "dealerId": "guid (required)",
  "appId": "guid (required)",
  "startDate": "datetime (required)",
  "endDate": "datetime", // optional
  "renewalPeriod": 12, // int (required)
  "renewalPeriodType": 3, // RenewalPeriodType enum (required)
  "isAutoRenewed": false,
  "isLocked": false
}
```

**Validasyonlar**:
- RenewalPeriodType geçerli enum değeri olmalı (1=Day, 2=Month, 3=Year)
- StartDate EndDate'den küçük olmalı (varsa)

#### PUT /api/licenses/{id}
**Amaç**: Lisans bilgilerini günceller.

#### DELETE /api/licenses/{id}
**Amaç**: Lisans kaydını siler.

### 8. Authorizations Controller (/api/authorizations)

#### GET /api/authorizations
**Amaç**: Tüm yetkilendirmeleri listeler.

#### GET /api/authorizations/{id}
**Amaç**: Belirtilen yetkilendirmenin detaylarını getirir.

#### POST /api/authorizations
**Amaç**: Yeni yetkilendirme oluşturur.

**Request Model**:
```json
{
  "userId": "guid (required)",
  "appId": "guid (required)",
  "dealerId": "guid (required)"
}
```

#### PUT /api/authorizations/{id}
**Amaç**: Yetkilendirme bilgilerini günceller.

#### DELETE /api/authorizations/{id}
**Amaç**: Yetkilendirme kaydını siler.

### 9. Programs Controller (/api/programs)

#### GET /api/programs
**Amaç**: Tüm programları listeler.

#### GET /api/programs/{id}
**Amaç**: Belirtilen programın detaylarını getirir.

#### POST /api/programs
**Amaç**: Yeni program oluşturur.

**Request Model**:
```json
{
  "programCode": "string (required)",
  "programName": "string (required)"
}
```

#### PUT /api/programs/{id}
**Amaç**: Program bilgilerini günceller.

#### DELETE /api/programs/{id}
**Amaç**: Program kaydını siler.

### 10. Versions Controller (/api/versions)

#### GET /api/versions
**Amaç**: Tüm program versiyonlarını listeler.

#### GET /api/versions/{id}
**Amaç**: Belirtilen versiyonun detaylarını getirir.

#### POST /api/versions
**Amaç**: Yeni versiyon oluşturur.

**Request Model**:
```json
{
  "programId": "guid (required)",
  "versionCode": "string (required)",
  "versionName": "string (required)"
}
```

#### PUT /api/versions/{id}
**Amaç**: Versiyon bilgilerini günceller.

#### DELETE /api/versions/{id}
**Amaç**: Versiyon kaydını siler.

### 11. Program Editions Controller (/api/programeditions)

#### GET /api/programeditions
**Amaç**: Program sürümlerini listeler.

**Query Parameters**:
- `programVersionId`: Guid? (belirli bir versiyonun sürümlerini getirmek için)

#### GET /api/programeditions/{id}
**Amaç**: Belirtilen sürümün detaylarını getirir.

#### POST /api/programeditions
**Amaç**: Yeni sürüm oluşturur.

**Request Model**:
```json
{
  "programVersionId": "guid (required)",
  "editionCode": "string (required)",
  "editionName": "string (required)"
}
```

#### PUT /api/programeditions/{id}
**Amaç**: Sürüm bilgilerini günceller.

#### DELETE /api/programeditions/{id}
**Amaç**: Sürüm kaydını siler.

### 12. Connections Controller (/api/connections)

#### GET /api/connections
**Amaç**: Tüm bağlantıları listeler.

#### GET /api/connections/{id}
**Amaç**: Belirtilen bağlantının detaylarını getirir.

#### POST /api/connections
**Amaç**: Yeni bağlantı oluşturur.

**Request Model**:
```json
{
  "programId": "guid (required)",
  "programVersionId": "guid (required)",
  "appId": "guid (required)",
  "dealerId": "guid (required)",
  "connectionType": "string (required)",
  "parameter1": "string", // optional
  "parameter2": "string", // optional
  "parameter3": "string", // optional
  "parameter4": "string", // optional
  "parameter5": "string"  // optional
}
```

#### PUT /api/connections/{id}
**Amaç**: Bağlantı bilgilerini günceller.

#### DELETE /api/connections/{id}
**Amaç**: Bağlantı kaydını siler.

### 13. Company Addresses Controller (/api/companyaddresses)

#### GET /api/companyaddresses
**Amaç**: Tüm şirket adreslerini listeler.

#### GET /api/companyaddresses/{id}
**Amaç**: Belirtilen adresin detaylarını getirir.

#### POST /api/companyaddresses
**Amaç**: Yeni adres oluşturur.

**Request Model**:
```json
{
  "dealerId": "guid (required)",
  "addressName": "string (required)",
  "country": "string (required)",
  "city": "string (required)",
  "district": "string (required)",
  "town": "string", // optional
  "street": "string (required)",
  "zipCode": "string (required)",
  "apartmentName": "string", // optional
  "apartmentNumber": "string", // optional
  "doorNumber": "string", // optional
  "emailAddress": "string", // optional
  "website": "string", // optional
  "isEInvoiceTaxpayer": false,
  "eInvoiceTransitionDate": "datetime", // optional
  "eInvoiceAlias": "string", // optional
  "isEWaybillTaxpayer": false,
  "eWaybillTransitionDate": "datetime", // optional
  "eWaybillAlias": "string" // optional
}
```

#### PUT /api/companyaddresses/{id}
**Amaç**: Adres bilgilerini günceller.

#### DELETE /api/companyaddresses/{id}
**Amaç**: Adres kaydını siler.

### 14. Company Representatives Controller (/api/companyrepresentatives)

#### GET /api/companyrepresentatives
**Amaç**: Tüm şirket temsilcilerini listeler.

#### GET /api/companyrepresentatives/{id}
**Amaç**: Belirtilen temsilcinin detaylarını getirir.

#### POST /api/companyrepresentatives
**Amaç**: Yeni temsilci oluşturur.

**Request Model**:
```json
{
  "dealerId": "guid (required)",
  "name": "string (required)",
  "lastName": "string (required)",
  "phoneNumber": "string (required)",
  "emailAddress": "string (required)"
}
```

#### PUT /api/companyrepresentatives/{id}
**Amaç**: Temsilci bilgilerini günceller.

#### DELETE /api/companyrepresentatives/{id}
**Amaç**: Temsilci kaydını siler.

### 15. Portal Menus Controller (/api/portalmenus)

#### GET /api/portalmenus
**Amaç**: Tüm portal menülerini listeler.

#### POST /api/portalmenus
**Amaç**: Yeni menü oluşturur.

**Request Model**:
```json
{
  "menuCode": "string (required)",
  "menuName": "string (required)"
}
```

### 16. Statistics Controller (/api/statistics)

#### GET /api/statistics/users/count
**Amaç**: Toplam kullanıcı sayısını getirir.

#### GET /api/statistics/apps/active/count
**Amaç**: Aktif uygulama sayısını getirir.

#### GET /api/statistics/licenses/count
**Amaç**: Toplam lisans sayısını getirir.

## Güvenlik ve Yetkilendirme

### JWT Token Yapısı
```json
{
  "sub": "portal-account-id", // PortalAccount.Id
  "username": "kullanici_adi",
  "role": "Admin" // veya boş (normal kullanıcı)
}
```

### Yetkilendirme Kuralları

#### Admin Kullanıcılar
- Tüm endpoint'lere erişim
- Tüm kayıtları görüntüleme ve yönetme
- Bayi kodu kısıtlaması yok

#### Normal Kullanıcılar
- Sadece kendi bayi koduna ait kayıtları görüntüleme
- Müşteri işlemlerinde otomatik filtreleme
- Portal hesap bilgilerinden bayi kodu alınır

### Güvenlik Kontrolleri

#### ApiControllerBase Metodları
```csharp
protected bool IsAdmin()
// JWT token'dan admin kontrolü yapar

protected Guid? TryGetCurrentPortalAccountId()
// JWT token'dan portal hesap ID'sini alır
```

#### Customers Controller Güvenlik
```csharp
// Her müşteri işleminde:
1. TryGetCurrentPortalAccountId() ile kullanıcı ID'si alınır
2. PortalAccount'tan DealerCode alınır
3. Bu DealerCode ile parent bayi bulunur
4. Sadece bu parent bayinin müşterilerine erişim sağlanır
```

## Validasyon Kuralları

### Genel Validasyonlar
1. **Guid Alanları**: Empty Guid kabul edilmez
2. **String Alanları**: Null/empty kontrolü
3. **Email Alanları**: Format kontrolü (entity seviyesinde)
4. **Enum Alanları**: Geçerli değer kontrolü

### Entity Seviyesi Validasyonlar

#### PortalAccount
- Username: Required, Unique, MaxLength(128)
- PasswordHash: Required, MaxLength(512)
- DealerCode: Optional, MaxLength(50)

#### Dealer
- TaxIdentifierNumber: Required
- Title: Required
- City: Required
- District: Required
- CompanyPhoneNumber: Required
- CompanyEmailAddress: Required
- CompanyType: Valid enum value
- DealerCode: Optional

#### User
- Name: Required
- LastName: Required
- Email: Required
- PhoneNumber: Required
- IdentityNumber: Required (TC Kimlik No)

#### License
- StartDate: Required
- EndDate: Optional, must be > StartDate
- RenewalPeriod: Required, > 0
- RenewalPeriodType: Valid enum value

### Controller Seviyesi Validasyonlar

#### AuthController.RegisterAsync
```csharp
// Username kontrolü
if (string.IsNullOrWhiteSpace(username))
    return BadRequest("Kullanıcı adı boş olamaz.");

// Benzersizlik kontrolü
var exists = await _context.PortalAccounts
    .AnyAsync(a => a.Username == username);
if (exists)
    return Conflict("Kullanıcı adı zaten kayıtlı.");
```

#### DealersController.CreateAsync
```csharp
// CompanyType kontrolü
if (!Enum.IsDefined(typeof(CompanyType), request.CompanyType))
    return BadRequest("Geçersiz şirket türü.");

// IsCustomer kontrolü
if (request.IsCustomer)
    throw new InvalidOperationException("Müşteri oluşturma işlemi için /api/customers endpoint'ini kullanın.");
```

#### LicensesController.CreateAsync
```csharp
// RenewalPeriodType kontrolü
if (!Enum.IsDefined(typeof(RenewalPeriodType), request.RenewalPeriodType))
    return BadRequest("Geçersiz yenileme periyot tipi.");
```

## Hata Yönetimi

### Standart Response Formatı
```json
{
  "isSuccess": false,
  "message": "Ana hata mesajı",
  "errors": ["Detay hata 1", "Detay hata 2"],
  "data": null
}
```

### HTTP Status Kodları
- **200 OK**: Başarılı işlemler
- **400 Bad Request**: Validasyon hataları, geçersiz parametreler
- **401 Unauthorized**: JWT token eksik/geçersiz
- **403 Forbidden**: Yetki yetersizliği
- **404 Not Found**: Kayıt bulunamadı
- **409 Conflict**: Benzersizlik ihlali, foreign key hataları
- **500 Internal Server Error**: Beklenmeyen hatalar

### Otomatik Hata Yakalama (ApiControllerBase)

#### Database Hataları
```csharp
// Foreign Key Violation (547)
return (409, "Kayıt ilişkili veriler nedeniyle işlem tamamlanamadı.", errors);

// Unique Constraint Violation (2601, 2627)
return (409, "Kayıt benzersiz alan ile çakıştı.", errors);

// Concurrency Exception
return (409, "Veri başka bir işlem tarafından güncellendi.", errors);
```

#### Validation Hataları
```csharp
// ArgumentException, InvalidOperationException
return (400, exception.Message, Array.Empty<string>());
```

### Özel Hata Mesajları

#### Türkçe Hata Mesajları
- "Kullanıcı adı boş olamaz."
- "Kullanıcı adı zaten kayıtlı."
- "Kullanıcı adı veya şifre hatalı."
- "Hesap pasif durumda. Lütfen yönetici ile iletişime geçin."
- "Bu kayıt için yetkiniz yok."
- "Kayıt bulunamadı."
- "Geçersiz şirket türü."
- "Geçersiz yenileme periyot tipi."

## Frontend Entegrasyon Rehberi

### 1. Authentication Flow

#### Giriş İşlemi
```typescript
interface LoginRequest {
  username: string;
  password: string;
}

interface LoginResponse {
  id: string;
  username: string;
  isActive: boolean;
  isAdmin: boolean;
  menus: Array<{id: string, menuCode: string, menuName: string}>;
  dealerCode: string | null; // ÖNEMLİ: Bu saklanmalı
  token?: string; // JWT endpoint'i için
}

const login = async (credentials: LoginRequest): Promise<LoginResponse> => {
  const response = await fetch('/api/auth/login/jwt', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials)
  });
  
  const result = await response.json();
  
  if (!result.isSuccess) {
    throw new Error(result.message);
  }
  
  // Session bilgilerini sakla
  localStorage.setItem('userSession', JSON.stringify(result.data));
  
  return result.data;
};
```

#### Session Yönetimi
```typescript
interface UserSession {
  id: string;
  username: string;
  isAdmin: boolean;
  dealerCode: string | null;
  token: string;
  menus: Array<{id: string, menuCode: string, menuName: string}>;
}

const getSession = (): UserSession | null => {
  try {
    const sessionData = localStorage.getItem('userSession');
    return sessionData ? JSON.parse(sessionData) : null;
  } catch {
    return null;
  }
};

const clearSession = () => {
  localStorage.removeItem('userSession');
};

const isAuthenticated = (): boolean => {
  const session = getSession();
  return session !== null && session.token !== undefined;
};

const isAdmin = (): boolean => {
  const session = getSession();
  return session?.isAdmin === true;
};
```

### 2. API Client Setup

#### Base API Client
```typescript
class ApiClient {
  private baseUrl = '/api';
  
  private async makeRequest<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<T> {
    const session = getSession();
    
    if (!session?.token) {
      throw new Error('Oturum bulunamadı');
    }
    
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.token}`,
        ...options.headers
      }
    });
    
    if (response.status === 401) {
      clearSession();
      window.location.href = '/login';
      throw new Error('Oturum süresi doldu');
    }
    
    const result = await response.json();
    
    if (!result.isSuccess) {
      throw new Error(result.message);
    }
    
    return result.data;
  }
  
  async get<T>(endpoint: string): Promise<T> {
    return this.makeRequest<T>(endpoint, { method: 'GET' });
  }
  
  async post<T>(endpoint: string, data: any): Promise<T> {
    return this.makeRequest<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }
  
  async put<T>(endpoint: string, data: any): Promise<T> {
    return this.makeRequest<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }
  
  async delete(endpoint: string): Promise<void> {
    await this.makeRequest(endpoint, { method: 'DELETE' });
  }
}

const apiClient = new ApiClient();
```

### 3. Portal Account Management

#### Portal Hesap Oluşturma
```typescript
interface CreatePortalAccountRequest {
  username: string;
  password: string;
  menuIds?: string[];
  dealerId?: string; // ÖNEMLİ: Bayi seçimi
}

interface Dealer {
  id: string;
  title: string;
  dealerCode: string;
  isCustomer: boolean;
}

// Bayi listesi yükleme
const loadDealers = async (): Promise<Dealer[]> => {
  const dealers = await apiClient.get<Dealer[]>('/dealers');
  // Sadece bayileri filtrele (isCustomer: false)
  return dealers.filter(d => !d.isCustomer);
};

// Portal hesap oluşturma
const createPortalAccount = async (request: CreatePortalAccountRequest) => {
  return await apiClient.post('/auth/register', request);
};

// Kullanım örneği
const handleCreateAccount = async (formData: any) => {
  try {
    const dealers = await loadDealers();
    
    const request: CreatePortalAccountRequest = {
      username: formData.username,
      password: formData.password,
      menuIds: formData.selectedMenuIds,
      dealerId: formData.selectedDealerId // Mutlaka seçilmeli
    };
    
    const result = await createPortalAccount(request);
    console.log('Atanan bayi kodu:', result.dealerCode);
    
  } catch (error) {
    console.error('Hata:', error.message);
  }
};
```

### 4. Customer Management

#### Müşteri Listeleme
```typescript
interface Customer {
  id: string;
  taxIdentifierNumber: string;
  title: string;
  companyType: number;
  city: string;
  district: string;
  companyPhoneNumber: string;
  companyEmailAddress: string;
  isCustomer: boolean;
  dealerCode: string;
  userIds: string[];
}

const loadCustomers = async (): Promise<Customer[]> => {
  // Backend otomatik olarak bayi koduna göre filtreler
  return await apiClient.get<Customer[]>('/customers');
};
```

#### Müşteri Oluşturma
```typescript
interface CreateCustomerRequest {
  taxIdentifierNumber: string;
  title: string;
  companyType: number;
  city: string;
  district: string;
  companyPhoneNumber: string;
  companyEmailAddress: string;
  isCustomer: boolean; // Her zaman true
  dealerCode?: string; // Backend atar, gönderilmemeli
  userIds: string[];
}

const createCustomer = async (request: Omit<CreateCustomerRequest, 'isCustomer' | 'dealerCode'>) => {
  const customerRequest: CreateCustomerRequest = {
    ...request,
    isCustomer: true, // Otomatik true
    // dealerCode gönderilmez, backend atar
  };
  
  return await apiClient.post<Customer>('/customers', customerRequest);
};
```

### 5. Error Handling

#### Global Error Handler
```typescript
interface ApiError {
  message: string;
  errors?: string[];
  statusCode?: number;
}

const handleApiError = (error: any): ApiError => {
  if (error.response) {
    const { status, data } = error.response;
    
    return {
      message: data.message || 'Bir hata oluştu',
      errors: data.errors || [],
      statusCode: status
    };
  }
  
  return {
    message: error.message || 'Beklenmeyen bir hata oluştu',
    errors: []
  };
};

// Kullanım örneği
const safeApiCall = async <T>(apiCall: () => Promise<T>): Promise<T | null> => {
  try {
    return await apiCall();
  } catch (error) {
    const apiError = handleApiError(error);
    
    // Hata tipine göre işlem
    switch (apiError.statusCode) {
      case 401:
        clearSession();
        window.location.href = '/login';
        break;
      case 403:
        alert('Bu işlem için yetkiniz yok.');
        break;
      case 404:
        alert('Kayıt bulunamadı.');
        break;
      case 409:
        alert('Bu kayıt zaten mevcut veya ilişkili kayıtlar var.');
        break;
      default:
        alert(apiError.message);
    }
    
    return null;
  }
};
```

### 6. Form Validation

#### Client-Side Validations
```typescript
interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: any) => string | null;
}

interface ValidationRules {
  [key: string]: ValidationRule;
}

const validateForm = (data: any, rules: ValidationRules): string[] => {
  const errors: string[] = [];
  
  Object.entries(rules).forEach(([field, rule]) => {
    const value = data[field];
    
    if (rule.required && (!value || value.toString().trim() === '')) {
      errors.push(`${field} alanı zorunludur.`);
      return;
    }
    
    if (value && rule.minLength && value.toString().length < rule.minLength) {
      errors.push(`${field} en az ${rule.minLength} karakter olmalıdır.`);
    }
    
    if (value && rule.maxLength && value.toString().length > rule.maxLength) {
      errors.push(`${field} en fazla ${rule.maxLength} karakter olmalıdır.`);
    }
    
    if (value && rule.pattern && !rule.pattern.test(value.toString())) {
      errors.push(`${field} geçerli formatta değil.`);
    }
    
    if (value && rule.custom) {
      const customError = rule.custom(value);
      if (customError) {
        errors.push(customError);
      }
    }
  });
  
  return errors;
};

// Kullanım örneği - Portal hesap validasyonu
const portalAccountRules: ValidationRules = {
  username: {
    required: true,
    minLength: 3,
    maxLength: 128,
    pattern: /^[a-zA-Z0-9_]+$/
  },
  password: {
    required: true,
    minLength: 6,
    custom: (value) => {
      if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(value)) {
        return 'Şifre en az bir büyük harf, bir küçük harf ve bir rakam içermelidir.';
      }
      return null;
    }
  },
  selectedDealerId: {
    required: true,
    custom: (value) => {
      if (!value || value === '') {
        return 'Lütfen bir bayi seçin.';
      }
      return null;
    }
  }
};

// Müşteri validasyonu
const customerRules: ValidationRules = {
  taxIdentifierNumber: {
    required: true,
    pattern: /^\d{10,11}$/,
    custom: (value) => {
      if (value && !/^\d{10,11}$/.test(value)) {
        return 'Vergi kimlik numarası 10 veya 11 haneli olmalıdır.';
      }
      return null;
    }
  },
  title: {
    required: true,
    minLength: 2,
    maxLength: 200
  },
  companyPhoneNumber: {
    required: true,
    pattern: /^[\+]?[\d\s\-\(\)]{10,}$/
  },
  companyEmailAddress: {
    required: true,
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  }
};
```

### 7. Component Examples

#### Portal Hesap Oluşturma Komponenti
```typescript
const CreatePortalAccountForm = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    selectedDealerId: '',
    selectedMenuIds: []
  });
  
  const [dealers, setDealers] = useState<Dealer[]>([]);
  const [menus, setMenus] = useState<PortalMenu[]>([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  
  useEffect(() => {
    const loadData = async () => {
      try {
        const [dealersData, menusData] = await Promise.all([
          loadDealers(),
          apiClient.get<PortalMenu[]>('/portalmenus')
        ]);
        
        setDealers(dealersData);
        setMenus(menusData);
      } catch (error) {
        console.error('Veri yükleme hatası:', error);
      }
    };
    
    loadData();
  }, []);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validasyon
    const validationErrors = validateForm(formData, portalAccountRules);
    
    if (formData.password !== formData.confirmPassword) {
      validationErrors.push('Şifreler eşleşmiyor.');
    }
    
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }
    
    setLoading(true);
    setErrors([]);
    
    try {
      const request: CreatePortalAccountRequest = {
        username: formData.username,
        password: formData.password,
        menuIds: formData.selectedMenuIds,
        dealerId: formData.selectedDealerId
      };
      
      const result = await createPortalAccount(request);
      
      alert(`Portal hesabı başarıyla oluşturuldu. Bayi kodu: ${result.dealerCode}`);
      
      // Form temizle
      setFormData({
        username: '',
        password: '',
        confirmPassword: '',
        selectedDealerId: '',
        selectedMenuIds: []
      });
      
    } catch (error) {
      setErrors([error.message]);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit}>
      {errors.length > 0 && (
        <div className="error-messages">
          {errors.map((error, index) => (
            <div key={index} className="error">{error}</div>
          ))}
        </div>
      )}
      
      <div>
        <label>Kullanıcı Adı:</label>
        <input
          type="text"
          value={formData.username}
          onChange={(e) => setFormData({...formData, username: e.target.value})}
          required
        />
      </div>
      
      <div>
        <label>Şifre:</label>
        <input
          type="password"
          value={formData.password}
          onChange={(e) => setFormData({...formData, password: e.target.value})}
          required
        />
      </div>
      
      <div>
        <label>Şifre Tekrar:</label>
        <input
          type="password"
          value={formData.confirmPassword}
          onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
          required
        />
      </div>
      
      <div>
        <label>Bayi Seçimi:</label>
        <select
          value={formData.selectedDealerId}
          onChange={(e) => setFormData({...formData, selectedDealerId: e.target.value})}
          required
        >
          <option value="">Bayi seçin...</option>
          {dealers.map(dealer => (
            <option key={dealer.id} value={dealer.id}>
              {dealer.title} ({dealer.dealerCode})
            </option>
          ))}
        </select>
      </div>
      
      <div>
        <label>Menüler:</label>
        {menus.map(menu => (
          <label key={menu.id}>
            <input
              type="checkbox"
              checked={formData.selectedMenuIds.includes(menu.id)}
              onChange={(e) => {
                if (e.target.checked) {
                  setFormData({
                    ...formData,
                    selectedMenuIds: [...formData.selectedMenuIds, menu.id]
                  });
                } else {
                  setFormData({
                    ...formData,
                    selectedMenuIds: formData.selectedMenuIds.filter(id => id !== menu.id)
                  });
                }
              }}
            />
            {menu.menuName}
          </label>
        ))}
      </div>
      
      <button type="submit" disabled={loading}>
        {loading ? 'Oluşturuluyor...' : 'Portal Hesabı Oluştur'}
      </button>
    </form>
  );
};
```

#### Müşteri Listeleme Komponenti
```typescript
const CustomerList = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const loadCustomers = async () => {
      try {
        const data = await safeApiCall(() => apiClient.get<Customer[]>('/customers'));
        if (data) {
          setCustomers(data);
        }
      } catch (error) {
        setError('Müşteriler yüklenirken hata oluştu.');
      } finally {
        setLoading(false);
      }
    };
    
    loadCustomers();
  }, []);
  
  const handleDelete = async (customerId: string) => {
    if (!confirm('Bu müşteriyi silmek istediğinizden emin misiniz?')) {
      return;
    }
    
    try {
      await safeApiCall(() => apiClient.delete(`/customers/${customerId}`));
      setCustomers(customers.filter(c => c.id !== customerId));
      alert('Müşteri başarıyla silindi.');
    } catch (error) {
      alert('Müşteri silinirken hata oluştu.');
    }
  };
  
  if (loading) return <div>Yükleniyor...</div>;
  if (error) return <div className="error">{error}</div>;
  
  return (
    <div>
      <h2>Müşteriler</h2>
      
      {customers.length === 0 ? (
        <p>Henüz müşteri bulunmuyor.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Vergi No</th>
              <th>Ünvan</th>
              <th>Şehir</th>
              <th>İlçe</th>
              <th>Telefon</th>
              <th>E-posta</th>
              <th>Bayi Kodu</th>
              <th>İşlemler</th>
            </tr>
          </thead>
          <tbody>
            {customers.map(customer => (
              <tr key={customer.id}>
                <td>{customer.taxIdentifierNumber}</td>
                <td>{customer.title}</td>
                <td>{customer.city}</td>
                <td>{customer.district}</td>
                <td>{customer.companyPhoneNumber}</td>
                <td>{customer.companyEmailAddress}</td>
                <td>{customer.dealerCode}</td>
                <td>
                  <button onClick={() => window.location.href = `/customers/${customer.id}/edit`}>
                    Düzenle
                  </button>
                  <button onClick={() => handleDelete(customer.id)}>
                    Sil
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      
      <button onClick={() => window.location.href = '/customers/create'}>
        Yeni Müşteri Ekle
      </button>
    </div>
  );
};
```

## Kritik Noktalar ve Dikkat Edilmesi Gerekenler

### 1. Bayi-Müşteri İlişkisi
- **Portal hesap oluştururken mutlaka bayi seçilmeli**
- **Müşteri oluştururken DealerCode frontend'den gönderilmemeli**
- **Müşteri listeleme otomatik olarak bayi koduna göre filtrelenir**

### 2. Güvenlik
- **JWT token her API çağrısında gönderilmeli**
- **Admin kontrolü backend'de yapılır**
- **Bayi kodu kontrolü otomatik yapılır**

### 3. Validasyon
- **Frontend ve backend validasyonu birlikte yapılmalı**
- **Enum değerleri kontrol edilmeli**
- **Required alanlar mutlaka doldurulmalı**

### 4. Hata Yönetimi
- **Tüm API çağrıları try-catch ile sarılmalı**
- **HTTP status kodlarına göre uygun aksiyonlar alınmalı**
- **Kullanıcı dostu hata mesajları gösterilmeli**

### 5. Performance
- **Gereksiz API çağrılarından kaçınılmalı**
- **Loading state'leri gösterilmeli**
- **Pagination implementasyonu düşünülmeli (büyük listeler için)**

Bu dokümantasyon, OTP Identity API sisteminin tüm detaylarını içermektedir ve AI Agent'ın sistemi tam olarak anlaması ve doğru şekilde entegre etmesi için gerekli tüm bilgileri sağlamaktadır.
