// ====== KONFIGURASI ======

// 1) URL Web App Google Apps Script
const SCRIPT_URL = "PASTE_APPS_SCRIPT_WEBAPP_URL"; // ganti dengan URL Apps Script

// 2) Nomor WA Admin Pusat
const ADMIN_PUSAT = "62816787977"; // ganti dengan nomor admin pusat

// 3) Nomor WA Admin per Majlis
const ADMIN_WILAYAH = {
  "Ar-Rahman": "628xxxxxx01",
  "Ar-Rohim": "6285777233022",
  "Al-Qudus": "6281213922899",
  "Al-Malik": "628xxxxxx04",
  "Nurul Salikin": "628xxxxxx05",
  "Nurul Kamilah": "628xxxxxx06",
  "Nurul Hakim": "628xxxxxx07",
  "Nurul Hikmah": "628xxxxxx08",
  "Barakotaul Anbiya": "628xxxxxx09"
};

// ====== UI Helper (pilih metode pembayaran) ======
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

if (form) {
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const nama = form.nama_sulthon.value.trim();
    const majlis = form.majlis.value;
    const metode = (new FormData(form)).get("pembayaran");

    if (!nama || !majlis || !metode) {
      alert("Mohon lengkapi semua isian.");
      return;
    }

    const payload = {
      timestamp: new Date().toISOString(),
      nama_sulthon: nama,
      majlis,
      metode_pembayaran: metode
    };

    // tentukan admin tujuan
    let noAdmin = ADMIN_PUSAT;
    if (metode === "Cicilan") {
      noAdmin = ADMIN_WILAYAH[majlis] || ADMIN_PUSAT;
    }

    // pesan WA
    const pesan = `Assalamualaikum, saya ingin mendaftar Kajian Pembekalan Ashnaf Part 2.
    *NAMA:* ${nama}
    *MAJLIS:* ${majlis}
    *METODE:* ${metode}`;

    const waURL = `https://wa.me/${noAdmin}?text=${encodeURIComponent(pesan)}`;

    // redirect
    window.location.href = waURL;
    
    try {
      await fetch(SCRIPT_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      // redirect langsung ke WA
      window.location.href = waURL;

      // jika gagal auto-buka WA, tampilkan modal fallback
      setTimeout(() => {
        if (document.visibilityState === "visible") {
          waLink.href = waURL;
          modal.classList.remove("hidden");
          modal.classList.add("flex");
        }
      }, 1200);

    } catch (err) {
      // fallback jika Apps Script gagal
      const waURLFail = `https://wa.me/${noAdmin}?text=${pesan}%0A%0A(Peringatan: Sistem gagal mencatat otomatis, mohon admin bantu catat.)`;
      window.location.href = waURLFail;

      setTimeout(() => {
        waLink.href = waURLFail;
        modal.classList.remove("hidden");
        modal.classList.add("flex");
      }, 1200);
    }
  });
}
