// ====== KONFIGURASI ======

// 1) URL Web App Google Apps Script
const SCRIPT_URL = "PASTE_APPS_SCRIPT_WEBAPP_URL";

// 2) Nomor WA Admin Pusat
const ADMIN_PUSAT = "62816787977";

// 3) Nomor WA Admin per Majlis
const ADMIN_WILAYAH = {
  "Ar-Rahman": "62895702926434",
  "Ar-Rohim": "6285777233022",
  "Al-Qudus": "6281213922899",
  "Al-Malik": "6285645276759",
  "Nurul Salikin": "628xxxxxx05",
  "Nurul Kamilah": "6281298719222",
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

// ====== Auto-format Nomor WhatsApp di Form ======
const inputNomorWa = form.nomor_wa;

inputNomorWa.addEventListener('focus', () => {
    if (inputNomorWa.value.length === 0) {
        inputNomorWa.value = '62';
    }
});

inputNomorWa.addEventListener('input', () => {
    let value = inputNomorWa.value;
    // Hapus karakter non-digit kecuali 62 di awal
    value = value.replace(/[^0-9]/g, '');

    if (value.startsWith('0')) {
        value = '62' + value.substring(1);
    } else if (value.length > 0 && !value.startsWith('62')) {
        value = '62' + value;
    }

    // Pastikan kursor tetap di akhir
    const originalLength = inputNomorWa.value.length;
    inputNomorWa.value = value;
    const newLength = inputNomorWa.value.length;
    inputNomorWa.setSelectionRange(newLength, newLength);
});


form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const nama = form.nama_sulthon.value.trim();
  const namaJasad = form.nama_jasad.value.trim();
  const majlis = form.majlis.value;
  const metode = (new FormData(form)).get("pembayaran");
  const nomorWa = inputNomorWa.value.trim();

  if (!nama || !majlis || !metode || !nomorWa) {
    alert("Mohon lengkapi semua isian.");
    return;
  }

  const payload = {
    timestamp: new Date().toISOString(),
    nama_sulthon: nama,
    nama_jasad: namaJasad,
    nomor_wa: nomorWa,
    majlis,
    metode_pembayaran: metode
  };

  let noAdmin = ADMIN_PUSAT;
  if (metode === "Cicilan") {
    noAdmin = ADMIN_WILAYAH[majlis] || ADMIN_PUSAT;
  }

  const pesan =
    `Assalamualaikum, saya ${nama} sudah mendaftar Kajian Pembekalan Ashnaf.%0A` +
    `Nama Jasad: ${namaJasad}%0A` +
    `Nomor WhatsApp: ${nomorWa}%0A` +
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
