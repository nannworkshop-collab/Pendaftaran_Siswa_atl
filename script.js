const form = document.getElementById("formPendaftaran");
const statusText = document.getElementById("status");
const STORAGE_KEY = "dataSiswa";

/* Membaca data yang tersimpan di browser */
function getDaftarSiswa() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    return Array.isArray(saved) ? saved : [];
  } catch (error) {
    console.error("Gagal membaca data:", error);
    return [];
  }
}

/* Mengamankan nilai saat membuat CSV */
function escapeCSV(value) {
  let text = String(value ?? "");

  // Mencegah teks yang diawali karakter formula diperlakukan sebagai formula Excel.
  if (/^[=+\-@\t\r]/.test(text)) {
    text = "'" + text;
  }

  return '"' + text.replace(/"/g, '""') + '"';
}

/* Membuat dan mengunduh CSV dari seluruh data lokal */
function downloadCSV(records) {
  const rows = [
    ["Nama Lengkap", "Jenis Kelamin", "Jurusan", "Alamat"],
    ...records.map((student) => [
      student.nama,
      student.kelamin,
      student.jurusan,
      student.alamat
    ])
  ];

  const csv = rows
    .map((row) => row.map(escapeCSV).join(","))
    .join("\r\n");

  const blob = new Blob(["\uFEFF" + csv], {
    type: "text/csv;charset=utf-8;"
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "Data_Pendaftaran_Siswa.csv";

  document.body.appendChild(link);
  link.click();
  link.remove();

  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/* Memproses formulir */
form.addEventListener("submit", (event) => {
  event.preventDefault();

  const formData = new FormData(form);

  const student = {
    nama: String(formData.get("nama") || "").trim(),
    kelamin: String(formData.get("kelamin") || ""),
    jurusan: String(formData.get("jurusan") || ""),
    alamat: String(formData.get("alamat") || "").trim()
  };

  if (!student.nama || !student.kelamin ||
      !student.jurusan || !student.alamat) {
    statusText.textContent = "Lengkapi semua kolom terlebih dahulu.";
    return;
  }

  const daftarSiswa = getDaftarSiswa();
  daftarSiswa.push(student);

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(daftarSiswa));
  } catch (error) {
    console.error("Gagal menyimpan data:", error);
    statusText.textContent = "Penyimpanan browser gagal. Periksa ruang penyimpanan.";
    return;
  }

  downloadCSV(daftarSiswa);

  statusText.textContent =
    `Pendaftaran tersimpan di browser. Total data: ${daftarSiswa.length}. CSV diunduh.`;

  form.reset();
});
