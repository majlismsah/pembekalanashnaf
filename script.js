// ====== KONFIGURASI ======

// 1) URL Web App Google Apps Script (method doPost JSON)
//    Ganti dengan URL Web App milik Anda (Deploy > Test deployments / New deployment)
const SCRIPT_URL = "PASTE_APPS_SCRIPT_WEBAPP_URL";

// 2) Nomor WA Admin Pusat (untuk pembayaran Full)
const ADMIN_PUSAT = "62816787977";

// 3) Nomor WA Admin per Majlis (placeholder: silakan ganti)
const ADMIN_WILAYAH = {
  "Ar-Rahman": "628xxxxxx01",
  "Ar-Rohim": "628xxxxxx02",
  "Al-Qudus": "628xxxxxx03",
  "Al-Malik": "628xxxxxx04",
  "Nurul Salikin": "628xxxxxx05",
  "Nurul Kamilah": "628xxxxxx06",
  "Nurul Hakim": "628xxxxxx07",
  "Nurul Hikmah": "628xxxxxx08",
  "Barakotaul Anbiya": "628xxxxxx09"
};

// ====== UI Helper (card terpilih) ======
const cards = document.querySelectorAll(".pay-card");
cards.forEach(card => {
  card.addEventListener("click", () => {
    cards.forEach(c => c.classList.remove("selected"));
    card.classList.add("selected");
    const input = card.querySelector('input[type="radio"]');
    if (input) input.checked = true;
  });
});

// ====== Form Submit ======
const form = document.getElementById("daftarForm");
const modal = document.getElementById("successModal");
const waLink = document.getElementById("waLink");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const nama = form.nama_sulthon.value.trim();
  const majlis = form.majlis.value;
  const metode = (new FormData(form)).get("pembayaran"); // "Full" atau "Cicilan"

  if (!nama || !majlis || !metode) {
    alert("Mohon lengkapi semua isian.");
    return;
  }

  // Siapkan payload untuk Spreadsheet
  const payload = {
    timestamp: new Date().toISOString(),
    nama_sulthon: nama,
    majlis,
    metode_pembayaran: metode
  };

  // Tentukan nomor admin tujuan WA
  let noAdmin = ADMIN_PUSAT;
  if (metode === "Cicilan") {
    noAdmin = ADMIN_WILAYAH[majlis] || ADMIN_PUSAT; // fallback ke pusat jika belum diisi
  }

  const pesan =
    `Assalamualaikum, saya ${nama} sudah mendaftar Kajian Pembekalan Ashnaf.%0A` +
    `Metode pembayaran: ${metode}%0A` +
    `Majlis: ${majlis}%0A` +
    `Catatan: Acara 21 September 2025.`;

  const waURL = `https://wa.me/${noAdmin}?text=${pesan}`;

  try {
    // Kirim ke Apps Script (Spreadsheet)
    await fetch(SCRIPT_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    // Redirect otomatis ke WhatsApp
    window.location.href = waURL;

    // Fallback modal (kalau popup/redirect diblokir)
    setTimeout(() => {
      try {
        if (document.visibilityState === "visible") {
          waLink.href = waURL;
          modal.classList.remove("hidden");
          modal.classList.add("flex");
        }
      } catch {}
    }, 1200);

  } catch (err) {
    // Jika gagal simpan, tetap arahkan ke WA dengan pemberitahuan
    const waURLFail = `https://wa.me/${noAdmin}?text=${pesan}%0A%0A(Peringatan: Sistem gagal mencatat otomatis, mohon admin bantu catat.)`;
    window.location.href = waURLFail;

    setTimeout(() => {
      waLink.href = waURLFail;
      modal.classList.remove("hidden");
      modal.classList.add("flex");
    }, 1200);
  }
});
