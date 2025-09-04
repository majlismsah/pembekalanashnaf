// ====== KONFIGURASI ======

// 1) URL Web App Google Apps Script
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzGbOvpHzHWxp7KmQpr7JzAdZxPHraWiH9NLb9MUJCdjSudtC-xPtZZHQL3M_dQU3Y0/exec";

// 2) Nomor WA Admin Pusat
const ADMIN_PUSAT = "62816787977";

// 3) Nomor WA Admin per Majlis
const ADMIN_WILAYAH = {
  "Ar-Rahman": "6285884025983",
  "Ar-Rohim": "6281293936872",
  "Al-Qudus": "6281213922899",
  "Al-Malik": "6285714932581",
  "Nurul Salikin": "6282133731320",
  "Nurul Kamilah": "6281298719222",
  "Nurul Hakim": "6281931880041",
  "Nurul Hikmah": "628xxxxxx08",
  "Barakotaul Anbiya": "6285213347126"
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
  let value = inputNomorWa.value.replace(/[^0-9]/g, '');

  if (value.startsWith('0')) {
    value = '62' + value.substring(1);
  } else if (value.length > 0 && !value.startsWith('62')) {
    value = '62' + value;
  }

  inputNomorWa.value = value; // pastikan tersimpan hasil format
  const newLength = value.length;
  inputNomorWa.setSelectionRange(newLength, newLength);
});

// ====== Submit Form ======
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

  // === Arahkan ke admin wilayah (fallback pusat)
  let noAdmin = ADMIN_WILAYAH[majlis] || ADMIN_PUSAT;

  const pesan =
    `Assalamualaikum, saya ingin mendaftar Kajian Pembekalan Ashnaf Part 2.%0A` +
    `Nama Sulthon: *${nama}*%0A` +
    `Nomor WhatsApp: *${nomorWa}*%0A` +
    `Majlis: *${majlis}*%0A` +
    `Metode pembayaran: *${metode}*%0A%0A` +
    `InsyaAllah saya siap atas Infaq yg sudah ditentukan`;
  const waURL = `https://wa.me/${noAdmin}?text=${pesan}`;

  try {
    await fetch(SCRIPT_URL, {
      method: "POST",
      mode: "no-cors",
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