let musicFolderHandle = null;

// ====== Restaurar pasta previamente selecionada ======
window.addEventListener("DOMContentLoaded", async () => {
  const storedHandle = await getStoredFolderHandle();
  if (storedHandle && await verifyPermission(storedHandle)) {
    musicFolderHandle = storedHandle;
    document.getElementById("pastaStatus").textContent = `Pasta carregada automaticamente: ${musicFolderHandle.name} ✅`;
  }
});

// ====== Selecionar pasta ======
document.getElementById("selecionarPasta").addEventListener("click", async () => {
  try {
    musicFolderHandle = await window.showDirectoryPicker();
    await saveFolderHandle(musicFolderHandle);
    document.getElementById("pastaStatus").textContent = `Pasta selecionada: ${musicFolderHandle.name} ✅`;
  } catch {
    alert("Seleção de pasta cancelada ou não suportada.");
  }
});

// ====== Gerar JSON da letra ======
document.getElementById("processar").addEventListener("click", () => {
  const titulo = document.getElementById("titulo").value.trim();
  const artista = document.getElementById("artista").value.trim();
  const letra = document.getElementById("letra").value.trim();

  if (!titulo || !artista || !letra) {
    alert("Preencha pelo menos título, artista e letra!");
    return;
  }

  // Nomes automáticos de voz e PB
  const vozJSON = `${titulo}-voz`.replace(/\s+/g, " ");
  const pbJSON = `${titulo}-pb`.replace(/\s+/g, " ");
  const letraFormatada = letra.replace(/"/g, '\\"').replace(/\r?\n/g, "\\n");

  const musica = `{
  "id":0,
  "titulo":"${titulo}",
  "artista":"${artista}",
  "letra":"${letraFormatada}",
  "voz":"musicas/${vozJSON}.mp3",
  "pb":"musicas/${pbJSON}.mp3"
}`;

  document.getElementById("resultado").value = musica;
  document.getElementById("vozNameJSON").value = vozJSON;
  document.getElementById("pbNameJSON").value = pbJSON;
  alert("Letra gerada com sucesso! Nomes de voz e PB adicionados automaticamente.");
});

// ====== Copiar música para pasta (corrigido) ======
document.getElementById("copiarMusica").addEventListener("click", async () => {
  const musicaInput = document.getElementById("musica");
  const musicaFile = musicaInput.files[0];
  const musicaName = document.getElementById("musicaName").value.trim();

  if (!musicaFile || !musicaName) {
    alert("Selecione uma música e insira o novo nome!");
    return;
  }

  if (!musicFolderHandle) {
    alert("Selecione a pasta 'musicas' antes de copiar a música!");
    return;
  }

  try {
    // Lê o arquivo como ArrayBuffer antes de salvar
    const arrayBuffer = await musicaFile.arrayBuffer();

    const fileHandle = await musicFolderHandle.getFileHandle(`${musicaName}.mp3`, { create: true });
    const writable = await fileHandle.createWritable();
    await writable.write(arrayBuffer); // escreve a cópia do arquivo
    await writable.close();

    alert("Música copiada com sucesso!");
    musicaInput.value = ""; // limpa input após salvar
    document.getElementById("musicaName").value = "";
  } catch (err) {
    console.error(err);
    alert("Erro ao copiar a música. Verifique permissões do navegador.");
  }
});

// ====== Funções de persistência ======
async function saveFolderHandle(handle) {
  const db = await openDB();
  const tx = db.transaction("folders", "readwrite");
  tx.objectStore("folders").put(handle, "musicFolder");
  await tx.complete;
}

async function getStoredFolderHandle() {
  const db = await openDB();
  const tx = db.transaction("folders", "readonly");
  const handle = await tx.objectStore("folders").get("musicFolder");
  await tx.complete;
  return handle;
}

async function verifyPermission(handle) {
  const options = { mode: "readwrite" };
  if ((await handle.queryPermission(options)) === "granted") return true;
  if ((await handle.requestPermission(options)) === "granted") return true;
  return false;
}

function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("MusicSystemDB", 1);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains("folders")) {
        db.createObjectStore("folders");
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}
