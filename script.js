// Note : Khusus Script JS Di Buat Oleh AI 90%

let dataWaktuGlobal = null;
let intervalStatus = null;

document.addEventListener("DOMContentLoaded", () => {
    tampilTanggal();
    mulaiJamRealtime();
    ambilJadwal();

    document.getElementById("btnTampil")
        .addEventListener("click", ambilJadwal);
});

function tampilTanggal() {
    const now = new Date();
    const options = { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    };
    document.getElementById("tanggal").innerText =
        now.toLocaleDateString('id-ID', options);
}

function mulaiJamRealtime() {
    function updateJam() {
        const now = new Date();
        const jam = String(now.getHours()).padStart(2, '0');
        const menit = String(now.getMinutes()).padStart(2, '0');
        const detik = String(now.getSeconds()).padStart(2, '0');

        document.getElementById("jamRealtime").innerText =
            `${jam}:${menit}:${detik}`;
    }

    updateJam();
    setInterval(updateJam, 1000);
}

async function ambilJadwal() {
    const kota = document.getElementById("kota").value;
    const today = new Date();
    const tanggal = today.getDate();
    const bulan = today.getMonth() + 1;
    const tahun = today.getFullYear();

    const url = `https://api.aladhan.com/v1/timingsByCity?city=${kota}&country=Indonesia&method=11&date=${tanggal}-${bulan}-${tahun}`;

    document.getElementById("hasil").innerHTML =
        `<p class="loading">Mengambil data...</p>`;

    try {
        const response = await fetch(url);
        const data = await response.json();
        const waktu = data.data.timings;

        dataWaktuGlobal = {
            Subuh: waktu.Fajr,
            Dzuhur: waktu.Dhuhr,
            Ashar: waktu.Asr,
            Maghrib: waktu.Maghrib,
            Isya: waktu.Isha
        };

        renderJadwal();
        mulaiStatusSholat();
    } catch (error) {
        document.getElementById("hasil").innerHTML =
            `<p class="loading">Gagal mengambil data.</p>`;
    }
}

function renderJadwal() {
    let html = "";

    for (const nama in dataWaktuGlobal) {
        html += `
            <div class="card-waktu" id="card-${nama}">
                <span class="nama">${nama}</span>
                <span class="waktu">${dataWaktuGlobal[nama]}</span>
            </div>
        `;
    }

    html += `
        <div class="card-waktu" style="margin-top:15px;background:rgba(0,255,200,0.15)">
            <span id="statusSholat"></span>
        </div>
    `;

    document.getElementById("hasil").innerHTML = html;
}

function mulaiStatusSholat() {

    if (intervalStatus) clearInterval(intervalStatus);

    intervalStatus = setInterval(() => {

        if (!dataWaktuGlobal) return;

        const now = new Date();
        const waktuList = Object.entries(dataWaktuGlobal);

        let sekarang = null;
        let berikutnya = null;

        // Hapus semua highlight dulu
        document.querySelectorAll(".card-waktu")
            .forEach(card => card.classList.remove("active"));

        for (let i = 0; i < waktuList.length; i++) {

            const [nama, jamStr] = waktuList[i];
            const [jam, menit] = jamStr.split(":");

            const waktuSholat = new Date();
            waktuSholat.setHours(jam, menit, 0);

            if (now >= waktuSholat) {
                sekarang = nama;
            } else {
                berikutnya = {
                    nama: nama,
                    waktu: waktuSholat
                };
                break;
            }
        }

        // Highlight waktu aktif
        if (sekarang) {
            const cardAktif = document.getElementById(`card-${sekarang}`);
            if (cardAktif) cardAktif.classList.add("active");
        }

        if (!berikutnya) {
            const besokSubuh = new Date();
            const [jam, menit] = dataWaktuGlobal.Subuh.split(":");
            besokSubuh.setDate(besokSubuh.getDate() + 1);
            besokSubuh.setHours(jam, menit, 0);

            berikutnya = {
                nama: "Subuh (besok)",
                waktu: besokSubuh
            };
        }

        const selisih = berikutnya.waktu - now;

        const jamSisa = Math.floor(selisih / (1000 * 60 * 60));
        const menitSisa = Math.floor((selisih % (1000 * 60 * 60)) / (1000 * 60));

        document.getElementById("statusSholat").innerText =
            `Sekarang: ${sekarang || "-"} | Menuju ${berikutnya.nama} dalam ${jamSisa} jam ${menitSisa} menit`;

    }, 1000);
}

// ============ NOTIFIKASI ============
// if (Notification.permission !== "granted") {
//   Notification.requestPermission();
// }

// function kirimNotifikasi(namaSholat) {
//   if (Notification.permission === "granted") {
//     new Notification("Waktu Sholat", {
//       body: "Sudah masuk waktu " + namaSholat,
//       icon: "icon.png" // opsional
//     });
//   }
// }

