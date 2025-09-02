// ====== KONFIGURASI ======

// 1) URL Web App Google Apps Script
const SCRIPT_URL = "PASTE_APPS_SCRIPT_WEBAPP_URL";

// 2) Nomor WA Admin Pusat
const ADMIN_PUSAT = "62816787977";

// 3) Nomor WA Admin per Majlis
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

// ====== Toggle Hero & Form ======
const btnDaftar = document.getElementById("btnDaftar");
const hero = document.getElementById("hero");
const formSection = document.getElementById("formSection");

btnDaftar.addEventListener("click", () => {
  hero.classList.add("hidden");
  formSection.classList.remove("hidden");
  window.scrollTo({ top: 0, behavior: "smooth" });
});

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

  let noAdmin = ADMIN_PUSAT;
  if (metode === "Cicilan") {
    noAdmin = ADMIN_WILAYAH[majlis] || ADMIN_PUSAT;
  }

  const pesan =
    `Assalamualaikum, saya ${nama} sudah mendaftar Kajian Pembekalan Ashnaf.%0A` +
    `Metode pembayaran: ${metode}%0A` +
    `Majlis: ${majlis}%0A` +
    `Catatan: Acara 21 September 2025.`;

  const waURL = `https://wa.me/${noAdmin}?text=${pesan}`;

  try {
    await fetch(SCRIPT_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    window.location.href = waURL;

    setTimeout(() => {
      if (document.visibilityState === "visible") {
        waLink.href = waURL;
        modal.classList.remove("hidden");
        modal.classList.add("flex");
      }
    }, 1200);

  } catch (err) {
    const waURLFail = `https://wa.me/${noAdmin}?text=${pesan}%0A%0A(Peringatan: Sistem gagal mencatat otomatis, mohon admin bantu catat.)`;
    window.location.href = waURLFail;

    setTimeout(() => {
      waLink.href = waURLFail;
      modal.classList.remove("hidden");
      modal.classList.add("flex");
    }, 1200);
  }
});
